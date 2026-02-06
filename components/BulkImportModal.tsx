import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../supabase';
import { useAppContext } from '../App';

interface BulkImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onSuccess }) => {
    const { user, showConfirm, hideConfirm } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setLogs([]);
        }
    };

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    const handleImport = async () => {
        if (!file || !user) return;
        setLoading(true);
        setLogs([]);
        setProgress(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[];
                let successCount = 0;
                let errorCount = 0;

                addLog(`Iniciando importação de ${rows.length} registros...`);

                const batchSize = 50; // Insert in batches
                const batches = [];
                for (let i = 0; i < rows.length; i += batchSize) {
                    batches.push(rows.slice(i, i + batchSize));
                }

                for (let i = 0; i < batches.length; i++) {
                    const batch = batches[i];
                    const birthdaysToInsert = [];

                    for (const row of batch) {
                        // Normalize keys (case insensitive)
                        const normalizeKey = (obj: any, key: string) => {
                            return obj[key] || obj[key.toLowerCase()] || obj[key.toUpperCase()] || obj[key.charAt(0).toUpperCase() + key.slice(1)];
                        };

                        const name = normalizeKey(row, 'nome') || normalizeKey(row, 'name') || normalizeKey(row, 'Nome');
                        const date = normalizeKey(row, 'data') || normalizeKey(row, 'date') || normalizeKey(row, 'aniversario') || normalizeKey(row, 'nascimento');
                        const phone = normalizeKey(row, 'telefone') || normalizeKey(row, 'celular') || normalizeKey(row, 'phone') || '';
                        const email = normalizeKey(row, 'email') || normalizeKey(row, 'e-mail') || '';

                        if (!name || !date) {
                            errorCount++;
                            addLog(`⚠️ Registro ignorado (dados incompletos): ${JSON.stringify(row)}`);
                            continue;
                        }

                        // Validate date format YYYY-MM-DD
                        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                        if (!dateRegex.test(date)) {
                            // Try to fix common BR format DD/MM/YYYY
                            const brDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                            const match = date.match(brDateRegex);
                            if (match) {
                                birthdaysToInsert.push({
                                    name,
                                    date: `${match[3]}-${match[2]}-${match[1]}`, // Convert to YYYY-MM-DD
                                    phone,
                                    email,
                                    created_by: user.id
                                });
                                successCount++;
                            } else {
                                errorCount++;
                                addLog(`❌ Data inválida (use AAAA-MM-DD): ${name} - ${date}`);
                            }
                        } else {
                            birthdaysToInsert.push({
                                name,
                                date,
                                phone,
                                email,
                                created_by: user.id
                            });
                            successCount++;
                        }
                    }

                    if (birthdaysToInsert.length > 0) {
                        const { error } = await supabase.from('birthdays').insert(birthdaysToInsert);
                        if (error) {
                            addLog(`❌ Erro ao inserir lote ${i + 1}: ${error.message}`);
                            errorCount += birthdaysToInsert.length;
                            successCount -= birthdaysToInsert.length;
                        }
                    }

                    // Update progress
                    setProgress(Math.round(((i + 1) / batches.length) * 100));
                }

                setLoading(false);
                addLog(`✅ Processo finalizado!`);
                addLog(`Sucessos: ${successCount}`);
                addLog(`Falhas: ${errorCount}`);

                if (successCount > 0) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            },
            error: (error) => {
                setLoading(false);
                addLog(`❌ Erro ao ler CSV: ${error.message}`);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-500 dark:text-white rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="p-6 pb-0">
                    <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">Importação em Massa</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Carregue um arquivo CSV para adicionar aniversariantes de uma vez.
                    </p>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                        <h4 className="text-blue-700 dark:text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">info</span>
                            Formato Obrigatório
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                            O arquivo deve ter um cabeçalho com as colunas: <strong>nome, data, telefone, email</strong>.
                        </p>
                        <div className="bg-white dark:bg-black/20 p-2 rounded border border-blue-200 dark:border-blue-800 font-mono text-[10px] text-gray-600 dark:text-gray-400">
                            nome,data,telefone,email<br />
                            João Silva,1990-12-31,11999999999,joao@email.com<br />
                            Maria Souza,1985-05-20,21988888888, maria@email.com
                        </div>
                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-2">
                            * Data deve ser AAAA-MM-DD ou DD/MM/AAAA.
                        </p>
                    </div>

                    {/* File Input */}
                    <div className="mb-6">
                        <label className="block w-full cursor-pointer group">
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <div className={`
                                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors
                                ${file
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                    : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                                }
                            `}>
                                {file ? (
                                    <>
                                        <span className="material-symbols-outlined text-green-500 text-4xl mb-2">description</span>
                                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">{file.name}</p>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-4xl mb-2 transition-colors">upload_file</span>
                                        <p className="font-bold text-gray-600 dark:text-gray-300 text-sm">Clique para selecionar o CSV</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Logs Area */}
                    {logs.length > 0 && (
                        <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-3 max-h-40 overflow-y-auto mb-4 border border-gray-100 dark:border-white/5 font-mono text-[10px]">
                            {logs.map((log, i) => (
                                <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-500' : log.includes('✅') ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 mt-auto">
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="w-full h-12 bg-primary disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Processando {progress}%
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">publish</span>
                                Importar Agora
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
