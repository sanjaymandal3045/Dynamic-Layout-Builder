import React, { useState, useEffect } from "react";
import LayoutPreview from "./LayoutBuilder/LayoutPreview";
import { useApi } from "../utilities/axiosApiCall";
import SplashScreen from "./UI/SplashScreen";
import ErrorScreen from "./UI/ErrorScreen";

const DynamicPageLoader = ({ pageKey }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const fetchPageConfigApi = useApi();

  useEffect(() => {
    let cancelled = false;

    const fetchPageConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const menuParams = {
          subChannelId: "2",
          subServiceId: "9",
          attributes: {
            pageKey: pageKey,
          },
        };

        const res = await fetchPageConfigApi.post(
          `/transaction/execute`,
          menuParams,
        );

        if (cancelled) return;

        if (res?.data) {
          const rawConfig = res.data.attributes.pageConfig;

          let finalSections = rawConfig?.sections || [];
          if (
            typeof rawConfig?.sections === "string" &&
            finalSections.length === 0
          ) {
            finalSections = JSON.parse(rawConfig.sections);
          }

          setConfig({
            ...rawConfig,
            sections: finalSections,
          });

          setFormValues({});
        } else {
          setError("Invalid configuration format received from server.");
          setConfig(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Fetch Error:", err);
        setError(
          err?.message ||
            "Failed to load page configuration. Please check your connection and try again.",
        );
        setConfig(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPageConfig();

    return () => {
      cancelled = true;
    };
  }, [pageKey, retryCount]);

  const handleValueChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRetry = () => setRetryCount((c) => c + 1);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "420px",
          height: "100%",
          width: "100%",
        }}
      >
        <SplashScreen tip="Loading screen configuration..." />
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "420px",
          height: "100%",
          width: "100%",
        }}
      >
        <ErrorScreen
          title="Configuration Failed"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // ── Empty Config ─────────────────────────────────────────────────────────────
  if (!config || !config.tabs) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "420px",
          height: "100%",
          width: "100%",
        }}
      >
        <ErrorScreen
          title="No Configuration"
          message="No screen configuration was found for this page."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // ── Success: render dynamic page ─────────────────────────────────────────────
  return (
    <LayoutPreview
      config={config}
      formValues={formValues}
      onValueChange={handleValueChange}
      onBack={() => console.log("Back not applicable in dashboard")}
      hideBackButton={true}
    />
  );
};

export default DynamicPageLoader;
