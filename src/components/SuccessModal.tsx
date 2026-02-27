import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Car } from 'lucide-react';

interface SuccessModalProps {
    onGoToCatalog: () => void;
    onAddAnother: () => void;
}

export default function SuccessModal({ onGoToCatalog, onAddAnother }: SuccessModalProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 className="w-16 h-16 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-2">
                    {t('addVehicle.successTitle', 'Veículo adicionado com sucesso!')}
                </h2>

                <p className="text-slate-500 mb-8">
                    {t('addVehicle.successMessage', 'O veículo foi incluído na sua sessão atual e já está disponível no catálogo.')}
                </p>

                <div className="flex flex-col w-full gap-3">
                    <button
                        onClick={onGoToCatalog}
                        className="w-full bg-[#00b4ff] hover:bg-[#6bd60f] text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00b4ff]/30"
                    >
                        <Car className="w-5 h-5" />
                        {t('addVehicle.viewInCatalog', 'Ver no Catálogo')}
                    </button>

                    <button
                        onClick={onAddAnother}
                        className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors"
                    >
                        {t('addVehicle.addAnother', 'Adicionar Outro')}
                    </button>
                </div>
            </div>
        </div>
    );
}
