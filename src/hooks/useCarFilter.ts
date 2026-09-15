import { useState, useMemo } from 'react';
import { FilterState, Car, ALL_POWERTRAINS, DEFAULT_MIN_RANGE } from '../types';

export function useCarFilter(initialCars: Car[]) {
    const [filters, setFilters] = useState<FilterState>({
        maxPrice: 1500000,
        minRange: DEFAULT_MIN_RANGE,
        categories: [],
        brands: [],
        showNew: false,
        fastChargeOnly: false,
        powertrains: [...ALL_POWERTRAINS],
    });

    const allBrands = useMemo(() => {
        return Array.from(new Set(initialCars.map(c => c.brand))).sort();
    }, [initialCars]);

    const resetFilters = () => {
        setFilters({
            maxPrice: 1500000,
            minRange: DEFAULT_MIN_RANGE,
            categories: [],
            brands: [],
            showNew: false,
            fastChargeOnly: false,
            powertrains: [...ALL_POWERTRAINS],
        });
    };

    return {
        filters,
        setFilters,
        allBrands,
        resetFilters
    };
}
