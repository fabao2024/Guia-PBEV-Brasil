import { renderHook, act } from '@testing-library/react';
import { useCompare } from '../useCompare';
import { Car } from '../../types';

const carA: Car = { model: 'Car A', brand: 'Brand1', price: 100000, range: 300, cat: 'SUV', img: '/a.jpg' };
const carB: Car = { model: 'Car B', brand: 'Brand2', price: 200000, range: 400, cat: 'Sedan', img: '/b.jpg' };
const carC: Car = { model: 'Car C', brand: 'Brand3', price: 300000, range: 500, cat: 'Luxo', img: '/c.jpg' };
const carD: Car = { model: 'Car D', brand: 'Brand4', price: 400000, range: 600, cat: 'Compacto', img: '/d.jpg' };

describe('useCompare', () => {
  it('should start with an empty compare list', () => {
    const { result } = renderHook(() => useCompare());

    expect(result.current.compareList).toEqual([]);
    expect(result.current.isCompareModalOpen).toBe(false);
  });

  it('should add a car via toggleCompare', () => {
    const { result } = renderHook(() => useCompare());

    act(() => {
      result.current.toggleCompare(carA);
    });

    expect(result.current.compareList).toHaveLength(1);
    expect(result.current.compareList[0].model).toBe('Car A');
  });

  it('should remove a car via toggleCompare if already present', () => {
    const { result } = renderHook(() => useCompare());

    act(() => {
      result.current.toggleCompare(carA);
    });
    act(() => {
      result.current.toggleCompare(carA);
    });

    expect(result.current.compareList).toHaveLength(0);
  });

  it('should enforce max 3 cars limit', () => {
    const { result } = renderHook(() => useCompare());
    window.alert = vi.fn();

    act(() => { result.current.toggleCompare(carA); });
    act(() => { result.current.toggleCompare(carB); });
    act(() => { result.current.toggleCompare(carC); });
    act(() => { result.current.toggleCompare(carD); });

    expect(result.current.compareList).toHaveLength(3);
    expect(window.alert).toHaveBeenCalledWith('Você pode comparar no máximo 3 veículos.');
  });

  it('should remove a car via removeFromCompare', () => {
    const { result } = renderHook(() => useCompare());

    act(() => { result.current.toggleCompare(carA); });
    act(() => { result.current.toggleCompare(carB); });
    act(() => { result.current.removeFromCompare(carA); });

    expect(result.current.compareList).toHaveLength(1);
    expect(result.current.compareList[0].model).toBe('Car B');
  });

  it('should clear all cars', () => {
    const { result } = renderHook(() => useCompare());

    act(() => { result.current.toggleCompare(carA); });
    act(() => { result.current.toggleCompare(carB); });
    act(() => { result.current.clearCompare(); });

    expect(result.current.compareList).toEqual([]);
  });

  it('should toggle compare modal state', () => {
    const { result } = renderHook(() => useCompare());

    act(() => {
      result.current.setIsCompareModalOpen(true);
    });

    expect(result.current.isCompareModalOpen).toBe(true);

    act(() => {
      result.current.setIsCompareModalOpen(false);
    });

    expect(result.current.isCompareModalOpen).toBe(false);
  });
});
