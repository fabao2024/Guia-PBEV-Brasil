import { useState } from 'react';
import { Car } from '../types';

export function useCompare() {
    const [compareList, setCompareList] = useState<Car[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const toggleCompare = (car: Car) => {
        setCompareList(prev => {
            const exists = prev.find(c => c.model === car.model);
            if (exists) {
                return prev.filter(c => c.model !== car.model);
            }
            if (prev.length >= 3) {
                alert("Você pode comparar no máximo 3 veículos.");
                return prev;
            }
            return [...prev, car];
        });
    };

    const removeFromCompare = (car: Car) => {
        setCompareList(prev => prev.filter(c => c.model !== car.model));
        if (compareList.length <= 2 && isCompareModalOpen) {
            // Optional: Close modal if emptying, but logic in App.tsx was careful
        }
    };

    const clearCompare = () => setCompareList([]);

    return {
        compareList,
        setCompareList,
        isCompareModalOpen,
        setIsCompareModalOpen,
        toggleCompare,
        removeFromCompare,
        clearCompare
    };
}
