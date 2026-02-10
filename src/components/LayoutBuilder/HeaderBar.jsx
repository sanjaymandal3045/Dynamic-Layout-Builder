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
        traceNo: "123",
        attributes: config,
      };

      const response = await saveConfigApi.post("/transaction/execute", params);

      if (response.success === true) {
        messageApi.success(
          response.message || "Configuration saved successfully"
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
      <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Section: Branding & Metadata */}
          <div className="flex items-center gap-6">
            <div className="pr-6 border-r border-slate-200 hidden lg:block">
              <Title level={4} className="!m-0 tracking-tight text-blue-600">
                Report Configuration
              </Title>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Page Key Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 uppercase">
                  Page Key
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. user-profile"
                  value={config.pageKey}
                  onChange={handlePageKeyChange}
                  className={`w-full sm:w-48 bg-slate-50 border-slate-200 hover:border-blue-400 focus:bg-white transition-all ${
                    !isPageKeyValid && config.pageKey !== undefined
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  prefix={<SettingOutlined className="text-slate-400" />}
                  status={
                    !isPageKeyValid && config.pageKey !== undefined
                      ? "error"
                      : ""
                  }
                />
              </div>

              {/* Display Title Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 uppercase">
                  Display Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  required
                  placeholder="Enter Report Title"
                  value={config.title}
                  onChange={handleTitleChange}
                  className={`w-full sm:w-64 bg-slate-50 border-slate-200 hover:border-blue-400 focus:bg-white transition-all ${
                    !isTitleValid && config.title !== undefined
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  status={
                    !isTitleValid && config.title !== undefined ? "error" : ""
                  }
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
                  className="border-slate-200 text-slate-600 hover:text-blue-500"
                >
                  Preview
                </Button>
              </Tooltip>

              <Button
                icon={<CodeOutlined />}
                onClick={onJson}
                className="border-slate-200 text-slate-600 hover:text-blue-500"
              >
                JSON
              </Button>

              <Divider type="vertical" className="h-8 border-slate-200" />

              <Tooltip
                title={
                  !isFormValid
                    ? "Please fill in all mandatory fields (Page Key and Display Title)"
                    : "Save Configuration"
                }
              >
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={saveConfig}
                  className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 px-6"
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