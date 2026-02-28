import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { CAR_DB } from '../constants';
import { Car } from '../types';

interface SavingsSimulatorModalProps {
    onClose: () => void;
}

export default function SavingsSimulatorModal({ onClose }: SavingsSimulatorModalProps) {
    const { t } = useTranslation();

    const [kms, setKms] = useState<number>(1500);
    const [gasPrice, setGasPrice] = useState<number>(6.45);
    const [kwhPrice, setKwhPrice] = useState<number>(1.00);
    const [dcKwhPrice, setDcKwhPrice] = useState<number>(2.50);
    const [dcPercent, setDcPercent] = useState<number>(20);
    const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');

    const handleCurrencyChange = (newCurrency: 'BRL' | 'USD') => {
        if (currency === newCurrency) return;
        const rate = 5.5;
        if (newCurrency === 'USD') {
            setGasPrice(Number((gasPrice / rate).toFixed(2)));
            setKwhPrice(Number((kwhPrice / rate).toFixed(2)));
            setDcKwhPrice(Number((dcKwhPrice / rate).toFixed(2)));
        } else {
            setGasPrice(Number((gasPrice * rate).toFixed(2)));
            setKwhPrice(Number((kwhPrice * rate).toFixed(2)));
            setDcKwhPrice(Number((dcKwhPrice * rate).toFixed(2)));
        }
        setCurrency(newCurrency);
    };

    const currencySymbol = currency === 'BRL' ? 'R$' : '$';

    const [selectedCars, setSelectedCars] = useState<(Car | null)[]>([null, null, null]);

    useEffect(() => {
        setSelectedCars([CAR_DB[0] || null, CAR_DB[1] || null, CAR_DB[2] || null]);
    }, []);

    const handleCarSelect = (index: number, model: string) => {
        const car = CAR_DB.find(c => c.model === model) || null;
        const newSelected = [...selectedCars];
        newSelected[index] = car;
        setSelectedCars(newSelected);
    };

    // Blended kWh rate: weighted average of AC home + DC fast
    const blendedKwhPrice = (kwhPrice * (1 - dcPercent / 100)) + (dcKwhPrice * (dcPercent / 100));

    // Efficiency based on official PBEV/Inmetro data (kWh/100km)
    const getEfficiency = (car: Car) => {
        if (car.cat === 'Urbano') return 12;
        if (car.cat === 'SUV') return 16;
        if (car.cat === 'Luxo') return 21;
        if (car.cat === 'Comercial') return 22;
        return 14; // Compacto / Sedan
    };

    const getCombustionKmL = (car: Car) => {
        if (car.cat === 'Urbano') return 12.0;
        if (car.cat === 'SUV') return 9.5;
        if (car.cat === 'Luxo') return 8.0;
        if (car.cat === 'Comercial') return 7.5;
        return 11.0;
    };

    const savingsArray = selectedCars.map(car => {
        if (!car) return 0;
        const evCost = Math.round((kms / 100) * getEfficiency(car) * blendedKwhPrice);
        const gasCost = Math.round((kms / getCombustionKmL(car)) * gasPrice);
        return (gasCost - evCost) * 12;
    });

    const maxSavings = Math.max(...savingsArray);
    const bestIndex = savingsArray.indexOf(maxSavings);

    const makeSliderStyle = (value: number, min: number, max: number) => ({
        background: `linear-gradient(to right, #00b4ff ${(value - min) / (max - min) * 100}%, rgba(255,255,255,0.2) ${(value - min) / (max - min) * 100}%)`
    });

    const sliderThumbClasses = "w-full h-1.5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,180,255,0.5)] [&::-webkit-slider-thumb]:cursor-pointer";

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-0 sm:p-6">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="bg-[#0a0b12] w-full sm:max-w-md md:max-w-4xl sm:rounded-[40px] shadow-[0_0_50px_rgba(0,180,255,0.15)] relative z-10 flex flex-col border border-white/5 mx-auto my-0 sm:my-6">

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none sm:rounded-[40px]" style={{
                    backgroundImage: 'radial-gradient(#00b4ff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>

                <div className="relative z-10 p-5 md:p-8 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={onClose} className="p-2 text-[#00b4ff] hover:text-white transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-black text-white text-center leading-tight">
                            {t('simulator.title')}<br /><span className="text-[#00b4ff]">{t('simulator.titlePBEV')}</span>
                        </h2>
                        {/* Currency Toggle */}
                        <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => handleCurrencyChange('BRL')}
                                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${currency === 'BRL' ? 'bg-[#00b4ff] text-black shadow-[0_0_10px_rgba(0,180,255,0.5)]' : 'text-[#a0a0a0] hover:text-white'}`}
                            >
                                R$
                            </button>
                            <button
                                onClick={() => handleCurrencyChange('USD')}
                                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-[#00b4ff] text-black shadow-[0_0_10px_rgba(0,180,255,0.5)]' : 'text-[#a0a0a0] hover:text-white'}`}
                            >
                                $
                            </button>
                        </div>
                    </div>

                    {/* Sliders Card */}
                    <div className="bg-[#111111]/80 backdrop-blur-md border-[2px] border-white/10 rounded-3xl p-5 md:p-6 mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_30px_rgba(0,180,255,0.1)] space-y-6">

                        {/* Monthly KMs */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm lg:text-base">{t('simulator.monthlyKms')}</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {kms.toLocaleString()} km
                                </div>
                            </div>
                            <input type="range" min="100" max="10000" step="100"
                                value={kms} onChange={(e) => setKms(Number(e.target.value))}
                                className={sliderThumbClasses}
                                style={makeSliderStyle(kms, 100, 10000)}
                            />
                        </div>

                        {/* Gas Price /L */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm lg:text-base">{t('simulator.gasPrice')} /L</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {currencySymbol} {gasPrice.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <input type="range" min="1" max="10" step="0.01"
                                value={gasPrice} onChange={(e) => setGasPrice(Number(e.target.value))}
                                className={sliderThumbClasses}
                                style={makeSliderStyle(gasPrice, 1, 10)}
                            />
                        </div>

                        {/* AC kWh Price */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm lg:text-base">{t('simulator.kwhPrice')} (AC) /kWh</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {currencySymbol} {kwhPrice.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <input type="range" min="0" max="10" step="0.01"
                                value={kwhPrice} onChange={(e) => setKwhPrice(Number(e.target.value))}
                                className={sliderThumbClasses}
                                style={makeSliderStyle(kwhPrice, 0, 10)}
                            />
                        </div>

                        {/* DC Fast kWh Price */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm lg:text-base">{t('simulator.dcKwhPrice')} /kWh</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {currencySymbol} {dcKwhPrice.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <input type="range" min="0" max="10" step="0.01"
                                value={dcKwhPrice} onChange={(e) => setDcKwhPrice(Number(e.target.value))}
                                className={sliderThumbClasses}
                                style={makeSliderStyle(dcKwhPrice, 0, 10)}
                            />
                        </div>

                        {/* DC Percent */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm lg:text-base">{t('simulator.dcPercent')}</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {dcPercent}%
                                </div>
                            </div>
                            <input type="range" min="0" max="100" step="1"
                                value={dcPercent} onChange={(e) => setDcPercent(Number(e.target.value))}
                                className={sliderThumbClasses}
                                style={makeSliderStyle(dcPercent, 0, 100)}
                            />
                            <p className="text-[10px] text-[#666666] mt-2 text-right">
                                {t('simulator.blendedRate')}: {currencySymbol} {blendedKwhPrice.toFixed(2).replace('.', ',')}/kWh
                            </p>
                        </div>
                    </div>

                    {/* Car Columns */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {selectedCars.map((car, idx) => {
                            const isBest = car && idx === bestIndex && maxSavings > 0;
                            const efficiency = car ? getEfficiency(car) : 0;
                            const combustionKmL = car ? getCombustionKmL(car) : 0;

                            const evCost = car ? Math.round((kms / 100) * efficiency * blendedKwhPrice) : 0;
                            const gasCost = car ? Math.round((kms / combustionKmL) * gasPrice) : 0;
                            const monthlySavings = gasCost - evCost;
                            const annualSavings = monthlySavings * 12;
                            const costPerKm = kms > 0 ? evCost / kms : 0;

                            const maxCost = Math.max(gasCost, 1000);
                            const evHeight = car ? `${(evCost / maxCost) * 100}%` : '5%';
                            const gasHeight = car ? `${(gasCost / maxCost) * 100}%` : '5%';

                            return (
                                <div
                                    key={idx}
                                    className={`relative w-full md:w-1/3 flex flex-col items-center bg-[#111111] rounded-3xl p-4 md:p-5 overflow-hidden ${isBest ? 'border-[2px] border-[#00b4ff] shadow-[0_0_20px_rgba(0,180,255,0.3)]' : 'border border-white/10'}`}
                                >
                                    {isBest && (
                                        <div className="absolute -top-6 -right-8 bg-[#00b4ff] text-black text-[10px] font-black tracking-widest uppercase transform rotate-45 py-8 w-32 text-center shadow-lg z-20">
                                            <span className="block mt-4 whitespace-pre-line">{t('simulator.bestSavings')}</span>
                                        </div>
                                    )}

                                    {/* Car Selector */}
                                    <div className="w-full relative z-30 mb-4">
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-[#1a1a1a] border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#00b4ff] transition-colors truncate"
                                                value={car?.model || ""}
                                                onChange={(e) => handleCarSelect(idx, e.target.value)}
                                            >
                                                <option value="" disabled>{t('simulator.selectVehicle')}</option>
                                                {CAR_DB.map((c) => (
                                                    <option key={c.model} value={c.model}>
                                                        {c.brand} {c.model}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {!car ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-50 text-center space-y-2 py-10 w-full mb-auto z-10">
                                            <div className="w-12 h-12 rounded-full border border-dashed border-white/30 flex items-center justify-center">
                                                <span className="text-white/50 text-xl">+</span>
                                            </div>
                                            <p className="text-sm text-white">{t('simulator.selectAVehicle')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center mb-4 z-10">
                                                <p className="text-sm text-white mb-1">{t('simulator.save')}</p>
                                                <p className="text-2xl md:text-3xl font-black text-[#00b4ff]">
                                                    {currencySymbol} {annualSavings.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}<span className="text-xs text-[#00b4ff]/80">{t('simulator.perYear')}</span>
                                                </p>
                                            </div>

                                            {/* Bar Charts */}
                                            <div className="flex items-end justify-center gap-3 md:gap-4 h-32 w-full mb-4 relative z-10">
                                                <div className="absolute inset-0 border-b border-white/10 z-0"></div>
                                                <div className="w-8 md:w-10 relative z-10 flex flex-col justify-end h-full">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-[#00b4ff]/20 to-[#00b4ff] rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(0,180,255,0.3)]"
                                                        style={{ height: evHeight, minHeight: '10%' }}
                                                    ></div>
                                                </div>
                                                <div className="w-8 md:w-10 relative z-10 flex flex-col justify-end h-full">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-white/10 to-[#a0a0a0] rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                        style={{ height: gasHeight, minHeight: '20%' }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Legend Costs */}
                                            <div className="flex justify-between w-full text-center mb-4 z-10 gap-2">
                                                <div className="flex-1">
                                                    <p className="text-[#a0a0a0] leading-tight text-xs">{t('simulator.energyCost')}</p>
                                                    <p className="text-[#00b4ff] font-bold text-sm">{currencySymbol} {evCost.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[#a0a0a0] leading-tight text-xs">{t('simulator.fuelCost')}</p>
                                                    <p className="text-[#a0a0a0] font-bold text-sm">{currencySymbol} {gasCost.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}</p>
                                                </div>
                                            </div>

                                            <div className="text-center w-full mt-auto z-10 pb-2">
                                                <p className="text-sm text-[#a0a0a0] mb-0.5">{t('simulator.costPerKm')}</p>
                                                <p className="text-white font-black text-lg md:text-xl mb-3">{currencySymbol} {costPerKm.toFixed(2).replace('.', ',')}</p>
                                                <p className="text-xs text-[#a0a0a0] mb-0.5">{t('simulator.efficiency')}</p>
                                                <p className="text-white font-bold text-sm">{efficiency} kWh/100km</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-[10px] text-[#444444] mt-6 uppercase tracking-widest">
                        {t('simulator.disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
