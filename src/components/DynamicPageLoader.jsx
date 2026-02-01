import React, { useState, useEffect } from "react";
import { Spin, Empty, message } from "antd";
import LayoutPreview from "./LayoutBuilder/LayoutPreview";
import { PAGE_REGISTRY } from "../config/pageRegistry";
import cbsReportJson from "./../config/pages/cbs-report.json";
import { useApi } from "../utilities/axiosApiCall";

const DynamicPageLoader = ({ pageKey }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({});
  const fetchPageConfigApi = useApi();

  useEffect(() => {
    const fetchPageConfig = async () => {
      setLoading(true);
      try {
        const menuParams = {
          subChannelId: "2",
          subServiceId: "9",
          traceNo: "1234567890",
          attributes: {
            pageKey: pageKey,
          },
        };
        const res = await fetchPageConfigApi.post(
          `/transaction/execute`,
          menuParams,
        );

        if (res.data) {
          const rawConfig = res.data.attributes.pageConfig;

          let finalSections = rawConfig.sections || [];
          if (
            typeof rawConfig.sections === "string" &&
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
          message.error("Invalid configuration format received");
          setConfig(null);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        message.error("Failed to load page configuration");
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageConfig();
  }, [pageKey]);

  const handleValueChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!config) {
    return <Empty description="Page Configuration not found" />;
  }

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
