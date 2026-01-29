import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";

// Create a dedicated axios instance for this hook
const apiClient = axios.create({
  baseURL: "http://172.16.218.122:8080/api/v1/",
  timeout: 20000,
});

// Example interceptor — attach tokens if needed
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("AUTH_TOKEN");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Response interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response } = err;
    if (!response) {
      message.error("Network error");
      return Promise.reject({ message: "Network error" });
    }

    if ([401, 440].includes(response.status)) {
      message.error(
        response.data?.pErrorMessage || "Authentication expired. Please login."
      );
    }

    if (response.status === 403) {
      message.error(response.data?.pErrorMessage || "Forbidden");
    }

    return Promise.reject(response.data || err);
  }
);

/**
 * Universal API handler managing state for all HTTP methods.
 */
export const useApi = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null); // success, error, loading, idle
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef(null);

  // Cancels the ongoing request if any
  const cancelRequest = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  const request = useCallback(async (method, url, body = {}, params = {}) => {
    setLoading(true);
    setError(null);
    setStatus("loading");

    cancelRequest();
    controllerRef.current = new AbortController();

    try {
      const res =
        method === "get"
          ? await apiClient.get(url, { params, signal: controllerRef.current.signal })
          : await apiClient[method](url, body, {
              params,
              signal: controllerRef.current.signal,
            });

      setData(res.data);
      setStatus("success");
      return res.data;
    } catch (err) {
      if (axios.isCancel(err)) {
        setStatus("canceled");
        return null;
      }

      const msg =
        err?.p_ERROR_MESSAGE || err?.message || "Request failed, please try again.";

      setError(msg);
      setStatus("error");

      // Notification handled here
      message.error(msg);

      return null;
    } finally {
      setLoading(false);
    }
  }, [cancelRequest]);

  // Expose actions
  const api = useMemo(
    () => ({
      data,
      error,
      loading,
      status,
      cancel: cancelRequest,
      get: (url, params) => request("get", url, {}, params),
      post: (url, body, params) => request("post", url, body, params),
      put: (url, body, params) => request("put", url, body, params),
      patch: (url, body, params) => request("patch", url, body, params),
      del: (url, params) => request("delete", url, {}, params),
      refresh: () => {
        // manual refresh of last successful api call
        if (status === "success" && data?._lastConfig) {
          const { method, url, body, params } = data._lastConfig;
          return request(method, url, body, params);
        }
      },
    }),
    [data, error, loading, status, request, cancelRequest]
  );

  return api;
};
