// useCombinedRefs.ts
import { useEffect, useRef, Ref, MutableRefObject } from 'react';

function useCombinedRefs<T>(...refs: Ref<T>[]): MutableRefObject<T | null> {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else if (ref && typeof ref === 'object') {
        (ref as MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

export default useCombinedRefs;
