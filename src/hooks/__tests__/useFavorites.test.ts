import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';
import { Car } from '../../types';

const carA: Car = { model: 'Car A', brand: 'Brand1', price: 100000, range: 300, cat: 'SUV', img: '/a.jpg' };
const carB: Car = { model: 'Car B', brand: 'Brand2', price: 200000, range: 400, cat: 'Sedan', img: '/b.jpg' };

describe('useFavorites', () => {
  it('should start with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.showFavoritesOnly).toBe(false);
  });

  it('should add a favorite via toggleFavorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(carA);
    });

    expect(result.current.favorites).toContain('Car A');
  });

  it('should remove a favorite via toggleFavorite if already present', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => { result.current.toggleFavorite(carA); });
    act(() => { result.current.toggleFavorite(carA); });

    expect(result.current.favorites).not.toContain('Car A');
    expect(result.current.favorites).toHaveLength(0);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(carA);
    });

    const stored = JSON.parse(localStorage.getItem('pbev_favorites') || '[]');
    expect(stored).toContain('Car A');
  });

  it('should load favorites from localStorage on mount', () => {
    localStorage.setItem('pbev_favorites', JSON.stringify(['Car A', 'Car B']));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual(['Car A', 'Car B']);
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('pbev_favorites', 'not valid json{{{');

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
  });

  it('should toggle showFavoritesOnly', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.setShowFavoritesOnly(true);
    });

    expect(result.current.showFavoritesOnly).toBe(true);
  });

  it('should manage multiple favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => { result.current.toggleFavorite(carA); });
    act(() => { result.current.toggleFavorite(carB); });

    expect(result.current.favorites).toEqual(['Car A', 'Car B']);

    act(() => { result.current.toggleFavorite(carA); });

    expect(result.current.favorites).toEqual(['Car B']);
  });
});
