import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from '../api/apiError';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('pasa de loading a data', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42), []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeUndefined();
  });

  it('pasa de loading a error como ApiError', async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(new ApiError(404, 'No existe')), []),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.status).toBe(404);
    expect(result.current.error?.message).toBe('No existe');
  });

  it('reload vuelve a llamar a la función', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsync(fn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.reload());
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
  });
});
