import { useState, useMemo } from 'react';
import { FilterState, Car } from '../types';

export function useCarFilter(initialCars: Car[]) {
    const [filters, setFilters] = useState<FilterState>({
        maxPrice: 1500000,
        minRange: 100,
        categories: [],
        brands: []
    });

    const allBrands = useMemo(() => {
        return Array.from(new Set(initialCars.map(c => c.brand))).sort();
    }, [initialCars]);

    const resetFilters = () => {
        setFilters({
            maxPrice: 1500000,
            minRange: 100,
            categories: [],
            brands: []
        });
    };

    return {
        filters,
        setFilters,
        allBrands,
        resetFilters
    };
}
