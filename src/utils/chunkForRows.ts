import { useMemo } from 'react';

export function useChunkedRows(arr: any[], inRow: number) {
  const chunked = useMemo(() => {
    if (!arr || !inRow) return;

    if (!Array.isArray(arr) || arr.length === 0) return [];

    const _arr = [[arr[0]]];

    let j = 0;

    for (let i = 1; i < arr.length; i++) {
      if (i % inRow === 0) {
        j++;
        _arr.push([]);
      }
      _arr[j].push(arr[i]);
    }

    return _arr;
  }, [arr, inRow]);

  return chunked;
}
