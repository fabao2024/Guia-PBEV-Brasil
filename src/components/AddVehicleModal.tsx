import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Image as ImageIcon, Info, Battery, Zap } from 'lucide-react';
import { Car } from '../types';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (car: Car) => void;
}

export default function AddVehicleModal({ isOpen, onClose, onAdd }: AddVehicleModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<Car>>({
        model: '',
        brand: '',
        price: 0,
        range: 0,
        cat: 'SUV',
        img: '',
        power: 0,
        torque: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Convert to number for specific fields
        const numberFields = ['price', 'range', 'power', 'torque'];
        const processedValue = numberFields.includes(name) ? Number(value) : value;

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.model?.trim()) newErrors.model = t('addVehicle.required', 'Campo obrigatório');
        if (!formData.brand?.trim()) newErrors.brand = t('addVehicle.required', 'Campo obrigatório');
        if (!formData.price || formData.price <= 0) newErrors.price = t('addVehicle.invalidNumber', 'Valor inválido');
        if (!formData.range || formData.range <= 0) newErrors.range = t('addVehicle.invalidNumber', 'Valor inválido');
        if (!formData.cat) newErrors.cat = t('addVehicle.required', 'Campo obrigatório');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // For images, if left blank, we can put a placeholder
            const finalImg = formData.img?.trim() || 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80';

            onAdd({
                ...(formData as Car),
                img: finalImg
            });

            // Reset after successful addition handled sequentially by parent component
            setFormData({
                model: '', brand: '', price: 0, range: 0, cat: 'SUV', img: '', power: 0, torque: 0
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div
                className="bg-[#121212] rounded-3xl w-full max-w-2xl shadow-2xl shadow-[#00b4ff]/10 flex flex-col my-auto animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] border border-[#333333] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Subtle Radial Gradient Background Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-[#00b4ff]/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#333333] flex-shrink-0 relative z-10 bg-[#121212]/80 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {t('addVehicle.title', 'Adicionar Novo Veículo')}
                        </h2>
                        <p className="text-sm text-[#a0a0a0] font-medium mt-1">
                            {t('addVehicle.subtitle', 'Cadastro premium para simulação PBEV 2025.')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#a0a0a0] hover:bg-[#222222] hover:text-white rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar relative z-10 w-full">
                    <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-8 max-w-full">

                        {/* SECTION 1: Informações Gerais */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-[#00b4ff]" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('addVehicle.generalInfo', 'Informações Gerais')}</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                                {/* Modelo */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.model', 'Modelo')}</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: Model Y"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.model ? 'border-red-500 bg-red-900/20 text-white' : 'border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222]'} focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]`}
                                    />
                                    {errors.model && <p className="text-red-400 text-xs mt-1 font-medium">{errors.model}</p>}
                                </div>

                                {/* Marca */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.brand', 'Marca')}</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: Tesla"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.brand ? 'border-red-500 bg-red-900/20 text-white' : 'border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222]'} focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]`}
                                    />
                                    {errors.brand && <p className="text-red-400 text-xs mt-1 font-medium">{errors.brand}</p>}
                                </div>

                                {/* Preço */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.price', 'Preço')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00b4ff] font-bold">R$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price || ''}
                                            onChange={handleChange}
                                            placeholder="299990"
                                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.price ? 'border-red-500 bg-red-900/20 text-white' : 'border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222]'} focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]`}
                                        />
                                    </div>
                                    {errors.price && <p className="text-red-400 text-xs mt-1 font-medium">{errors.price}</p>}
                                </div>

                                {/* Categoria */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.category', 'Categoria')}</label>
                                    <select
                                        name="cat"
                                        value={formData.cat || 'SUV'}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.cat ? 'border-red-500 bg-red-900/20 text-white' : 'border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222]'} focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium appearance-none 
                                        bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2380ec13%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] 
                                        bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat`}
                                    >
                                        <option value="Compacto" className="bg-[#1a1a1a] text-white">{t('categories.Compacto', 'Compacto')}</option>
                                        <option value="SUV" className="bg-[#1a1a1a] text-white">{t('categories.SUV', 'SUV')}</option>
                                        <option value="Sedan" className="bg-[#1a1a1a] text-white">{t('categories.Sedan', 'Sedan')}</option>
                                        <option value="Luxo" className="bg-[#1a1a1a] text-white">{t('categories.Luxo', 'Luxo')}</option>
                                        <option value="Comercial" className="bg-[#1a1a1a] text-white">{t('categories.Comercial', 'Comercial')}</option>
                                    </select>
                                    {errors.cat && <p className="text-red-400 text-xs mt-1 font-medium">{errors.cat}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Bateria & Autonomia */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4">
                                <Battery className="w-5 h-5 text-[#00b4ff]" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('addVehicle.batteryInfo', 'Bateria & Autonomia')}</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                                {/* Autonomia */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.range', 'Autonomia PBEV')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="range"
                                            value={formData.range || ''}
                                            onChange={handleChange}
                                            placeholder="455"
                                            className={`w-full pr-12 pl-4 py-3 rounded-xl border ${errors.range ? 'border-red-500 bg-red-900/20 text-white' : 'border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222]'} focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00b4ff] font-bold">km</span>
                                    </div>
                                    {errors.range && <p className="text-red-400 text-xs mt-1 font-medium">{errors.range}</p>}
                                </div>

                                <div className="hidden sm:flex items-center justify-center p-3">
                                    <div className="text-sm text-[#00b4ff]/70 font-medium italic">
                                        Métricas baseadas no ciclo INMETRO 2025.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Desempenho (Opcional) */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-[#00b4ff]" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('addVehicle.performance', 'Desempenho')} <span className="text-[#a0a0a0] text-sm ml-2 font-normal">(Opcional)</span></h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                                {/* Potência */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.power', 'Potência')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="power"
                                            value={formData.power || ''}
                                            onChange={handleChange}
                                            placeholder="Ex: 204"
                                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222] focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00b4ff] font-bold">cv</span>
                                    </div>
                                </div>

                                {/* Torque */}
                                <div className="w-full">
                                    <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.torque', 'Torque')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="torque"
                                            value={formData.torque || ''}
                                            onChange={handleChange}
                                            placeholder="Ex: 31.6"
                                            step="0.1"
                                            className="w-full pr-16 pl-4 py-3 rounded-xl border border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222] focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00b4ff] font-bold">kgfm</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Mídia */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 break-inside-avoid shadow-[inset_0_0_20px_rgba(0,180,255,0.05)] border-dashed border-[#00b4ff]/30">
                            <div className="w-full">
                                <label className="block text-sm font-bold text-[#a0a0a0] mb-2">{t('addVehicle.imageUrl', 'Preview / URL da Imagem')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00b4ff]">
                                        <ImageIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="text"
                                        name="img"
                                        value={formData.img || ''}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#444444] bg-[#1a1a1a] text-white focus:bg-[#222222] focus:ring-2 focus:ring-[#00b4ff] focus:border-transparent transition-all outline-none font-medium placeholder-[#666666]"
                                    />
                                </div>
                                <p className="text-[#a0a0a0] text-xs mt-3 flex items-center justify-center gap-1">
                                    Use formatos vitrine otimizados (WebP/JPG).
                                </p>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#333333] bg-[#121212]/90 backdrop-blur-md flex items-center justify-end gap-3 rounded-b-3xl flex-shrink-0 relative z-10 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-white hover:bg-[#333333] transition-colors"
                    >
                        {t('addVehicle.cancel', 'Cancelar')}
                    </button>
                    <button
                        type="submit"
                        form="add-vehicle-form"
                        className="px-8 py-3 rounded-xl font-bold text-[#121212] bg-[#00b4ff] hover:bg-[#96f534] hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,180,255,0.4)]"
                    >
                        <Save className="w-5 h-5" />
                        {t('addVehicle.submit', 'Salvar no Catálogo')}
                    </button>
                </div>
            </div>
        </div>
    );
}
