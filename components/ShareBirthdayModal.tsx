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
                        className="relative w-[340px] h-[580px] bg-[#fbf5e9] overflow-hidden shadow-lg flex flex-col items-center pt-6"
                    >
                        {/* Confetti / Glitter Background */}
                        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                            {/* Random Gold/Brown Dots */}
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        width: `${Math.random() * 6 + 2}px`,
                                        height: `${Math.random() * 6 + 2}px`,
                                        backgroundColor: ['#d4af37', '#c5a028', '#8a6e0a', '#e6c86e'][Math.floor(Math.random() * 4)],
                                        opacity: Math.random() * 0.7 + 0.3,
                                    }}
                                ></div>
                            ))}

                        </div>

                        {/* Balloons - Layered behind/around content */}
                        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                            {/* Top Left - Gold */}
                            <div className="absolute -top-10 -left-10 w-32 h-40 bg-[radial-gradient(circle_at_30%_30%,_#fbf3cf,_#e1c564,_#b89b3e)] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg rotate-[25deg]">
                                <div className="absolute top-[20%] left-[20%] w-6 h-10 bg-white/40 rounded-[50%] blur-[2px] rotate-[-25deg]"></div>
                            </div>

                            {/* Top Right - Pink */}
                            <div className="absolute top-2 -right-12 w-36 h-44 bg-[radial-gradient(circle_at_30%_30%,_#ffdfe6,_#ffabc2,_#e0809b)] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg rotate-[-15deg]">
                                <div className="absolute top-[20%] left-[20%] w-6 h-12 bg-white/40 rounded-[50%] blur-[2px] rotate-[15deg]"></div>
                            </div>

                            {/* Bottom Left - Pink Small */}
                            <div className="absolute bottom-20 -left-8 w-24 h-32 bg-[radial-gradient(circle_at_30%_30%,_#ffdfe6,_#ffabc2,_#e0809b)] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg rotate-[10deg]">
                                <div className="absolute top-[20%] left-[20%] w-4 h-8 bg-white/40 rounded-[50%] blur-[2px] rotate-[-10deg]"></div>
                            </div>

                            {/* Bottom Right - White/Cream */}
                            <div className="absolute bottom-10 -right-10 w-32 h-40 bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#f3f0e6,_#d4d1c9)] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg rotate-[-20deg]">
                                <div className="absolute top-[20%] left-[20%] w-6 h-10 bg-white/60 rounded-[50%] blur-[2px] rotate-[20deg]"></div>
                            </div>
                            {/* Bottom Left Corner - Gold */}
                            <div className="absolute -bottom-8 -left-4 w-28 h-36 bg-[radial-gradient(circle_at_30%_30%,_#fbf3cf,_#e1c564,_#b89b3e)] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg rotate-[35deg]">
                                <div className="absolute top-[20%] left-[20%] w-5 h-8 bg-white/40 rounded-[50%] blur-[2px] rotate-[-35deg]"></div>
                            </div>
                        </div>

                        {/* Photo Frame - Rotated */}
                        <div className="relative z-20 mt-4 rotate-[-3deg]">
                            <div className="bg-white p-3 pb-3 shadow-[0_10px_20px_rgba(0,0,0,0.15)] rounded-2xl w-[220px] h-[260px]">
                                <div className="w-full h-full overflow-hidden rounded-xl bg-gray-200">
                                    {birthday.photo_url ? (
                                        <img
                                            src={birthday.photo_url}
                                            alt={birthday.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined text-6xl">person</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Gold Rectangle Accent on Photo */}
                            <div className="absolute top-20 -right-4 w-8 h-12 border-2 border-[#d4af37]/60 rotate-[15deg] opacity-60"></div>
                            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#d4af37] rotate-[45deg] opacity-20"></div>
                        </div>

                        {/* Typography Content */}
                        <div className="relative z-30 flex flex-col items-center text-center mt-2 w-full px-6">

                            {/* Name */}
                            <h1 className="text-[#3e342b] font-serif font-medium text-3xl tracking-wide mb-1">
                                {birthday.name.split(' ')[0]} {birthday.name.split(' ')[1] }
                            </h1>

                            {/* Parabéns Script */}
                            <h2 className="font-['Satisfy'] text-[#c98d8d] text-5xl leading-none drop-shadow-sm mb-2">
                                Parabéns
                            </h2>

                            {/* Message Body */}
                            <div className="text-[#4a3f35] text-sm leading-relaxed max-w-[260px] font-sans">
                                <p>
                                    Que seu <span className="font-bold">novo ciclo</span> seja <span className="font-bold">incrível</span> e que a vida te traga muitos <span className="font-bold">motivos para sorrir</span>. Você merece!
                                </p>
                            </div>

                            {/* Sign-off */}
                            <h3 className="font-['Satisfy'] text-[#c98d8d] text-2xl mt-4 opacity-90">
                                Feliz Aniversário!
                            </h3>

                            {/* Footer Logo Text */}
                            <div className="mt-4 text-[#8a6e0a] text-sm uppercase tracking-[0.15em] font-medium opacity-80">
                                REDE RJ MG ES
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
