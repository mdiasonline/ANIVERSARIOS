export const getDaysRemaining = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to midnight

  const birthDate = new Date(dateStr);
  // Note: birthDate comes from YYYY-MM-DD string, so new Date(dateStr) depends on browser timezone interpretation
  // Ideally, we treat YYYY-MM-DD as local date parts.
  // Converting the input dateStr parts to local date avoids UTC shifts.
  const [year, month, day] = dateStr.split('-').map(Number);
  const nextBirthday = new Date(today.getFullYear(), month - 1, day);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateAge = (dateStr: string): number => {
  const today = new Date();
  const birthDate = new Date(dateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const getDayMonth = (dateStr: string): string => {
  const date = new Date(dateStr);
  // Adjust for timezone offset for simple date strings
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return `${String(adjustedDate.getDate()).padStart(2, '0')}/${String(adjustedDate.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleString('pt-BR', { month: 'short' });
};

export const getDayNumber = (dateStr: string): string => {
  const date = new Date(dateStr);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return String(adjustedDate.getDate()).padStart(2, '0');
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

  // Handle 12-14 digits (with country code, e.g., 55)
  // Format: +55 (XX) XXXXX-XXXX
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const numberPart1 = digits.slice(4, digits.length - 4);
  const numberPart2 = digits.slice(digits.length - 4);

  return `+${country} (${area}) ${numberPart1}-${numberPart2}`;
};

export const formatDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

export const validateDate = (dateStr: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('/').map(Number);
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const translateError = (error: any): string => {
  const message = error?.message || error?.error_description || (typeof error === 'string' ? error : 'Ocorreu um erro inesperado.');

  // Map of common English errors to Portuguese
  const translations: { [key: string]: string } = {
    'User already registered': 'Este e-mail já está cadastrado.',
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Rate limit exceeded': 'Muitas tentativas. Aguarde um pouco.',
    'Email not confirmed': 'Verifique seu e-mail para validar o cadastro. Em seguida, será necessário aguardar aprovação do administrador.',
    'User not found': 'Usuário não encontrado.',
    'Invalid refresh token': 'Sessão expirada. Faça login novamente.',
    'JWT expired': 'Sessão expirada. Faça login novamente.',
    'Database error': 'Erro no banco de dados. Tente novamente.',
    'Signups not allowed for this instance': 'Novos cadastros estão desativados temporariamente.',
    'New password should be different from the old password.': 'A nova senha deve ser diferente da anterior.',
  };

  // Direct match
  if (translations[message]) {
    return translations[message];
  }

  // Partial match checks
  if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (message.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
  if (message.includes('weak password')) return 'A senha é muito fraca. Use uma senha mais forte.';
  if (message.includes('unique constraint')) return 'Este registro já existe.';
  if (message.includes('violates foreign key')) return 'Erro de referência de dados.';
  if (message.includes('JSON object requested, multiple (or no) rows returned')) return 'Erro ao buscar dados (nenhum ou múltiplos resultados).';
  if (message.toLowerCase().includes('network')) return 'Erro de conexão. Verifique sua internet.';

  return message; // Return original if no translation found
};
