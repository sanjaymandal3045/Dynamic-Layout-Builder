import { Modal, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadJSON } from "../../utilities/common";

const JSONModal = ({ open, onClose, config }) => {
    const jsonString = JSON.stringify(config, null, 2);
  
    return (
      <Modal
        title="Generated JSON Configuration"
        open={open}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => downloadJSON(config)}
          >
            Download JSON
          </Button>,
        ]}
      >
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: 16,
            borderRadius: 6,
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
          <pre
            style={{
              fontSize: 12,
              margin: 0,
              color: "#1f1f1f",
              fontFamily: "monospace",
            }}
          >
            {jsonString}
          </pre>
        </div>
      </Modal>
    );
  };

export default JSONModal;
