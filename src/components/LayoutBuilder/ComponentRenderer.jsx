import { useEffect, useState, useMemo } from "react";
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
  Tooltip,
  Upload,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  LockOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { useApi } from "../../services/axiosClient";
import CustomTable from "../ui/CustomTable";
import FilterSearchPanel from "../ui/FilterSearchPanel";
import CheckboxComponent from "../ui/CheckboxComponent";

const { Text } = Typography;

//  Shared field-label style
const FieldLabel = ({ label, required, disabled, locked }) => (
  <label style={labelStyle}>
    <span style={labelText}>{label}</span>
    {required && <span style={requiredDot}>*</span>}
    {locked && (
      <Tooltip title="Read-only field">
        <LockOutlined
          style={{ fontSize: 11, color: "#f59e0b", flexShrink: 0 }}
        />
      </Tooltip>
    )}
  </label>
);

//  Field wrapper: consistent padding for every grid cell
const FieldWrap = ({ gridColumn, children }) => (
  <div style={{ gridColumn, padding: "0 4px" }}>{children}</div>
);

const uploadNameCache = new Map();

//  Resolve a dot-notation path on an object
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const ComponentRenderer = ({
  component,
  value,
  onValueChange,
  onBtnClick,
  onFilterSearch,
  onRowAction,
  onViewDetails,
  disabled,
  refreshTrigger,
  externalData,
  extraNodes,
}) => {
  const [apiData, setApiData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [useLocalData, setUseLocalData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [fieldError, setFieldError] = useState("");

  const filteredTableData = useMemo(() => {
    if (!searchText) return tableData;
    const lowerSearch = searchText.toLowerCase();
    return tableData.filter((item) =>
      Object.keys(item).some((key) =>
        String(item[key]).toLowerCase().includes(lowerSearch),
      ),
    );
  }, [tableData, searchText]);

  const dataTableApi = useApi();

  //  Permission helpers
  const parsePermissions = (str) => {
    if (!str || str.length < 2)
      return { canRead: true, canWrite: true, canMask: false };
    return {
      canRead: str[0] === "1",
      canWrite: str[1] === "1",
      canMask: str[2] === "1",
    };
  };

  const getComponentState = (comp) => {
    const permissions = parsePermissions(comp.permissionString);
    return {
      isVisible: permissions.canRead,
      isDisabled: !permissions.canWrite,
      permissions,
    };
  };

  //  Fetch dropdown data (API-sourced selects)
  useEffect(() => {
    if (component.type === "select" && component.dataSource === "api") {
      if (!component.dataUrl) return;
      const fetchData = async () => {
        setLoading(true);
        try {
          const apiCfg = component.selectApiCommon || {};
          const method = apiCfg.method || "post";
          let res;

          if (method === "get") {
            res = await dataTableApi.get(component.dataUrl);
          } else {
            const payload = {
              subChannelId: apiCfg.subChannelId,
              subServiceId: apiCfg.subServiceId,
              attributes: {},
            };
            res = await dataTableApi.post(component.dataUrl, payload);
          }

          // Standardised response shape:
          // { data: { attributes: { dropdownValues: [{ label, value }] } } }
          const dropdownValues = res?.data?.attributes?.dropdownValues;
          if (Array.isArray(dropdownValues)) {
            setApiData(dropdownValues);
          } else {
            console.warn("Unexpected dropdown API response shape:", res);
            messageApi.warning("Dropdown API returned an unexpected format.");
          }
        } catch (e) {
          console.error("Failed to fetch dropdown data", e);
          messageApi.error("Failed to load dropdown options.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [
    component.dataSource,
    component.dataUrl,
    component.type,
    component.selectApiCommon,
  ]);

  //  Fetch table data
  useEffect(() => {
    if (component.type === "table" && component.dataUrl) {
      fetchTableData();
    }
  }, [component.dataUrl, component.type, refreshTrigger]);

  useEffect(() => {
    if (externalData !== undefined) {
      setUseLocalData(false);
    }
  }, [externalData]);

  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      const menuParams = {
        subChannelId: component.tableApiCommon?.subChannelId,
        subServiceId: component.tableApiCommon?.subServiceId,
        attributes: {},
      };
      const res = await dataTableApi.post(component.dataUrl, menuParams);
      if (res) {
        const path = component.dataResponsePath || "data.attributes.menuTree";
        const extracted = resolvePath(res, path);
        setTableData(Array.isArray(extracted) ? extracted : []);
        setUseLocalData(true);
      }
    } catch (e) {
      console.error("Failed to fetch table data", e);
      messageApi.error("Failed to load table data");
    } finally {
      setTableLoading(false);
    }
  };

  //  Grid layout helpers
  const offset = component.layout?.offset || 0;
  const colSpan = component.layout?.colSpan || 1;

  const getGridColumn = () => {
    if (
      component.type === "divider" ||
      component.type === "newline" ||
      component.type === "table" ||
      component.type === "upload" ||
      component.type === "text"
    )
      return "1 / -1";
    if (offset > 0) return `${offset + 1} / span ${colSpan}`;
    return `span ${colSpan}`;
  };

  const gc = getGridColumn();

  //  onBlur API helper
  const searchFieldInResponse = (obj, fieldName) => {
    if (!obj || typeof obj !== "object") return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, fieldName))
      return obj[fieldName];
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const r = searchFieldInResponse(item, fieldName);
        if (r !== undefined) return r;
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const r = searchFieldInResponse(obj[key], fieldName);
          if (r !== undefined) return r;
        }
      }
    }
    return undefined;
  };

  //  RENDER
  const renderComponentContent = () => {
    switch (component.type) {
      //  Text Input Field
      case "field": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        const isDisabled = disabled || state.isDisabled;

        const handleFieldBlur = async () => {
          if (!component.onBlurApi?.enabled || !component.onBlurApi?.url)
            return;
          try {
            const payload = {
              subChannelId: component.onBlurApi?.apiCommon?.subChannelId,
              subServiceId: component.onBlurApi?.apiCommon?.subServiceId,
              attributes: { [component.name]: value },
            };
            const response = await dataTableApi.post(
              component.onBlurApi.url,
              payload,
            );
            if (response?.data) {
              const baseData = component.onBlurApi.responsePath
                ? (resolvePath(response, component.onBlurApi.responsePath) ??
                  response.data)
                : response.data;

              const mappings = component.onBlurApi.fieldMappings?.map((m) => {
                const v = searchFieldInResponse(baseData, m.apiResponseField);
                if (v !== undefined && v !== null) {
                  onValueChange(m.targetFieldName, v);
                  return true;
                }
                return false;
              });
              const ok = mappings?.filter(Boolean).length || 0;
              if (ok > 0)
                messageApi.success(`${ok} field${ok > 1 ? "s" : ""} populated`);
              else
                messageApi.warning(
                  "API response received but no matching fields found.",
                );
            }
          } catch (e) {
            console.error("on-Tab-press API call failed:", e);
            messageApi.error("Failed to fetch data on blur");
          }
        };

        return (
          <FieldWrap gridColumn={gc}>
            <div style={fieldGroup}>
              <FieldLabel
                label={component.label}
                required={component.required}
                locked={state.isDisabled}
              />
              {component.fieldType === "date" ? (
                <DatePicker
                  format="DD-MM-YYYY"
                  placeholder={component.placeholder || "Select date"}
                  value={
                    value
                      ? dayjs(value, ["DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY"])
                      : null
                  }
                  onChange={(date, dateString) => {
                    setFieldError("");
                    onValueChange(component.name, dateString);
                  }}
                  onBlur={() => handleFieldBlur()}
                  disabled={isDisabled}
                  status={state.isDisabled ? "warning" : ""}
                  style={{ width: "100%", ...inputStyle(isDisabled) }}
                />
              ) : (
                <Input
                  type={component.fieldType}
                  placeholder={component.placeholder}
                  value={value ?? ""}
                  onChange={(e) => {
                    let val = e.target.value;
                    setFieldError(""); // Clear error on change by default

                    if (component.fieldType === "number") {
                      if (component.onlyPositive && val.includes("-")) {
                        return; // Block negative signs completely
                      }
                      if (val !== "") {
                        const numVal = Number(val);
                        if (
                          component.max !== undefined &&
                          component.max !== null &&
                          numVal > component.max
                        ) {
                          setFieldError(
                            `Maximum allowed value is ${component.max}`,
                          );
                          return; // Block input greater than max
                        }

                        const effectiveMin = component.onlyPositive
                          ? Math.max(component.min || 0, 0)
                          : component.min;
                        if (
                          effectiveMin !== undefined &&
                          effectiveMin !== null &&
                          numVal < effectiveMin
                        ) {
                          // We do not block intermediate typing, but we can set the error
                          // so it shows up if they stop typing.
                          // It will be definitely evaluated on blur as well.
                        }
                      }
                    }
                    onValueChange(component.name, val);
                  }}
                  onBlur={(e) => {
                    let val = e.target.value;
                    if (component.fieldType === "number" && val !== "") {
                      const numVal = Number(val);
                      const effectiveMin = component.onlyPositive
                        ? Math.max(component.min || 0, 0)
                        : component.min;

                      if (
                        effectiveMin !== undefined &&
                        effectiveMin !== null &&
                        numVal < effectiveMin
                      ) {
                        setFieldError(
                          `Minimum allowed value is ${effectiveMin}`,
                        );
                        // Removed auto-correct to allow user to fix it themselves based on the error message
                      }
                    }
                    handleFieldBlur();
                  }}
                  disabled={isDisabled}
                  status={state.isDisabled ? "warning" : ""}
                  style={inputStyle(isDisabled)}
                  min={
                    component.fieldType === "number"
                      ? component.onlyPositive
                        ? Math.max(component.min || 0, 0)
                        : component.min
                      : undefined
                  }
                  max={
                    component.fieldType === "number" ? component.max : undefined
                  }
                />
              )}
              {fieldError && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {fieldError}
                </div>
              )}
            </div>
          </FieldWrap>
        );
      }

      //  Static Text
      case "text": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        return (
          <FieldWrap gridColumn={gc}>
            <Text
              style={{
                fontSize: component.fontSize || 14,
                fontWeight: component.fontWeight || 400,
                color:
                  component.color && component.color !== "#334155"
                    ? component.color
                    : "var(--text-primary)",
                lineHeight: 1.6,
                display: "block",
                padding: "6px 0",
              }}
            >
              {component.content}
            </Text>
            <Divider style={{ margin: "0px", padding: "0px" }} />
          </FieldWrap>
        );
      }

      //  Button
      case "button": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        const isDisabled = disabled || state.isDisabled;

        //  Filter Search Panel mode
        if (component.filterSearch?.enabled) {
          const opts = component.filterSearch.searchOptions || [];
          if (opts.length === 0) {
            return (
              <div style={{ gridColumn: gc, padding: "0 4px" }}>
                <p style={{ color: "#f59e0b", fontSize: 12 }}>
                  Filter Search enabled but no options configured.
                </p>
              </div>
            );
          }
          return (
            <div style={{ gridColumn: "1 / -1", padding: "0 4px" }}>
              <FilterSearchPanel
                searchOptions={opts}
                multiFilter={component.filterSearch.multiFilter !== false}
                buttonLabel={component.label || "Search"}
                isLoading={isDisabled}
                onSearch={(attrs) => onFilterSearch?.(attrs)}
                extraNodes={extraNodes}
              />
            </div>
          );
        }

        //  Regular button mode
        const variantMap = {
          primary: { type: "primary" },
          default: { type: "default" },
          dashed: { type: "dashed" },
          text: { type: "text" },
          link: { type: "link" },
        };
        const btnProps = variantMap[component.variant] ?? { type: "default" };

        return (
          <div style={{ gridColumn: gc }}>
            <Button
              {...btnProps}
              onClick={onBtnClick}
              disabled={isDisabled}
              title={isDisabled ? "This action is not permitted" : ""}
              style={{
                height: 32,
                paddingInline: 16,
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 6,
                transition: "all 0.2s",
              }}
            >
              {component.label}
            </Button>
          </div>
        );
      }

      //  Spacer
      case "spacer":
        return (
          <div
            style={{ gridColumn: gc, height: `${component.height || 12}px` }}
          />
        );

      //  Divider
      case "divider":
        return (
          <div style={{ gridColumn: gc, padding: "0 4px" }}>
            <Divider
              dashed={component.dashed}
              orientation={component.orientation || "center"}
              plain={component.plain}
              style={{ margin: "12px 0 8px 0", borderColor: "#106144" }}
            >
              {component.title}
            </Divider>
          </div>
        );

      //  Card
      case "card": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        return (
          <FieldWrap gridColumn={gc}>
            <Card
              title={component.title}
              bordered
              size="small"
              style={{
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-card)",
                boxShadow: "var(--shadow-sm)",
              }}
              styles={{
                header: {
                  fontWeight: 600,
                  fontSize: 13,
                  borderBottom: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                },
                body: { color: "var(--text-secondary)", padding: 14 },
              }}
            >
              {component.children}
            </Card>
          </FieldWrap>
        );
      }

      //  Newline
      case "newline":
        return <div style={{ gridColumn: "1 / -1" }} />;

      //  Select
      case "select": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        const validOptions = (component.options || []).filter(
          (o) => o && o.label && o.value !== undefined,
        );
        const isDisabled = disabled || state.isDisabled;

        const currentOptions =
          component.dataSource === "api" ? apiData : validOptions;

        let displayValue = value;
        if (value !== undefined && value !== null) {
          const valueExists = currentOptions.some((o) => o.value === value);
          if (!valueExists) {
            const stringifiedValue = String(value);
            const stringExists = currentOptions.some(
              (o) => o.value === stringifiedValue,
            );
            if (stringExists) {
              displayValue = stringifiedValue;
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                const numExists = currentOptions.some(
                  (o) => o.value === numValue,
                );
                if (numExists) displayValue = numValue;
              }
            }
          }
        }

        return (
          <FieldWrap gridColumn={gc}>
            <div style={fieldGroup}>
              <FieldLabel
                label={component.label}
                required={component.required}
                locked={state.isDisabled}
              />
              <Select
                style={{ width: "100%", ...inputStyle(isDisabled) }}
                placeholder={component.placeholder}
                loading={loading}
                value={
                  displayValue !== undefined && displayValue !== null
                    ? displayValue
                    : undefined
                }
                onChange={(val) => onValueChange(component.name, val)}
                options={currentOptions}
                allowClear
                disabled={isDisabled}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                popupMatchSelectWidth={false}
              />
            </div>
          </FieldWrap>
        );
      }

      //  Table
      case "table": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        const mode = component.dataSourceMode || "api";
        const isMixedMode = mode === "mixed";
        const isExternalMode = mode === "external" || isMixedMode;

        // If mixed mode and externalData is defined (meaning button was clicked), use external data
        // If external mode, always use externalData (defaulting to [])
        // Otherwise use filteredTableData
        const effectiveData = isMixedMode
          ? externalData !== undefined && !useLocalData
            ? externalData
            : filteredTableData
          : mode === "external" && !useLocalData
            ? externalData || []
            : filteredTableData;

        const effectiveLoading = isMixedMode
          ? externalData !== undefined && !useLocalData
            ? false
            : tableLoading
          : mode === "external" && !useLocalData
            ? false
            : tableLoading;

        const tableColumns = [];

        if (
          component.rowActions?.showSelect ||
          component.rowActions?.showViewDetails
        ) {
          tableColumns.push({
            title: "Actions",
            key: "actions",
            width: "120px",
            align: "center",
            render: (_, record) => (
              <Space size="small">
                {component.rowActions?.showSelect && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onRowAction(component, record)}
                    disabled={state.isDisabled}
                    style={{ borderRadius: 6, fontWeight: 600 }}
                  >
                    {component.rowActions?.selectLabel || "Select"}
                  </Button>
                )}
                {component.rowActions?.showViewDetails && (
                  <Button
                    size="small"
                    onClick={() => onViewDetails?.(component, record)}
                    disabled={state.isDisabled}
                    style={{
                      borderRadius: 6,
                      fontWeight: 600,
                      background: "rgb(26 98 115)",
                      borderColor: "rgb(41 102 149)",
                      color: "#fff",
                    }}
                  >
                    {component.rowActions?.viewDetailsLabel || "Details"}
                  </Button>
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
            ellipsis: true,
            align: "center",
          })),
        );

        return (
          <div style={{ gridColumn: "1 / -1", padding: "0 4px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 8,
              }}
            >
              <div>
                {component.label && (
                  <div style={{ ...labelStyle, marginBottom: 0 }}>
                    <span style={labelText}>{component.label}</span>
                    {state.isDisabled && (
                      <LockOutlined
                        style={{ fontSize: 11, color: "#f59e0b" }}
                      />
                    )}
                  </div>
                )}
              </div>
              <div>
                <Space>
                  {component.enableSearch !== false && (
                    <Input.Search
                      placeholder="Search table records..."
                      allowClear
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 260 }}
                    />
                  )}
                  {component.dataUrl && (
                    <Tooltip title="Refresh Data">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchTableData}
                        loading={tableLoading}
                      />
                    </Tooltip>
                  )}
                </Space>
              </div>
            </div>
            {/* <Table
              columns={tableColumns}
              dataSource={filteredTableData}
              loading={tableLoading}
              pagination={
                component.pagination !== false
                  ? {
                      pageSize,
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20", "50", "100"],
                      showTotal: (total) => `Total ${total} records`,
                      onChange: (_, size) => setPageSize(size),
                      onShowSizeChange: (_, size) => setPageSize(size),
                    }
                  : false
              }
              rowKey={(record) => record.id || Math.random()}
              size="small"
              scroll={{ x: true }}
              expandable={{ showExpandColumn: false }}
              style={{
                borderRadius: 10,
                border: "1px solid #e8edf2",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
              }}
              className="rbs-table"
            /> */}
            <CustomTable
              dataSource={effectiveData}
              columns={tableColumns}
              rowKey="id"
              loading={effectiveLoading}
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
              // Animation props
              rowAnimation="zoom"
              animationDuration={0.3}
              staggerChildren={0.05}
            />
          </div>
        );
      }

      //  Checkbox (single or group)
      case "checkbox": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        return (
          <FieldWrap gridColumn={gc}>
            <CheckboxComponent
              component={component}
              value={value}
              onValueChange={onValueChange}
              disabled={disabled}
              state={state}
            />
          </FieldWrap>
        );
      }

      //  Upload
      case "upload": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        const isDisabled = disabled || state.isDisabled;
        const isMultiple = component.maxCount > 1;

        const currentArray = Array.isArray(value)
          ? value
          : value
            ? [value]
            : [];

        const handleCustomRequest = ({ file, onSuccess, onError }) => {
          if (component.uploadFormat === "Base64") {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              uploadNameCache.set(reader.result, file.name);
              const nextArray = [...currentArray, reader.result];
              onValueChange(
                component.name,
                isMultiple ? nextArray : reader.result,
              );
              onSuccess("ok");
            };
            reader.onerror = (error) => {
              onError(error);
            };
          } else {
            // Default BLOB format
            const nextArray = [...currentArray, file];
            onValueChange(component.name, isMultiple ? nextArray : file);
            onSuccess("ok");
          }
        };

        const handleRemove = (fileToRemove) => {
          const valToRemove = fileToRemove.originValue;
          const nextArray = currentArray.filter((v) => v !== valToRemove);
          if (nextArray.length === 0) {
            onValueChange(component.name, undefined);
          } else {
            onValueChange(
              component.name,
              isMultiple ? nextArray : nextArray[0],
            );
          }
        };

        const fileList = currentArray.map((v, idx) => ({
          uid: `-${idx}`,
          name:
            v instanceof File
              ? v.name
              : uploadNameCache.get(v) || `uploaded-file-${idx + 1}`,
          status: "done",
          originValue: v,
        }));

        const uploadProps = {
          customRequest: handleCustomRequest,
          maxCount: component.maxCount || 1,
          multiple: isMultiple,
          accept: component.accept || undefined,
          disabled: isDisabled,
          onRemove: handleRemove,
          fileList: fileList,
        };

        return (
          <div style={{ gridColumn: gc, padding: "0 4px" }}>
            <div style={fieldGroup}>
              <FieldLabel
                label={component.label}
                required={component.required}
                locked={state.isDisabled}
              />
              <Upload.Dragger
                {...uploadProps}
                style={{
                  width: "100%",
                  background: isDisabled ? "var(--bg-app)" : "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined
                    style={{
                      color: "var(--accent-gradient-end)",
                      fontWeight: "200",
                    }}
                  />
                </p>
                <p
                  className="ant-upload-text"
                  style={{ color: "var(--text-secondary)", fontWeight: "400" }}
                >
                  Click or drag file to this area to upload
                </p>
              </Upload.Dragger>
            </div>
          </div>
        );
      }

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

//  Shared style tokens

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 3,
};

const labelText = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  letterSpacing: "0.01em",
  lineHeight: 1,
};

const requiredDot = {
  color: "#ef4444",
  flexShrink: 0,
  fontSize: 12,
  lineHeight: 1,
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
  paddingBottom: 2,
};

const inputStyle = (isDisabled) => ({
  borderRadius: 6,
  fontSize: 13,
  height: 32,
  width: "100%",
  background: isDisabled ? "var(--bg-app)" : "var(--bg-card)",
  borderColor: "var(--border-color)",
  color: "var(--text-primary)",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

export default ComponentRenderer;
