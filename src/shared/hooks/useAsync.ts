// src/shared/hooks/useAsync.ts — patrón "cargando / error / datos" de las pantallas (contrato LT4-23).
import { useEffect, useState } from 'react';
import { type ApiError, toApiError } from '../api/apiError';

export interface AsyncState<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<{ data?: T; error?: ApiError; loading: boolean }>({
    loading: true,
  });
  const [n, setN] = useState(0);

  useEffect(() => {
    let vigente = true; // evita actualizar si el componente se desmontó
    setState((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => vigente && setState({ data, loading: false }))
      .catch((e: unknown) => vigente && setState({ error: toApiError(e), loading: false }));
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    reload: () => setN((x) => x + 1),
  };
}
