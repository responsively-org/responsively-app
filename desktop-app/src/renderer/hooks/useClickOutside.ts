import {useEffect, useRef} from 'react';

/**
 * Calls the handler when a pointer-down lands outside the returned element.
 * Local replacement for react-detect-click-outside, which is incompatible
 * with React 19.
 */
const useClickOutside = <T extends HTMLElement = HTMLDivElement>(onOutside: () => void) => {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(onOutside);
  handlerRef.current = onOutside;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handlerRef.current();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return ref;
};

export default useClickOutside;
