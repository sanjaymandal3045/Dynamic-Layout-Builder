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
import { DeleteOutlined, LockOutlined } from "@ant-design/icons";
import { useApi } from "../../utilities/axiosApiCall";

const { Text } = Typography;

const ComponentRenderer = ({
  component,
  value,
  onValueChange,
  onBtnClick,
  onRowAction,
  disabled,
  refreshTrigger,
}) => {
  const [apiData, setApiData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pageSize, setPageSize] = useState(10);

  const dataTableApi = useApi();

  // ===== PERMISSION UTILITIES =====
  const parsePermissions = (permissionString) => {
    if (!permissionString || permissionString.length < 2) {
      return { canRead: true, canWrite: true, canMask: false };
    }
    return {
      canRead: permissionString[0] === '1',
      canWrite: permissionString[1] === '1',
      canMask: permissionString[2] === '1',
    };
  };

  // Check if component should be visible and enabled based on permissions
  const getComponentState = (component) => {
    const permissions = parsePermissions(component.permissionString);
    
    return {
      isVisible: permissions.canRead, // Hide if no read permission
      isDisabled: !permissions.canWrite, // Disable if no write permission
      permissions,
    };
  };

  // ===== END PERMISSION UTILITIES =====

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
      fetchTableData();
    }
  }, [component.dataUrl, component.type, refreshTrigger]);

  // Function to fetch table data
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
    } catch (error) {
      console.error("Failed to fetch table data", error);
      messageApi.error("Failed to load table data");
    } finally {
      setTableLoading(false);
    }
  };

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

  // Utility function to search for a field by name in the entire response object
  const searchFieldInResponse = (obj, fieldName) => {
    if (!obj || typeof obj !== 'object') return undefined;

    // Check if current object has the field
    if (obj.hasOwnProperty(fieldName)) {
      return obj[fieldName];
    }

    // If it's an array, search each item
    if (Array.isArray(obj)) {
      for (let item of obj) {
        const result = searchFieldInResponse(item, fieldName);
        if (result !== undefined) return result;
      }
    } else {
      // If it's an object, search all values
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          const result = searchFieldInResponse(obj[key], fieldName);
          if (result !== undefined) return result;
        }
      }
    }

    return undefined;
  };

  // ===== RENDER CONTENT BASED ON COMPONENT TYPE =====
  const renderComponentContent = () => {
    switch (component.type) {
      case "field":
        const componentState = getComponentState(component);
        
        // If no read permission, don't render the field
        if (!componentState.isVisible) {
          return null;
        }

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

              console.log("onBlur API Response:", response);

              if (response?.data) {
                // Map API response fields to form fields
                const mappingsExecution = component.onBlurApi.fieldMappings?.map((mapping) => {
                  // Search the entire response for the field name
                  const apiValue = searchFieldInResponse(response.data, mapping.apiResponseField);

                  if (apiValue !== undefined && apiValue !== null) {
                    onValueChange(mapping.targetFieldName, apiValue);
                    return true;
                  }
                  return false;
                });

                const successCount = mappingsExecution?.filter(Boolean).length || 0;
                if (successCount > 0) {
                  messageApi.success(
                    `Data fetched successfully (${successCount} field${successCount > 1 ? 's' : ''} populated)`
                  );
                } else {
                  messageApi.warning(
                    "API response received but no matching fields found."
                  );
                }
              }
            } catch (error) {
              console.error("onBlur API call failed:", error);
              messageApi.error("Failed to fetch data on blur");
            }
          }
        };

        const isFieldDisabled = disabled || componentState.isDisabled;

        return (
          <div style={gridColumnStyle}>
            {renderWrapper(
              <div className="flex flex-col w-full gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  {component.label}{" "}
                  {component.required && <span className="text-red-500">*</span>}
                  {componentState.isDisabled && (
                    <LockOutlined className="text-xs text-orange-500" title="Read-only" />
                  )}
                </label>
                <Input
                  type={component.fieldType}
                  placeholder={component.placeholder}
                  value={value || ""}
                  onChange={(e) => onValueChange(component.name, e.target.value)}
                  onBlur={handleFieldBlur}
                  className="rounded-md"
                  disabled={isFieldDisabled}
                  status={componentState.isDisabled ? "warning" : ""}
                />
              </div>,
            )}
          </div>
        );

      case "text":
        const textComponentState = getComponentState(component);
        
        // If no read permission, don't render
        if (!textComponentState.isVisible) {
          return null;
        }

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
        const buttonComponentState = getComponentState(component);
        
        // If no read permission, don't render
        if (!buttonComponentState.isVisible) {
          return null;
        }

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
        const isButtonDisabled = disabled || buttonComponentState.isDisabled;

        return (
          <div style={gridColumnStyle}>
            {renderWrapper(
              <Button
                {...buttonProps}
                onClick={() => {
                  onBtnClick();
                }}
                disabled={isButtonDisabled}
                className={`h-10 px-6 font-medium shadow-sm transition-all duration-200 ${buttonProps.className}`}
                title={isButtonDisabled ? "This action is not permitted" : ""}
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
        const cardComponentState = getComponentState(component);
        
        // If no read permission, don't render
        if (!cardComponentState.isVisible) {
          return null;
        }

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
        const selectComponentState = getComponentState(component);
        
        // If no read permission, don't render
        if (!selectComponentState.isVisible) {
          return null;
        }

        // Filter out empty objects from options
        const validOptions = (component.options || []).filter(
          (opt) => opt && opt.label && opt.value !== undefined,
        );

        const isSelectDisabled = disabled || selectComponentState.isDisabled;

        return (
          <div style={gridColumnStyle}>
            {renderWrapper(
              <div className="flex flex-col w-full gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  {component.label}{" "}
                  {component.required && <span className="text-red-500">*</span>}
                  {selectComponentState.isDisabled && (
                    <LockOutlined className="text-xs text-orange-500" title="Read-only" />
                  )}
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
                  disabled={isSelectDisabled}
                />
              </div>,
            )}
          </div>
        );

      case "table":
        const tableComponentState = getComponentState(component);
        
        // If no read permission, don't render
        if (!tableComponentState.isVisible) {
          return null;
        }

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
                    disabled={tableComponentState.isDisabled}
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
                    disabled={tableComponentState.isDisabled}
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
              <label className="text-sm font-semibold text-slate-700 block mb-3 px-2 flex items-center gap-2">
                {component.label}
                {tableComponentState.isDisabled && (
                  <LockOutlined className="text-xs text-orange-500" title="Read-only" />
                )}
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
                        pageSizeOptions: ["5", "10", "20", "50", "100"],
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

  return (
    <>
      {contextHolder}
      {renderComponentContent()}
    </>
  );
};

export default ComponentRenderer;