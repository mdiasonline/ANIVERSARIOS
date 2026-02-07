import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import { Birthday } from '../types';
import { formatPhone, formatDate, validateDate, validatePhone, validateEmail } from '../utils';
import { supabase } from '../supabase';

// Add props interface
interface AddProps {
  isEditing?: boolean;
}

const Add: React.FC<AddProps> = ({ isEditing = false }) => {
  const { setCurrentView, addBirthday, updateBirthday, user, selectedBirthday } = useAppContext();

  // Initialize state based on isEditing and selectedBirthday
  // Helper to parse phone into DDI and local number
  const parsePhone = (fullPhone: string) => {
    if (!fullPhone) return { ddi: '+55', number: '' };
    // Check if starts with +
    if (fullPhone.startsWith('+')) {
      // Simple heuristic: Assume DDI is 2 or 3 digits. 
      // Brazil is +55 (3 chars). US is +1 (2 chars). 
      // Let's try to match known DDIs or default to slicing.
      // For now, let's assume standard format +DDI...
      // We'll support a few common ones in the UI, if custom, it might look weird but we try.

      const supportedDDIs = ['+55', '+1', '+351', '+44', '+34', '+33', '+49', '+39', '+81', '+86'];
      for (const ddi of supportedDDIs) {
        if (fullPhone.startsWith(ddi)) {
          return { ddi, number: fullPhone.slice(ddi.length) };
        }
      }
      // Fallback: If starts with +, take first 3 chars as DDI (e.g. +55)
      return { ddi: fullPhone.slice(0, 3), number: fullPhone.slice(3) };
    }
    // Legacy format without + (assumed Brazil local)
    return { ddi: '+55', number: fullPhone };
  };

  const initialPhoneData = isEditing && selectedBirthday ? parsePhone(selectedBirthday.phone) : { ddi: '+55', number: '' };

  const [formData, setFormData] = useState({
    name: isEditing && selectedBirthday ? selectedBirthday.name : '',
    date: isEditing && selectedBirthday ? (() => {
      const [year, month, day] = selectedBirthday.date.split('-');
      return `${day}/${month}/${year}`;
    })() : '',
    phone: initialPhoneData.number,
    email: isEditing && selectedBirthday ? selectedBirthday.email : ''
  });

  const [ddi, setDdi] = useState(initialPhoneData.ddi);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    isEditing && selectedBirthday?.photo_url ? selectedBirthday.photo_url : null
  );

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
    phone?: string;
    email?: string;
  }>({});

  const dateInputRef = useRef<HTMLInputElement>(null);
  const dateTextInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // If editing but no selected birthday (shouldn't happen), go back
  React.useEffect(() => {
    if (isEditing && !selectedBirthday) {
      setCurrentView('HOME');
    }
  }, [isEditing, selectedBirthday, setCurrentView]);

  const handleDateIconClick = () => {
    dateTextInputRef.current?.focus();
    dateInputRef.current?.showPicker();
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value; // YYYY-MM-DD
    if (!dateValue) return;

    const [year, month, day] = dateValue.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    setFormData(prev => ({ ...prev, date: formattedDate }));
    setErrors(prev => ({ ...prev, date: undefined }));
  };

  const handlePhotoClick = () => photoInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('birthday-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('birthday-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  /* Shared Styles */
  const baseInputClass = "flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white dark:bg-[#2a2a2a] h-14 placeholder:text-[#6b7280]/50 p-[15px] text-base font-normal leading-normal transition-all outline-none text-[#1a1a1a] dark:text-white";
  const borderNormalClass = "border border-[#e5e7eb] dark:border-red-900/30";
  const borderErrorClass = "border border-primary";
  const focusClass = "focus:border-primary focus:ring-1 focus:ring-primary";
  const focusWithinClass = "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type, value, name } = e.target;
    let formattedValue = value;

    if (name === 'phone' || type === 'tel') {
      formattedValue = formatPhone(value);
    } else if (name === 'date') {
      formattedValue = formatDate(value);
    }

    setFormData(prev => ({
      ...prev,
      [type === 'email' ? 'email' : name || type]: formattedValue
    }));

    setErrors(prev => ({ ...prev, [name || type]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const fullPhone = `${ddi}${formData.phone.replace(/\D/g, '')}`;

    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!validateDate(formData.date)) newErrors.date = 'Data inválida. Use DD/MM/AAAA.';
    // Validate phone: must have at least 8 digits (local)
    if (formData.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Telefone incompleto.';
    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'E-mail inválido.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setUploading(false);
      return;
    }

    let photo_url = isEditing && selectedBirthday?.photo_url ? selectedBirthday.photo_url : '';
    // If a new photo was selected, upload it
    if (photo) {
      const uploadedUrl = await uploadPhoto(photo);
      if (uploadedUrl) {
        photo_url = uploadedUrl;
      }
    }

    const parts = formData.date.split('/');
    const [day, month, year] = parts;
    const isoDate = `${year}-${month}-${day}`;

    if (isEditing && selectedBirthday) {
      // UPDATE MODE
      const updates: Partial<Birthday> = {
        name: formData.name,
        date: isoDate,
        phone: fullPhone,
        email: formData.email,
        photo_url: photo_url || undefined
      };

      const success = await updateBirthday(selectedBirthday.id, updates);
      setUploading(false);
      if (success) {
        setCurrentView('DETAILS'); // Go back to details to see changes
      }
    } else {
      // CREATE MODE
      const newBirthday: Omit<Birthday, 'id'> = {
        name: formData.name,
        date: isoDate,
        phone: fullPhone,
        email: formData.email,
        photo_url: photo_url || undefined
      };

      const success = await addBirthday(newBirthday);
      setUploading(false);
      if (success) {
        setCurrentView('CONFIRMATION');
      }
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <div
          onClick={() => setCurrentView(isEditing ? 'DETAILS' : 'HOME')}
          className="text-primary cursor-pointer flex size-12 shrink-0 items-center justify-start hover:text-primary-hover"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </div>
        <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          {isEditing ? 'Editar' : 'Cadastrar'}
        </h2>
      </header>

      <main className="flex-1 flex flex-col pb-10">
        <div className="px-4 pt-5 pb-6">
          <h3 className="text-[#1a1a1a] dark:text-white tracking-tight text-3xl font-extrabold leading-tight">
            {isEditing ? 'Editar Aniversariante' : 'Novo Aniversariante'}
          </h3>
          <p className="text-[#6b7280] dark:text-gray-400 text-sm font-medium mt-1">
            {isEditing ? 'Atualize os dados abaixo.' : 'Preencha os dados e adicione uma foto.'}
          </p>
        </div>

        {/* Photo Upload Selection */}
        <div className="flex flex-col items-center mb-6 px-4">
          <div
            onClick={handlePhotoClick}
            className="w-32 h-32 rounded-full bg-white dark:bg-[#2a2a2a] border-2 border-dashed border-[#e5e7eb] dark:border-red-900/30 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors relative group"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="material-symbols-outlined text-4xl text-[#6b7280]/50">add_a_photo</span>
                <span className="text-[10px] font-bold text-[#6b7280]/50 mt-1 uppercase tracking-wider">Foto</span>
              </>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white">edit</span>
            </div>
          </div>
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <div className="px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#1a1a1a] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                Nome Completo
              </p>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${baseInputClass} ${errors.name ? borderErrorClass : borderNormalClass} ${focusClass}`}
                placeholder="Digite o nome completo"
                type="text"
                required
              />
              {errors.name && <p className="text-primary text-xs font-semibold mt-1">{errors.name}</p>}
            </label>
          </div>

          <div className="px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#1a1a1a] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                Data de Nascimento
              </p>
              <div className={`flex w-full items-stretch rounded-lg bg-white dark:bg-[#2a2a2a] overflow-hidden transition-all h-14 ${errors.date ? borderErrorClass : borderNormalClass} ${focusWithinClass}`}>
                <input
                  ref={dateTextInputRef}
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="flex w-full min-w-0 flex-1 bg-transparent h-full placeholder:text-[#6b7280]/50 p-[15px] text-base font-normal outline-none border-none focus:ring-0 text-[#1a1a1a] dark:text-white"
                  placeholder="DD/MM/AAAA"
                  type="text"
                />
                <input
                  type="date"
                  ref={dateInputRef}
                  className="invisible absolute w-0 h-0"
                  onChange={handleHiddenDateChange}
                  tabIndex={-1}
                />
                <div
                  onClick={handleDateIconClick}
                  className="flex items-center justify-center pr-[15px] cursor-pointer text-[#6b7280] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              {errors.date && <p className="text-primary text-xs font-semibold mt-1">{errors.date}</p>}
            </label>
          </div>

          <div className="px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#1a1a1a] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                Telefone
              </p>
              <div className="flex gap-2">
                <select
                  value={ddi}
                  onChange={(e) => setDdi(e.target.value)}
                  className="w-24 rounded-lg bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-red-900/30 text-[#1a1a1a] dark:text-white h-14 px-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none text-center font-medium"
                  style={{ backgroundImage: 'none' }} // Remove default arrow if desired, or keep it
                >
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+351">🇵🇹 +351</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+86">🇨🇳 +86</option>
                </select>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${baseInputClass} ${errors.phone ? borderErrorClass : borderNormalClass} ${focusClass}`}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              {errors.phone && <p className="text-primary text-xs font-semibold mt-1">{errors.phone}</p>}
            </label>
          </div>

          <div className="px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#1a1a1a] dark:text-gray-200 text-base font-medium leading-normal pb-2">
                E-mail
              </p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${baseInputClass} ${errors.email ? borderErrorClass : borderNormalClass} ${focusClass}`}
                placeholder="exemplo@email.com"
              />
              {errors.email && <p className="text-primary text-xs font-semibold mt-1">{errors.email}</p>}
            </label>
          </div>

          <div className="px-4 py-8 mt-4">
            <button
              type="submit"
              disabled={uploading}
              className={`w-full h-14 bg-primary hover:bg-primary-hover text-white font-extrabold text-lg rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined">{uploading ? 'sync' : 'save'}</span>
              {uploading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar Aniversariante')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView(isEditing ? 'DETAILS' : 'HOME')}
              className="w-full h-12 mt-3 bg-transparent text-[#6b7280] dark:text-gray-400 font-bold text-base transition-colors hover:text-primary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Add;