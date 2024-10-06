import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue?: T) {
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : undefined;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return undefined;
    }
  });

  useEffect(() => {
    if (storedValue === undefined && initialValue !== undefined) {
      setStoredValue(initialValue);
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [initialValue, storedValue, key]);

  const setValue = (value: T | ((val: T | undefined) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage', error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;
