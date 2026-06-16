import { useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { message } from "antd";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
});

// Store for Redux dispatch (will be set during app initialization)
let reduxDispatch = null;

// --- Silent Token Refresh State ---
// Tracks whether a token refresh is currently in progress
let isRefreshing = false;
// Queue of { resolve, reject } callbacks for requests that failed while refresh was in progress
let failedRequestsQueue = [];

/**
 * Sentinel object to mark errors that were already handled by the interceptor
 * (e.g. toast already shown). The useApi catch block checks for this to avoid
 * showing a second duplicate toast.
 */
const HANDLED_ERROR = { __handled: true };

/**
 * Processes the queued failed requests after a token refresh attempt.
 * @param {string|null} newAccessToken - The new access token if refresh succeeded, null if it failed.
 * @param {any} error - The error to reject with if refresh failed.
 */
const processQueue = (newAccessToken, error = null) => {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(newAccessToken);
    }
  });
  failedRequestsQueue = [];
};

/**
 * Performs a token refresh using the stored refreshToken.
 * Updates localStorage and Redux on success.
 * @returns {Promise<string>} The new access token.
 */
const doTokenRefresh = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token available"));
  }

  // Use a plain axios instance (not apiClient) to avoid interceptor loops
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}auth/refresh`,
    { refreshToken },
    { timeout: 15000 }
  );

  const { accessToken, refreshToken: newRefreshToken } =
    response.data?.data ?? response.data;

  // Persist the new tokens
  localStorage.setItem("accessToken", accessToken);
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }

  // Sync Redux state if dispatch is available
  if (reduxDispatch) {
    const { refreshTokenSuccess } = await import("@/redux/slices/authSlice");
    reduxDispatch(
      refreshTokenSuccess({
        accessToken,
        refreshToken: newRefreshToken ?? refreshToken,
      })
    );
  }

  return accessToken;
};

/**
 * Clears auth state, shows a toast, and redirects to login.
 * @param {string} [reason] - Optional message to show the user.
 */
const forceLogout = (reason = "Your session has expired. Please log in again.") => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("roles");

  if (reduxDispatch) {
    import("@/redux/slices/authSlice").then(({ logoutUser }) => {
      reduxDispatch(logoutUser());
    });
  }

  message.error(reason);

  setTimeout(() => {
    window.location.href = "/login";
  }, 100);
};

/**
 * Initialize axios interceptors with Redux dispatch.
 * Call this from AppRoutes to enable proper Redux state sync on auth errors.
 */
export const initializeAxiosInterceptors = (dispatch) => {
  reduxDispatch = dispatch;

  // Clear any previous interceptors and set up new ones
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();

  // Request interceptor — attach the latest access token.
  // Also proactively refreshes the token if it is already expired before sending,
  // avoiding a guaranteed round-trip failure.
  apiClient.interceptors.request.use(
    async (config) => {
      // Skip token injection for the refresh endpoint itself
      if (config.url?.includes("auth/refresh")) return config;

      let token = localStorage.getItem("accessToken");

      // Proactive refresh: if the stored token is already expired, refresh now
      // before the request is even sent, saving one failed round-trip.
      if (token && !isTokenValid()) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            token = await doTokenRefresh();
            processQueue(token);
          } catch {
            processQueue(null, HANDLED_ERROR);
            forceLogout();
            return Promise.reject(HANDLED_ERROR);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Refresh already in flight — wait for it
          token = await new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          });
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — silent token refresh on 401 / "Invalid token type"
  apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
      const { response } = err;

      if (!response) {
        message.error("Network error. Please check your connection.");
        return Promise.reject(HANDLED_ERROR);
      }

      const originalRequest = err.config;

      // ─── Silent Token Refresh ──────────────────────────────────────────────
      // Triggers on:
      //   • HTTP 401 (Unauthorized)  OR
      //   • Backend error saying the token type is wrong
      // The _retry guard prevents infinite retry loops.
      const isInvalidTokenType =
        response.data?.error ===
        "Invalid token type. Use access token for API requests.";

      if (
        (response.status === 401 || isInvalidTokenType) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // Another refresh is already in flight — queue this request
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            })
            .catch(() => Promise.reject(HANDLED_ERROR));
        }

        isRefreshing = true;

        try {
          const newAccessToken = await doTokenRefresh();
          processQueue(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch {
          processQueue(null, HANDLED_ERROR);
          forceLogout();
          return Promise.reject(HANDLED_ERROR);
        } finally {
          isRefreshing = false;
        }
      }
      // ──────────────────────────────────────────────────────────────────────

      // 440: Session timeout (server-side forced expiry)
      if (response.status === 440) {
        forceLogout(response.data?.pErrorMessage || "Authentication expired. Please login.");
        return Promise.reject(HANDLED_ERROR);
      }

      // 403: Forbidden — show message but let the caller handle state
      if (response.status === 403) {
        message.error(response.data?.pErrorMessage || "You do not have permission to perform this action.");
      }

      return Promise.reject(response.data || err);
    }
  );
};

/**
 * Universal API hook managing loading/error/data state for all HTTP methods.
 */
export const useApi = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null); // "success" | "error" | "loading" | "canceled" | null
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

  const request = useCallback(
    async (method, url, body = {}, params = {}) => {
      setLoading(true);
      setError(null);
      setStatus("loading");

      cancelRequest();
      controllerRef.current = new AbortController();

      try {
        const res =
          method === "get"
            ? await apiClient.get(url, {
                params,
                signal: controllerRef.current.signal,
              })
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

        // If the interceptor already handled the error and showed a toast,
        // skip showing another one — just update state silently.
        if (err?.__handled) {
          setStatus("error");
          setError("Request failed.");
          return null;
        }

        const msg =
          err?.p_ERROR_MESSAGE ||
          err?.message ||
          "Request failed, please try again.";

        setError(msg);
        setStatus("error");
        message.error(msg);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [cancelRequest]
  );

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
    }),
    [data, error, loading, status, request, cancelRequest]
  );

  return api;
};

/**
 * Validate if the stored access token exists and has not expired.
 * Returns true if the token is present and valid for at least the next 5 seconds.
 */
export const isTokenValid = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const decoded = JSON.parse(atob(parts[1]));

    if (decoded.exp) {
      // exp is in seconds — add a 5-second buffer to avoid edge-case races
      return decoded.exp * 1000 > Date.now() + 5000;
    }

    return true; // No exp claim — assume valid
  } catch {
    return false;
  }
};