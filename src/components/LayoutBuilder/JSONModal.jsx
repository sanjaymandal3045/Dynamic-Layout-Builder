import { Modal, Button, Input, message, Tabs } from "antd";
import {
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { downloadJSON } from "../../utilities/common";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfig } from "../../redux/slices/layoutSlice";

const JSONModal = ({ open, onClose, config }) => {
  const dispatch = useDispatch();
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const jsonString = JSON.stringify(config, null, 2);

  useEffect(() => {
    if (open) {
      setJsonText(jsonString);
      setCopied(false);
    }
  }, [open, jsonString]);

  // Parse and apply JSON changes
  const handleApplyJSON = () => {
    try {
      const parsedConfig = JSON.parse(jsonText);

      // Validate that it has required structure
      if (!parsedConfig.tabs || !Array.isArray(parsedConfig.tabs)) {
        messageApi.error("Invalid configuration: missing 'tabs' array");
        return;
      }

      // Apply the new config
      dispatch(setConfig(parsedConfig));
      messageApi.success("Configuration updated successfully!");
      onClose();
    } catch (error) {
      messageApi.error(`Invalid JSON: ${error.message}`);
    }
  };

  // Safely copy JSON to clipboard with fallback for insecure contexts
  const handleCopyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        // Modern approach (requires HTTPS or localhost)
        await navigator.clipboard.writeText(jsonText);
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement("textarea");
        textArea.value = jsonText;

        // Prevent scrolling to bottom of page in MS Edge
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) throw new Error("Fallback copy failed");
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      messageApi.error("Failed to copy to clipboard");
    }
  };

  // Reset to current config
  const handleReset = () => {
    setJsonText(jsonString);
    messageApi.info("Reset to current configuration");
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="JSON Configuration Editor"
        open={open}
        onCancel={onClose}
        width="100%"
        style={{ top: 0, padding: 0, margin: 0, maxWidth: "100vw" }}
        styles={{
          body: {
            height: "calc(100vh - 108px)",
            overflowY: "auto",
            padding: 16,
          },
        }}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          <Button key="reset" onClick={handleReset}>
            Reset
          </Button>,
          <Button
            key="copy"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopyToClipboard}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>,
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => downloadJSON(config)}
          >
            Download
          </Button>,
          <Button key="apply" type="primary" onClick={handleApplyJSON}>
            Apply Changes
          </Button>,
        ]}
      >
        <Tabs
          items={[
            {
              key: "editor",
              label: "Edit JSON",
              children: (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    height: "100%",
                  }}
                >
                  <div 
                    className="p-3 rounded-lg border"
                    style={{
                      background: "var(--bg-app)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <p className="text-sm m-0" style={{ color: "var(--text-secondary)" }}>
                      ✏️ <strong>Paste or edit JSON below</strong> to update
                      your layout design, then click "Apply Changes" to save.
                    </p>
                  </div>

                  <Input.TextArea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      backgroundColor: "#1e1e1e",
                      color: "#d4d4d4",
                      padding: 12,
                      borderRadius: 6,
                      height: "calc(100vh - 300px)", // Dynamically fills the screen height
                      resize: "none",
                    }}
                    placeholder="Paste or edit JSON configuration here..."
                  />
                </div>
              ),
            },
            {
              key: "preview",
              label: "Preview JSON",
              children: (
                <div
                  style={{
                    backgroundColor: "var(--bg-app)",
                    padding: 16,
                    borderRadius: 6,
                    height: "calc(100vh - 190px)", // Stretches to fill modal
                    overflowY: "auto",
                  }}
                >
                  <pre
                    style={{
                      fontSize: 12,
                      margin: 0,
                      color: "var(--text-primary)",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                    }}
                  >
                    {jsonString}
                  </pre>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default JSONModal;
