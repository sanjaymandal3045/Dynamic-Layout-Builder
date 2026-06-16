import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Button,
  Divider,
  Tag,
} from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import CustomTable from "../components/ui/CustomTable";
import { useApi } from "../services/axiosClient";

const { RangePicker } = DatePicker;

const ModelRun = () => {
  const [form] = Form.useForm();
  const portfolioApi = useApi();
  const segmentApi = useApi();
  const modelApi = useApi();
  const [models, setModels] = useState([]);
  const [segments, setSegments] = useState([]);
  const [portfolios, setPortFolios] = useState([]);

  // Fetch initial models list on mount
  useEffect(() => {
    const fetchInitialModels = async () => {
      try {
        const res = await modelApi.post("/transaction/execute", {
          subChannelId: "3",
          subServiceId: "22",
          attributes: {},
        });
        console.log("modelAPi responseeeeeeeeee",res);
        setModels(res?.data?.attributes?.data)
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };

    fetchInitialModels();
  }, []);

  const modelOptions = (models || []).map((item) => ({
    value: item.modelName,
    label: item.modelName,
  }));

  // Handle form submission
  const onFinish = (values) => {
    console.log("Form Values Submitted:", values);
  };

  // Triggered when the Model Select changes
  const handleModelChange = async (selectedModel) => {
    form.setFieldsValue({ scope: undefined });
    try {
      if (selectedModel) {
        const res = await portfolioApi.post("/transaction/execute", {
          subChannelId: "3",
          subServiceId: "21",
          attributes: { modelName: `${selectedModel}` },
        });
        setPortFolios(res?.data?.attributes?.data);
      }
    } catch (error) {
      console.log("Error occurred while fetching Portfolio Data",error);
    }
  };
  const portfolioOptions = (portfolios || []).map((item) => ({
    value: item.portfolio,
    label: item.portfolio,
  }));
  


  // Triggered when the Model Select changes
  const handlePortfolioChange = async (selectedPortfolio) => {
    // Clear downstream segment field selection
    form.setFieldsValue({ scope: undefined });
    setSegments([]);

    // Get the currently selected model from the form instance
    const selectedModel = form.getFieldValue("model");

    try {
      if (selectedPortfolio && selectedModel) {
        const res = await segmentApi.post("/transaction/execute", {
          subChannelId: "3",
          subServiceId: "23",
          attributes: { 
            modelName: `${selectedModel}`,
            portfolio: `${selectedPortfolio}` // Adjust the key string to match your API requirements
          },
        });
        setSegments(res?.data?.attributes?.data || []);
      }
    } catch (error) {
      console.log("Error occurred while fetching Segment Data", error);
    }
  };

  
  const segmentOptions = (segments || []).map((item) => ({
    value: item.segment,
    label: item.segment,
  }));
  

  // Dummy Data for Table
  const dataSource = [
    {
      key: "1",
      runHistory: "RUN-2026-001",
      model: "Markov chain",
      type: "Sector",
      range: "01-2026 to 06-2026",
      status: "Success",
    },
    {
      key: "2",
      runHistory: "RUN-2026-002",
      model: "Regression",
      type: "Segment",
      range: "03-2025 to 03-2026",
      status: "Processing",
    },
    {
      key: "3",
      runHistory: "RUN-2026-003",
      model: "Markov chain",
      type: "Sector",
      range: "12-2025 to 05-2026",
      status: "Failed",
    },
  ];

  // Table Columns Configuration
  const columns = [
    {
      title: "Run History",
      dataIndex: "runHistory",
      key: "runHistory",
      className: "font-medium text-slate-700",
      align: "center",
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      align: "center",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
    },
    {
      title: "Range",
      dataIndex: "range",
      key: "range",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "Success") color = "green";
        if (status === "Failed") color = "volcano";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      align: "center",
    },
    {
      title: "Run Log",
      key: "runLog",
      render: (_, record) => (
        <Button
          type="text"
          icon={<FileTextOutlined />}
          className="text-blue-600 hover:text-blue-800"
          onClick={() => console.log(`Viewing log for ${record.runHistory}`)}
        >
          View Log
        </Button>
      ),
      align: "center",
    },
    {
      title: "Run Report",
      key: "runReport",
      render: (_, record) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          disabled={record.status !== "Success"}
          className="flex items-center"
        >
          Download
        </Button>
      ),
      align: "center",
    },
  ];

  return (
    <div style={{ padding: "12px" }}>
      <div
        className="p-4 max-w-7xl mx-auto space-y-2 bg-var(--bg-card)"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Page Title */}
        <div className="bg-var(--bg-app)">
          <h1 className="text-2xl font-bold var(--text-primary) tracking-tight">
            Model Run
          </h1>
        </div>

        <Divider style={{ padding: "5px", margin: "5px" }} />

        {/* Form Section */}
        <section
          className=" p-4 rounded-xl shadow-sm"
          style={{
            background: "var(--bg-app)",
            borderColor: "var(--border-color)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              
              {/* Model Select */}
              <Form.Item
                name="model"
                label={
                  <span className="font-semibold var(--text-secondary)">
                    Model
                  </span>
                }
                rules={[{ required: true, message: "Please select a model" }]}
              >
                <Select
                  placeholder={modelApi.loading ? "Loading models..." : "Select Model"}
                  className="w-full"
                  size="small"
                  onChange={handleModelChange}
                  loading={modelApi.loading}
                  options={modelOptions} // Dynamically injects formatted values
                />
              </Form.Item>

              {/* Portfolio Select */}
              <Form.Item
                name="portfolio"
                label={
                  <span className="font-semibold var(--text-secondary)">
                    PortFolio
                  </span>
                }
                rules={[{ required: true, message: "Please select a portfolio" }]}
              >
                <Select
                  placeholder={portfolioApi.loading ? "Loading models..." : "Select portfolio"}
                  className="w-full"
                  size="small"
                  onChange={handlePortfolioChange}
                  loading={portfolioApi.loading}
                  options={portfolioOptions} // Dynamically injects formatted values
                />
              </Form.Item>

              {/* Sector/Segment Multi-Select */}
              <Form.Item
                name="segment"
                label={
                  <span className="font-semibold var(--text-secondary)">
                    Sector/Segment
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please select at least one option",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={segmentApi.loading ? "Loading options..." : "Select Options"}
                  className="w-full"
                  maxTagCount="responsive"
                  size="small"
                  loading={segmentApi.loading}
                  options={segmentOptions}
                />
              </Form.Item>

              {/* Run Type Select */}
              <Form.Item
                name="runType"
                label={
                  <span className="font-semibold var(--text-secondary)">
                    Run Type
                  </span>
                }
                rules={[
                  { required: true, message: "Please select a run type" },
                ]}
              >
                <Select
                  placeholder="Select Run Type"
                  className="w-full"
                  size="small"
                >
                  <Select.Option value="sector">Sector</Select.Option>
                  <Select.Option value="segment">Segment</Select.Option>
                </Select>
              </Form.Item>

              {/* Date Range Picker (Month/Year only) */}
              <Form.Item
                name="dateRange"
                label={
                  <span className="font-semibold var(--text-secondary)">
                    Date Range
                  </span>
                }
                rules={[
                  { required: true, message: "Please select a date range" },
                ]}
              >
                <RangePicker
                  picker="month"
                  format="MM-YYYY"
                  className="w-full"
                  size="small"
                />
              </Form.Item>
            </div>

            {/* Form Action Button */}
            <div className="flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlayCircleOutlined />}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg"
              >
                Execute Model
              </Button>
            </div>
          </Form>
        </section>

        {/* Data Table Section */}
        <section className=" rounded-xl shadow-sm overflow-hidden">
          <div
            className="px-2 py-2"
            style={{
              background: "var(--bg-app)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2 className="text-lg font-semibold var(--text-secondary) ml-2">
              Execution History
            </h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <CustomTable
              dataSource={dataSource}
              columns={columns}
              rowKey="key"
              showExport={true}
              onExport={(data) => {
                console.log("Exporting data:", data);
              }}
              onRowClick={(record) => {
                console.log("Row clicked:", record);
              }}
              stripedRows={true}
              showRowHoverEffect={true}
              highlightFirstColumn={true}
              rowAnimation="zoom"
              animationDuration={0.3}
              staggerChildren={0.05}
            />
          </div>
        </section>
      </div>
      <style>{`
        .ant-form-item-vertical .ant-form-item-label {
          padding: 0px;
        }
        .ant-form-item {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default ModelRun;