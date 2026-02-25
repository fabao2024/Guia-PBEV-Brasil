import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Image as ImageIcon } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div
                className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col my-auto animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {t('addVehicle.title', 'Adicionar Novo Veículo')}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {t('addVehicle.subtitle', 'Insira os dados do modelo elétrico para simulação no catálogo.')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Modelo */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.model', 'Modelo')}</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Model Y"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.model ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'} focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800`}
                                />
                                {errors.model && <p className="text-red-500 text-xs mt-1 font-medium">{errors.model}</p>}
                            </div>

                            {/* Marca */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.brand', 'Marca')}</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Tesla"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.brand ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'} focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800`}
                                />
                                {errors.brand && <p className="text-red-500 text-xs mt-1 font-medium">{errors.brand}</p>}
                            </div>

                            {/* Preço */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.price', 'Preço (R$)')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price || ''}
                                        onChange={handleChange}
                                        placeholder="299990"
                                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.price ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'} focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800`}
                                    />
                                </div>
                                {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>}
                            </div>

                            {/* Autonomia */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.range', 'Autonomia PBEV (km)')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="range"
                                        value={formData.range || ''}
                                        onChange={handleChange}
                                        placeholder="455"
                                        className={`w-full pr-12 pl-4 py-3 rounded-xl border ${errors.range ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'} focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">km</span>
                                </div>
                                {errors.range && <p className="text-red-500 text-xs mt-1 font-medium">{errors.range}</p>}
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.category', 'Categoria')}</label>
                                <select
                                    name="cat"
                                    value={formData.cat || 'SUV'}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.cat ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'} focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat`}
                                >
                                    <option value="Compacto">{t('categories.Compacto', 'Compacto')}</option>
                                    <option value="SUV">{t('categories.SUV', 'SUV')}</option>
                                    <option value="Sedan">{t('categories.Sedan', 'Sedan')}</option>
                                    <option value="Luxo">{t('categories.Luxo', 'Luxo')}</option>
                                    <option value="Comercial">{t('categories.Comercial', 'Comercial')}</option>
                                </select>
                                {errors.cat && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cat}</p>}
                            </div>

                            {/* Imagem (URL) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.imageUrl', 'URL da Imagem (Opcional)')}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="text"
                                        name="img"
                                        value={formData.img || ''}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Divider para Opcionais */}
                            <div className="col-span-1 sm:col-span-2 mt-2">
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">{t('addVehicle.optionalInfo', 'Informação Técnica (Opcional)')}</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>
                            </div>

                            {/* Potência */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.power', 'Potência (cv)')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="power"
                                        value={formData.power || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: 204"
                                        className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">cv</span>
                                </div>
                            </div>

                            {/* Torque */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('addVehicle.torque', 'Torque (kgfm)')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="torque"
                                        value={formData.torque || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: 31.6"
                                        step="0.1"
                                        className="w-full pr-16 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#80ec13] focus:border-transparent transition-all outline-none font-medium text-slate-800"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kgfm</span>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-3xl flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        {t('addVehicle.cancel', 'Cancelar')}
                    </button>
                    <button
                        type="submit"
                        form="add-vehicle-form"
                        className="px-8 py-3 rounded-xl font-bold text-slate-900 bg-[#80ec13] hover:bg-[#6bd60f] transition-all flex items-center gap-2 shadow-lg shadow-[#80ec13]/30"
                    >
                        <Save className="w-5 h-5" />
                        {t('addVehicle.submit', 'Adicionar Veículo')}
                    </button>
                </div>
            </div>
        </div>
    );
}
