import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const responseCache = new Map();

export function useGet(endpoint, { cacheTime = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cookie] = useCookies(["token"]);

  const fetchData = useCallback(
    async (byID = null, force = false) => {
      if (!cookie.token || !endpoint) return;

      const requestEndpoint = byID
        ? `${endpoint}/${byID}`
        : endpoint;
      const cacheKey = `${cookie.token}:${requestEndpoint}`;

      if (cacheTime > 0 && !force) {
        const cached = responseCache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
          setData(cached.data);
          setError(null);
          setLoading(false);
          return cached.data;
        }

        if (cached) {
          responseCache.delete(cacheKey);
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BASE_URL}${requestEndpoint}`, {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        });

        setData(response.data);

        if (cacheTime > 0) {
          responseCache.set(cacheKey, {
            data: response.data,
            expiresAt: Date.now() + cacheTime,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [cacheTime, cookie.token, endpoint],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: (byID = null) => fetchData(byID, true),
  };
}