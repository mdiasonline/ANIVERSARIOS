import React, { useRef, useState } from 'react';
import { Birthday } from '../types';
import html2canvas from 'html2canvas';

interface ShareBirthdayModalProps {
    birthday: Birthday | null;
    onClose: () => void;
}

const ShareBirthdayModal: React.FC<ShareBirthdayModalProps> = ({ birthday, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    if (!birthday) return null;

    const handleShare = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            // Generate Image
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // Retinax2 quality
                backgroundColor: null,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setLoading(false);
                    return;
                }

                const file = new File([blob], `aniversario_${birthday.name.split(' ')[0]}.png`, { type: 'image/png' });

                // Always download Image and Redirect to WhatsApp (User Request)
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `aniversario_${birthday.name}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Open WhatsApp Web with text and phone number
                const message = `Parabéns, ${birthday.name}! 🥳✨\n(Estou enviando um cartão especial para você!)`;
                let cleanPhone = birthday.phone.replace(/\D/g, '');
                // Ensure we don't double the country code
                if (!cleanPhone.startsWith('55')) {
                    cleanPhone = `55${cleanPhone}`;
                }

                const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');

                onClose();
                setLoading(false);
            }, 'image/png');

        } catch (error) {
            console.error('Error generating card:', error);
            setLoading(false);
            alert('Não foi possível gerar o cartão. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Header */}
                <div className="p-6 text-center pb-2">
                    <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Envie um Cartão! 🎉</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Seu cartão foi gerado automaticamente.
                    </p>
                </div>

                {/* Preview Area (This is what gets captured) */}
                <div className="flex justify-center p-4">
                    <div
                        ref={cardRef}
                        className="relative w-[340px] h-[580px] bg-white overflow-hidden shadow-lg flex flex-col"
                    >
                        {/* Top: Photo Area */}
                        <div className="relative h-[55%] w-full overflow-hidden">
                            {birthday.photo_url ? (
                                <img
                                    src={birthday.photo_url}
                                    alt={birthday.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-400 text-6xl">person</span>
                                </div>
                            )}

                            {/* Gradient Overlay for text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
                        </div>

                        {/* Wave SVG Transitions */}
                        <div className="absolute top-[48%] left-0 w-full z-10 leading-none">
                            {/* Gray Shadow Wave */}
                            <svg className="w-full h-24 absolute -top-1 left-0 z-0 opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill="#9ca3af" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                            {/* Main White Wave */}
                            <svg className="w-full h-24 relative z-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </div>

                        {/* Balloons - Top Right */}
                        <div className="absolute top-[-20px] right-[-20px] z-20 pointer-events-none">
                            <div className="relative w-48 h-64">
                                {/* Balloon 1 */}
                                <div className="absolute top-10 right-20 w-24 h-28 bg-[radial-gradient(circle_at_30%_30%,_#ff6b6b,_#ec1313,_#8a0a0a)] rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] shadow-[2px_10px_20px_rgba(0,0,0,0.3)] rotate-[-15deg] z-20">
                                    <div className="absolute top-[20%] left-[20%] w-4 h-8 bg-white/40 rounded-[50%] blur-[2px] rotate-[-15deg]"></div>
                                    <div className="absolute bottom-[-10px] left-[50%] -translate-x-1/2 w-1 h-20 bg-gray-400/50"></div>
                                </div>
                                {/* Balloon 2 */}
                                <div className="absolute top-32 right-10 w-28 h-32 bg-[radial-gradient(circle_at_30%_30%,_#ff6b6b,_#ec1313,_#8a0a0a)] rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] shadow-[2px_10px_20px_rgba(0,0,0,0.3)] rotate-[10deg] z-30">
                                    <div className="absolute top-[20%] left-[20%] w-5 h-10 bg-white/40 rounded-[50%] blur-[2px] rotate-[-15deg]"></div>
                                    <div className="absolute bottom-[-10px] left-[50%] -translate-x-1/2 w-1 h-20 bg-gray-400/50"></div>
                                </div>
                                {/* Balloon 3 */}
                                <div className="absolute top-0 right-4 w-20 h-24 bg-[radial-gradient(circle_at_30%_30%,_#ff6b6b,_#ec1313,_#8a0a0a)] rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] shadow-[2px_10px_20px_rgba(0,0,0,0.3)] rotate-[5deg] z-10 opacity-90">
                                    <div className="absolute top-[20%] left-[20%] w-3 h-6 bg-white/40 rounded-[50%] blur-[2px] rotate-[-15deg]"></div>
                                    <div className="absolute bottom-[-10px] left-[50%] -translate-x-1/2 w-1 h-20 bg-gray-400/50"></div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Icon */}
                        <div className="absolute top-[45%] right-8 z-30 transform rotate-6">
                            <div className="w-24 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden">
                                <div className="bg-gradient-to-b from-[#ec1313] to-[#c40b0b] h-8 flex items-center justify-center relative">
                                    <div className="absolute -top-3 left-3 w-1.5 h-6 bg-gray-300 rounded-full border border-white"></div>
                                    <div className="absolute -top-3 right-3 w-1.5 h-6 bg-gray-300 rounded-full border border-white"></div>
                                    <span className="text-white text-xs font-black uppercase tracking-widest">
                                        {new Date(birthday.date + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                                    </span>
                                </div>
                                <div className="h-16 flex items-center justify-center">
                                    <span className="text-[#ec1313] text-4xl font-black tracking-tighter">
                                        {birthday.date.split('-')[2]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Content Area */}
                        <div className="flex-1 bg-white relative z-20 flex flex-col items-center pt-2 px-6 pb-6 mt-6">

                            {/* Typography Group */}
                            <div className="relative text-center w-full mb-4">
                                {/* Parabéns text overlapping the wave */}
                                <h2 className="font-['Satisfy'] text-[72px] leading-none text-white absolute -top-24 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] whitespace-nowrap"
                                    style={{
                                        textShadow: '3px 3px 0px #d4d4d4, -1px -1px 0 #fff'
                                    }}>
                                    Parabéns
                                </h2>

                                {/* Name */}
                                <h1 className="text-[#b91c1c] font-black text-4xl uppercase tracking-wider relative z-20 mt-2 break-words leading-tight">
                                    {birthday.name.split(' ')[0]} <br />
                                    {birthday.name.split(' ').length > 1 && (
                                        <span className="text-3xl">{birthday.name.split(' ').slice(1, 2).join(' ')}</span>
                                    )}
                                </h1>
                            </div>

                            {/* Message */}
                            <div className="text-center space-y-4 max-w-[280px]">
                                <p className="text-[#b91c1c] text-sm font-medium leading-relaxed">
                                    Que este novo ciclo seja repleto de realizações, desafios inspiradores, saúde e muito sucesso.
                                </p>

                                <p className="text-[#b91c1c]/90 text-lg font-extrabold">
                                    Aproveite seu dia!
                                </p>
                            </div>

                            {/* Logo Footer */}
                            <div className="mt-auto pt-6 flex flex-col items-center justify-center gap-1 opacity-90">
                                <div className="flex items-end gap-1">
                                    {/* Flame Icon (SVG approximation) */}
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#ec1313] fill-current" preserveAspectRatio="xMidYMid meet">
                                        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                                    </svg>
                                </div>
                                <span className="text-[#b91c1c] text-[10px] font-bold tracking-[0.2em] uppercase">
                                    Rede RJ MG ES
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-2 flex flex-col gap-3">
                    <button
                        onClick={handleShare}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <i className="fa-brands fa-whatsapp text-xl"></i>
                        )}
                        {loading ? 'Gerando...' : 'Enviar no WhatsApp'}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareBirthdayModal;
