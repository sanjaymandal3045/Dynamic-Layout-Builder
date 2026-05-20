import {
  Button,
  Input,
  Space,
  Divider,
  Typography,
  Tooltip,
  message,
} from "antd";
import {
  EyeOutlined,
  CodeOutlined,
  CloudDownloadOutlined,
  SettingOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useApi } from "../../utilities/axiosApiCall";

const { Title, Text } = Typography;

const HeaderBar = ({ config, onUpdateConfig, onPreview, onJson }) => {
  const saveConfigApi = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Validate mandatory fields before saving
   * @returns {boolean} true if validation passes, false otherwise
   */
  const validateConfig = () => {
    // Check if pageKey is empty
    if (!config.pageKey || config.pageKey.trim() === "") {
      messageApi.error("Page Key is mandatory");
      return false;
    }

    // Check if title is empty
    if (!config.title || config.title.trim() === "") {
      messageApi.error("Display Title is mandatory");
      return false;
    }

    return true;
  };

  const saveConfig = async () => {
    try {
      // Validate fields before making API call
      if (!validateConfig()) {
        return;
      }

      const params = {
        subChannelId: "2",
        subServiceId: "8",
        attributes: config,
      };

      const response = await saveConfigApi.post("/transaction/execute", params);

      if (response.success === true) {
        messageApi.success(
          response.message || "Configuration saved successfully",
        );
      } else {
        messageApi.error(response.message || "Configuration not saved");
      }
    } catch (error) {
      messageApi.error("Failed to save page configuration");
      console.error("Save config error:", error);
    }
  };

  const handlePageKeyChange = (e) => {
    onUpdateConfig({ ...config, pageKey: e.target.value });
  };

  const handleTitleChange = (e) => {
    onUpdateConfig({ ...config, title: e.target.value });
  };

  /**
   * Check if fields are valid (for UI feedback)
   */
  const isPageKeyValid = config.pageKey && config.pageKey.trim() !== "";
  const isTitleValid = config.title && config.title.trim() !== "";
  const isFormValid = isPageKeyValid && isTitleValid;

  return (
    <>
      {contextHolder}
      <div 
        className="sticky top-0 z-50 w-full backdrop-blur-md px-6 py-4 mb-8"
        style={{
          background: "var(--bg-header-rgba)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Section: Branding & Metadata */}
          <div className="flex items-center gap-6">
            <div className="pr-6 border-r hidden lg:block" style={{ borderColor: "var(--border-color)" }}>
              <Title level={4} className="!m-0 tracking-tight" style={{ color: "var(--accent-gradient-end)" }}>
                Report Configuration
              </Title>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Page Key Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold ml-1 mb-1 uppercase" style={{ color: "var(--text-muted)" }}>
                  Page Key
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. user-profile"
                  value={config.pageKey}
                  onChange={handlePageKeyChange}
                  className="w-full sm:w-48"
                  style={{
                    background: "var(--bg-app)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  prefix={<SettingOutlined style={{ color: "var(--text-muted)" }} />}
                />
              </div>

              {/* Display Title Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold ml-1 mb-1 uppercase" style={{ color: "var(--text-muted)" }}>
                  Display Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  required
                  placeholder="Enter Report Title"
                  value={config.title}
                  onChange={handleTitleChange}
                  className="w-full sm:w-64"
                  style={{
                    background: "var(--bg-app)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center justify-end gap-2">
            <Space size="middle">
              <Tooltip title="Preview Layout">
                <Button
                  icon={<EyeOutlined />}
                  onClick={onPreview}
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                  }}
                >
                  Preview
                </Button>
              </Tooltip>

              <Button
                icon={<CodeOutlined />}
                onClick={onJson}
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-card)",
                }}
              >
                JSON
              </Button>

              <Divider type="vertical" style={{ borderColor: "var(--border-color)", height: 32 }} />

              <Tooltip
                title={
                  !isFormValid
                    ? "Please fill in all mandatory fields"
                    : "Save Configuration"
                }
              >
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={saveConfig}
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))",
                    borderColor: "transparent",
                    color: "#fff",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  loading={saveConfigApi.loading}
                  disabled={!isFormValid}
                >
                  Save
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderBar;
