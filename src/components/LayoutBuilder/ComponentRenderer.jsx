import { use, useEffect, useState } from "react";
import {
  Select,
  Input,
  Button,
  Divider,
  Typography,
  Card,
  Table,
  Space,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useApi } from "../../utilities/axiosApiCall";

const { Text } = Typography;

const ComponentRenderer = ({
  component,
  value,
  onValueChange,
  onBtnClick,
  onRowAction,
  disabled,
}) => {
  const [apiData, setApiData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pageSize, setPageSize] = useState(10);

  {
    contextHolder;
  }

  const dataTableApi = useApi();

  // Fetch dropdown data for select components
  useEffect(() => {
    if (component.type === "select" && component.dataSource === "api") {
      if (!component.dataUrl) return;

      const fetchData = async () => {
        setLoading(true);
        try {
          // Placeholder for real API call
          await new Promise((resolve) => setTimeout(resolve, 800));
          const dummyApiResponse = [
            { label: "Dynamic Item 1", value: "d1" },
            { label: "Dynamic Item 2", value: "d2" },
          ];
          setApiData(dummyApiResponse);
        } catch (error) {
          console.error("Failed to fetch dropdown data", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [component.dataSource, component.dataUrl, component.type]);

  // Fetch table data
  useEffect(() => {
    if (component.type === "table" && component.dataUrl) {
      const fetchTableData = async () => {
        setTableLoading(true);
        try {
          console.log("Component", component);
          const menuParams = {
            subChannelId: component.tableApiCommon.subChannelId,
            subServiceId: component.tableApiCommon.subServiceId,
            traceNo: component.tableApiCommon.traceNo,
            attributes: {},
          };

          const res = await dataTableApi.post(component.dataUrl, menuParams);
          console.log("res", res);
          if (res?.data) {
            const dynamicMenu = res.data.attributes.menuTree;
            setTableData(dynamicMenu);
          }

          // Mock table data - replace with actual API call
          const mockData = [
            {
              id: 1,
              userName: "John Doe",
              email: "john@example.com",
              status: "active",
              createdAt: "2024-01-15",
            },
            {
              id: 2,
              userName: "Jane Smith",
              email: "jane@example.com",
              status: "inactive",
              createdAt: "2024-01-16",
            },
            {
              id: 3,
              userName: "Bob Johnson",
              email: "bob@example.com",
              status: "active",
              createdAt: "2024-01-17",
            },
          ];
          setApiData(mockData);
        } catch (error) {
          console.error("Failed to fetch table data", error);
          messageApi.error("Failed to load table data");
        } finally {
          setTableLoading(false);
        }
      };

      fetchTableData();
    }
  }, [component.dataUrl, component.type]);

  // Get layout values
  const offset = component.layout?.offset || 0;
  const colSpan = component.layout?.colSpan || 1;

  // Calculate gridColumn value
  const getGridColumn = () => {
    // Full width components
    if (
      component.type === "divider" ||
      component.type === "newline" ||
      component.type === "table"
    ) {
      return "1 / -1";
    }
    // Components with offset
    if (offset > 0) {
      return `${offset + 1} / span ${colSpan}`;
    }
    // Normal span
    return `span ${colSpan}`;
  };

  const gridColumnStyle = {
    gridColumn: getGridColumn(),
  };

  // Wrapper for content
  const renderWrapper = (children) => (
    <div className="flex justify-center items-center h-full w-full p-2">
      {children}
    </div>
  );

  switch (component.type) {
    case "field":
      const handleFieldBlur = async () => {
        if (component.onBlurApi?.enabled && component.onBlurApi?.url) {
          try {
            const payload = {
              subChannelId: component.onBlurApi?.apiCommon?.subChannelId,
              subServiceId: component.onBlurApi?.apiCommon?.subServiceId,
              traceNo: component.onBlurApi?.apiCommon?.traceNo,
              attributes: {
                [component.name]: value,
              },
            };

            const response = await dataTableApi.post(
              component.onBlurApi.url,
              payload,
            );

            if (response?.data) {
              // Map API response fields to form fields
              component.onBlurApi.fieldMappings?.forEach((mapping) => {
                const apiValue =
                  response.data.attributes?.[mapping.apiResponseField] ||
                  response.data?.[mapping.apiResponseField];
                if (apiValue !== undefined) {
                  onValueChange(mapping.targetFieldName, apiValue);
                }
              });
              messageApi.success("Data fetched successfully");
            }
          } catch (error) {
            console.error("onBlur API call failed:", error);
            messageApi.error("Failed to fetch data on blur");
          }
        }
      };

      return (
        <div style={gridColumnStyle}>
          {renderWrapper(
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-semibold text-slate-700">
                {component.label}{" "}
                {component.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                type={component.fieldType}
                placeholder={component.placeholder}
                value={value || ""}
                onChange={(e) => onValueChange(component.name, e.target.value)}
                onBlur={handleFieldBlur}
                className="rounded-md"
                disabled={disabled}
              />
            </div>,
          )}
        </div>
      );

    case "text":
      return (
        <div style={gridColumnStyle}>
          {renderWrapper(
            <Text
              style={{
                fontSize: component.fontSize || 16,
                fontWeight: component.fontWeight || 400,
                color: component.color || "#1a1a1a",
              }}
              className="leading-relaxed text-center px-4"
            >
              {component.content}
            </Text>,
          )}
        </div>
      );

    case "button":
      const getButtonProps = (variant) => {
        switch (variant) {
          case "primary":
            return {
              type: "primary",
              className: "bg-blue-600 hover:bg-blue-700 border-blue-600",
            };
          case "default":
            return {
              type: "default",
              className:
                "border-slate-300 hover:border-blue-500 hover:text-blue-500",
            };
          case "dashed":
            return {
              type: "dashed",
              className:
                "border-slate-300 hover:border-blue-500 hover:text-blue-500",
            };
          case "text":
            return {
              type: "text",
              className: "text-slate-600 hover:text-blue-500",
            };
          case "link":
            return {
              type: "link",
              className: "text-blue-500 hover:text-blue-700",
            };
          default:
            return {
              type: "default",
              className:
                "border-slate-300 hover:border-blue-500 hover:text-blue-500",
            };
        }
      };

      const buttonProps = getButtonProps(component.variant);

      return (
        <div style={gridColumnStyle}>
          {renderWrapper(
            <Button
              {...buttonProps}
              onClick={() => {
                onBtnClick();
              }}
              disabled={disabled}
              className={`h-10 px-6 font-medium shadow-sm transition-all duration-200 ${buttonProps.className}`}
            >
              {component.label}
            </Button>,
          )}
        </div>
      );

    case "spacer":
      return (
        <div
          style={{
            ...gridColumnStyle,
            height: `${component.height || 16}px`,
          }}
        />
      );

    case "divider":
      return (
        <div>
          {renderWrapper(<Divider className="my-4 border-slate-200" />)}
        </div>
      );

    case "card":
      return (
        <div style={gridColumnStyle}>
          {renderWrapper(
            <Card
              title={component.title}
              bordered={component.bordered !== false}
              className="shadow-sm rounded-lg bg-white"
              styles={{
                header: {
                  fontWeight: 600,
                  borderBottom: "1px solid #f0f0f0",
                },
                body: {
                  color: "#64748b",
                  padding: "16px",
                },
              }}
            >
              {component.children}
            </Card>,
          )}
        </div>
      );

    case "newline":
      return <div />;

    case "select":
      // Filter out empty objects from options
      const validOptions = (component.options || []).filter(
        (opt) => opt && opt.label && opt.value !== undefined,
      );

      return (
        <div style={gridColumnStyle}>
          {renderWrapper(
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-semibold text-slate-700">
                {component.label}{" "}
                {component.required && <span className="text-red-500">*</span>}
              </label>
              <Select
                className="w-full"
                placeholder={component.placeholder}
                loading={loading}
                value={value || undefined}
                onChange={(val) => onValueChange(component.name, val)}
                options={
                  component.dataSource === "api" ? apiData : validOptions
                }
                allowClear
                disabled={disabled}
              />
            </div>,
          )}
        </div>
      );

    case "table":
      // Build table columns from component config
      const tableColumns = [];

      // Adding action column if row actions are enabled
      if (
        component.rowActions?.showSelect ||
        component.rowActions?.showDelete
      ) {
        tableColumns.push({
          title: "Actions",
          key: "actions",
          width: 120,
          align: "center",
          render: (_, record) => (
            <Space size="small">
              {component.rowActions?.showSelect && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    onRowAction(component, record);
                  }}
                >
                  {component.rowActions?.selectLabel || "Select"}
                </Button>
              )}
              {component.rowActions?.showDelete && (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    messageApi.info("Delete functionality to be implemented");
                  }}
                />
              )}
            </Space>
          ),
        });
      }
      tableColumns.push(
        ...(component.columns || []).map((col) => ({
          title: col.label,
          dataIndex: col.dataIndex,
          key: col.dataIndex,
          width: 150,
        })),
      );

      return (
        <div className="w-full">
          {component.label && (
            <label className="text-sm font-semibold text-slate-700 block mb-3 px-2">
              {component.label}
            </label>
          )}
          <Table
            columns={tableColumns}
            dataSource={tableData}
            loading={tableLoading}
            pagination={
                component.pagination !== false
                  ? {
                      pageSize: pageSize,
                      showSizeChanger: true,
                      pageSizeOptions: ["2", "10", "20", "50", "100"],
                      showTotal: (total) => `Total ${total} records`,
                      onChange: (page, size) => setPageSize(size),
                      onShowSizeChange: (current, size) => setPageSize(size),
                    }
                  : false
              }
            rowKey={(record) => record.id || Math.random()}
            size="small"
            scroll={{ x: true }}
            className="rounded-lg border border-slate-200 shadow-sm"
            style={{ width: "100%", padding: "10px" }}
            expandable={{
              expandedRowRender: undefined,
              showExpandColumn: false,
            }}
          />
        </div>
      );

    default:
      return null;
  }
};

export default ComponentRenderer;
