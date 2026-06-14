import { useCallback, useEffect, useRef, useState } from 'react';

export const useAsync = (fn) => {
  const fnRef = useRef(fn);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { data, loading, error, run, setData };
};
