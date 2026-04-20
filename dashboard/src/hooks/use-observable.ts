import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

/**
 * Hook para assinar uma stream RxJS e atualizar o estado do componente React.
 * @param observable$ A stream RxJS para observar.
 * @param initialValue O valor inicial (opcional).
 * @returns O valor atual emitido pela stream.
 */
export function useObservable<T>(observable$: Observable<T>, initialValue?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);

  useEffect(() => {
    const subscription = observable$.subscribe((val: T) => {
      setValue(val);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [observable$]);

  return value;
}
