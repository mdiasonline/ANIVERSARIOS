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
                        className="relative w-[320px] h-[500px] bg-white overflow-hidden shadow-lg flex flex-col"
                    >
                        {/* Top: Photo Area with Wave Mask */}
                        <div className="relative h-[65%] w-full">
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

                            {/* Wave SVG (White) positioned at bottom */}
                            <div className="absolute bottom-[-1px] left-0 w-full leading-none">
                                <svg className="w-full h-24" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                    <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                            </div>

                            {/* Balloons (CSS/SVG Mockup since generation failed) */}
                            <div className="absolute top-4 right-2 flex flex-col items-center">
                                {/* Simple CSS Balloons */}
                                <div className="relative">
                                    <div className="w-16 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-[50%] shadow-xl absolute -top-2 -right-6 animate-float-slow opacity-90"></div>
                                    <div className="w-14 h-18 bg-gradient-to-br from-red-500 to-red-700 rounded-[50%] shadow-lg absolute top-4 -right-2 animate-float opacity-95"></div>
                                    <div className="w-12 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-[50%] shadow-md absolute top-8 -right-8 animate-float-fast opacity-90"></div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Icon - Floating over wave */}
                        <div className="absolute top-[55%] right-6 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col w-20 text-center z-20 transform -translate-y-1/2 rotate-3">
                            <div className="bg-primary text-white text-[10px] font-bold py-1 uppercase tracking-widest">
                                {new Date(birthday.date + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                            </div>
                            <div className="text-3xl font-black text-gray-800 py-1">
                                {birthday.date.split('-')[2]}
                            </div>
                        </div>

                        {/* Bottom: Text Content */}
                        <div className="flex-1 bg-white relative z-10 flex flex-col items-center justify-start pt-2 px-6 text-center">

                            {/* Typography Group */}
                            <div className="relative mb-4">
                                <h2 className="font-['Satisfy'] text-6xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative z-10"
                                    style={{
                                        textShadow: '2px 2px 0px #ec1313, -1px -1px 0 #ec1313, 1px -1px 0 #ec1313, -1px 1px 0 #ec1313, 1px 1px 0 #ec1313'
                                    }}>
                                    Parabéns
                                </h2>
                                <h1 className="text-primary font-black text-4xl uppercase tracking-wider relative -mt-6 z-20 drop-shadow-sm">
                                    {birthday.name.split(' ')[0]}
                                </h1>
                            </div>

                            {/* Message */}
                            <p className="text-primary text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
                                Que este novo ciclo seja repleto de realizações, desafios inspiradores, saúde e muito sucesso.
                            </p>

                            <p className="text-primary text-lg font-extrabold mt-4">
                                Aproveite seu dia!
                            </p>

                            {/* Confetti Effects (CSS) */}
                            <div className="absolute top-0 left-4 w-2 h-4 bg-red-400 rotate-45 opacity-60"></div>
                            <div className="absolute bottom-10 right-10 w-2 h-2 bg-red-500 rounded-full opacity-60"></div>
                            <div className="absolute top-1/2 left-10 w-3 h-1 bg-red-300 -rotate-12 opacity-60"></div>
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
