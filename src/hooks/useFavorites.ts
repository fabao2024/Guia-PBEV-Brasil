import { useState, useEffect } from 'react';
import { Car } from '../types';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('pbev_favorites');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        localStorage.setItem('pbev_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (car: Car) => {
        setFavorites(prev =>
            prev.includes(car.model)
                ? prev.filter(model => model !== car.model)
                : [...prev, car.model]
        );
    };

    return {
        favorites,
        showFavoritesOnly,
        setShowFavoritesOnly,
        toggleFavorite
    };
}
