import { useEffect, useRef } from 'react';

// modified from https://usehooks.com/usePrevious/
export default function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    if (value && ref.current !== value) {
      ref.current = value;
    }
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function usePreviousNonEmptyArray<T>(value: T[]) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T[]>();

  // Store current value in ref
  useEffect(() => {
    if (value.length > 0) {
      ref.current = value;
    }
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function usePreviousNonEmptyObject<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    if (value && Object.keys(value).length !== 0) {
      ref.current = value;
    }
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function usePreviousNonErroredArray<T>(value: T[]) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T[]>();

  // Store current value in ref
  useEffect(() => {
    if (value.length > 0 && !value.every((el: any) => el.error)) {
      ref.current = value;
    }
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
