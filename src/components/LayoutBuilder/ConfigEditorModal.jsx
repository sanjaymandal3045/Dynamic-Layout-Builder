import React, { useState } from "react";
import {
  Modal,
  Input,
  Button,
  Space,
  message,
  Spin,
  Tabs,
  Divider,
  Typography,
} from "antd";
import { SearchOutlined, SaveOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setConfig } from "../../redux/slices/layoutSlice";
import { useApi } from "../../utilities/axiosApiCall";
import LayoutBuilder from "./LayoutBuilder";
import JSONModal from "./JSONModal";

const { Title, Text } = Typography;

const ConfigEditorModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [pageKeyInput, setPageKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const apiHandler = useApi();
  const config = useSelector((state) => state.layout.config);

  // Fetch page config from API
  const handleFetchConfig = async () => {
    if (!pageKeyInput.trim()) {
      messageApi.error("Please enter a Page Key");
      return;
    }

    setLoading(true);
    try {
      const menuParams = {
        subChannelId: "2",
        subServiceId: "9",
        traceNo: "",
        attributes: {
          pageKey: pageKeyInput,
        },
      };

      const res = await apiHandler.post("/transaction/execute", menuParams);

      if (res?.data?.attributes?.pageConfig) {
        const rawConfig = res.data.attributes.pageConfig;

        // Handle both string and object formats
        let finalConfig = rawConfig;
        if (typeof rawConfig === "string") {
          finalConfig = JSON.parse(rawConfig);
        }

        // Ensure tabs array exists
        if (!finalConfig.tabs) {
          finalConfig.tabs = [];
        }

        // Ensure pageKey is set
        if (!finalConfig.pageKey) {
          finalConfig.pageKey = pageKeyInput;
        }

        dispatch(setConfig(finalConfig));
        setConfigLoaded(true);
        messageApi.success("Config loaded successfully!");
      } else {
        messageApi.error("Invalid configuration format received");
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      messageApi.error("Failed to load page configuration");
    } finally {
      setLoading(false);
    }
  };

  // Save updated config back to API
  const handleSaveConfig = async () => {
    if (!config || !config.pageKey) {
      messageApi.error("No configuration to save");
      return;
    }

    setSaving(true);
    try {
      const saveParams = {
        subChannelId: "2",
        subServiceId: "8",
        traceNo: "",
        attributes: {
          pageKey: config.pageKey,
          pageConfig: config, // Send the entire config
        },
      };

      const res = await apiHandler.post(
        "/transaction/execute",
        saveParams
      );

      if (res?.success === true || res?.data?.txnStatus === 0) {
        messageApi.success("Configuration saved successfully!");
        setConfigLoaded(false);
        setPageKeyInput("");
        onClose();
      } else {
        messageApi.error(res?.message || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      messageApi.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setPageKeyInput("");
    setConfigLoaded(false);
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Page Config Editor"
        open={open}
        onCancel={handleClose}
        width={"90vw"}
        // style={{ height: "100vh", padding: 0 }}
        // bodyStyle={{ maxHeight: "calc(90vh - 110px)", overflow: "auto" }}
        footer={null}
        className="config-editor-modal"
        centered={true}
      >
        {/* Page Key Input Section */}
        {!configLoaded ? (
          <div style={{ padding: "20px 0" }}>
            <div className="mb-6">
              <Title level={4}>Load Page Configuration</Title>
              <Text type="secondary">
                Enter a Page Key to load and edit its configuration
              </Text>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <Input
                placeholder="Enter Page Key (e.g., branch-info, cbs-report)"
                value={pageKeyInput}
                onChange={(e) => setPageKeyInput(e.target.value)}
                onPressEnter={handleFetchConfig}
                size="large"
                style={{ flex: 1 }}
                disabled={loading}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleFetchConfig}
                loading={loading}
                style={{ minWidth: 120 }}
              >
                Load
              </Button>
            </div>

            {/* Quick Reference */}
            <div
              style={{
                background: "#f6f8fb",
                border: "1px solid #d9e8f5",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>Examples:</strong> branch-info, cbs-report,
                contract-search, cod-report
              </Text>
            </div>
          </div>
        ) : (
          <>
            {/* Loaded Config Info */}
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #b3e5fc",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Editing: {config.pageKey}</Text>
                {config.title && (
                  <>
                    <br />
                    <Text type="secondary">Title: {config.title}</Text>
                  </>
                )}
              </div>
              <Button
                type="link"
                onClick={() => {
                  setConfigLoaded(false);
                  setPageKeyInput("");
                }}
              >
                Load Different Config
              </Button>
            </div>

            {/* Layout Builder */}
            <LayoutBuilder />
            
          </>
        )}
      </Modal>

      {/* JSON Modal */}
      <JSONModal
        open={jsonModalOpen && configLoaded}
        config={config}
        onClose={() => setJsonModalOpen(false)}
      />
    </>
  );
};

export default ConfigEditorModal;
