import { renderHook, act } from '@testing-library/react';
import { useCarFilter } from '../useCarFilter';
import { Car } from '../../types';

const mockCars: Car[] = [
  { model: 'Model A', brand: 'BrandX', price: 100000, range: 300, cat: 'SUV', img: '/a.jpg' },
  { model: 'Model B', brand: 'BrandY', price: 200000, range: 400, cat: 'Sedan', img: '/b.jpg' },
  { model: 'Model C', brand: 'BrandX', price: 500000, range: 150, cat: 'Compacto', img: '/c.jpg' },
  { model: 'Model D', brand: 'BrandZ', price: 800000, range: 500, cat: 'Luxo', img: '/d.jpg' },
];

describe('useCarFilter', () => {
  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    expect(result.current.filters.maxPrice).toBe(1500000);
    expect(result.current.filters.minRange).toBe(100);
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.brands).toEqual([]);
  });

  it('should extract and sort unique brands', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    expect(result.current.allBrands).toEqual(['BrandX', 'BrandY', 'BrandZ']);
  });

  it('should update price filter', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    act(() => {
      result.current.setFilters(prev => ({ ...prev, maxPrice: 300000 }));
    });

    expect(result.current.filters.maxPrice).toBe(300000);
  });

  it('should update range filter', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    act(() => {
      result.current.setFilters(prev => ({ ...prev, minRange: 350 }));
    });

    expect(result.current.filters.minRange).toBe(350);
  });

  it('should update category filter', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    act(() => {
      result.current.setFilters(prev => ({ ...prev, categories: ['SUV', 'Sedan'] }));
    });

    expect(result.current.filters.categories).toEqual(['SUV', 'Sedan']);
  });

  it('should update brand filter', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    act(() => {
      result.current.setFilters(prev => ({ ...prev, brands: ['BrandX'] }));
    });

    expect(result.current.filters.brands).toEqual(['BrandX']);
  });

  it('should reset all filters to defaults', () => {
    const { result } = renderHook(() => useCarFilter(mockCars));

    act(() => {
      result.current.setFilters({
        maxPrice: 200000,
        minRange: 400,
        categories: ['SUV'],
        brands: ['BrandX'],
      });
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.maxPrice).toBe(1500000);
    expect(result.current.filters.minRange).toBe(100);
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.brands).toEqual([]);
  });

  it('should handle empty car list', () => {
    const { result } = renderHook(() => useCarFilter([]));

    expect(result.current.allBrands).toEqual([]);
  });
});
