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
} from "antd";
import { DeleteOutlined, LockOutlined } from "@ant-design/icons";
import { useApi } from "../../utilities/axiosApiCall";
import CustomTable from "../UI/CustomTable";
import FilterSearchPanel from "../UI/FilterSearchPanel";
import CheckboxComponent from "../UI/CheckboxComponent";

const { Text } = Typography;

// ── Shared field-label style ───────────────────────────────────────────────────
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

// ── Field wrapper: consistent padding for every grid cell ─────────────────────
const FieldWrap = ({ gridColumn, children }) => (
  <div style={{ gridColumn, padding: "0 8px" }}>{children}</div>
);

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
}) => {
  const [apiData, setApiData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

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

  // ── Permission helpers ───────────────────────────────────────────────────────
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

  // ── Fetch dropdown data (API-sourced selects) ────────────────────────────────
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

  // ── Fetch table data ─────────────────────────────────────────────────────────
  // Fetch table data when dataUrl, type or refreshTrigger changes
  useEffect(() => {
    if (component.type === "table" && component.dataUrl) {
      fetchTableData();
    }
  }, [component.dataUrl, component.type, refreshTrigger]);

  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      const menuParams = {
        subChannelId: component.tableApiCommon.subChannelId,
        subServiceId: component.tableApiCommon.subServiceId,
        attributes: {},
      };
      const res = await dataTableApi.post(component.dataUrl, menuParams);
      if (res?.data) setTableData(res.data.attributes.menuTree);
    } catch (e) {
      console.error("Failed to fetch table data", e);
      messageApi.error("Failed to load table data");
    } finally {
      setTableLoading(false);
    }
  };

  // ── Grid layout helpers ──────────────────────────────────────────────────────
  const offset = component.layout?.offset || 0;
  const colSpan = component.layout?.colSpan || 1;

  const getGridColumn = () => {
    if (
      component.type === "divider" ||
      component.type === "newline" ||
      component.type === "table"
    )
      return "1 / -1";
    if (offset > 0) return `${offset + 1} / span ${colSpan}`;
    return `span ${colSpan}`;
  };

  const gc = getGridColumn();

  // ── onBlur API helper ────────────────────────────────────────────────────────
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

  // ── RENDER ─────────────────────────────────────────────────────────────────────
  const renderComponentContent = () => {
    switch (component.type) {
      // ── Text Input Field ───────────────────────────────────────────────────
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
              const mappings = component.onBlurApi.fieldMappings?.map((m) => {
                const v = searchFieldInResponse(
                  response.data,
                  m.apiResponseField,
                );
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
              <Input
                type={component.fieldType}
                placeholder={component.placeholder}
                value={value || ""}
                onChange={(e) => onValueChange(component.name, e.target.value)}
                onBlur={handleFieldBlur}
                disabled={isDisabled}
                status={state.isDisabled ? "warning" : ""}
                style={inputStyle(isDisabled)}
              />
            </div>
          </FieldWrap>
        );
      }

      // ── Static Text ────────────────────────────────────────────────────────
      case "text": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        return (
          <FieldWrap gridColumn={gc}>
            <Text
              style={{
                fontSize: component.fontSize || 14,
                fontWeight: component.fontWeight || 400,
                color: component.color || "#334155",
                lineHeight: 1.6,
                display: "block",
                padding: "6px 0",
              }}
            >
              {component.content}
            </Text>
          </FieldWrap>
        );
      }

      // ── Button ─────────────────────────────────────────────────────────────
      case "button": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;
        const isDisabled = disabled || state.isDisabled;

        // ── Filter Search Panel mode ─────────────────────────────────────────
        if (component.filterSearch?.enabled) {
          const opts = component.filterSearch.searchOptions || [];
          if (opts.length === 0) {
            return (
              <div style={{ gridColumn: gc, padding: "0 8px" }}>
                <p style={{ color: "#f59e0b", fontSize: 12 }}>
                  ⚠ Filter Search enabled but no options configured.
                </p>
              </div>
            );
          }
          return (
            <div style={{ gridColumn: "1 / -1", padding: "0 8px" }}>
              <FilterSearchPanel
                searchOptions={opts}
                multiFilter={component.filterSearch.multiFilter !== false}
                buttonLabel={component.label || "Search"}
                isLoading={isDisabled}
                onSearch={(attrs) => onFilterSearch?.(attrs)}
              />
            </div>
          );
        }

        // ── Regular button mode ──────────────────────────────────────────────
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
                height: 38,
                paddingInline: 24,
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 8,
                transition: "all 0.2s",
              }}
            >
              {component.label}
            </Button>
          </div>
        );
      }

      // ── Spacer ─────────────────────────────────────────────────────────────
      case "spacer":
        return (
          <div
            style={{ gridColumn: gc, height: `${component.height || 16}px` }}
          />
        );

      // ── Divider ────────────────────────────────────────────────────────────
      case "divider":
        return (
          <div style={{ gridColumn: gc, padding: "0 8px" }}>
            <Divider
              dashed={component.dashed}
              orientation={component.orientation || "center"}
              plain={component.plain}
              style={{ margin: "20px 0 10px 0", borderColor: "#106144" }}
            >
              {component.title}
            </Divider>
          </div>
        );

      // ── Card ───────────────────────────────────────────────────────────────
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
                border: "1px solid #e8edf2",
                boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
              }}
              styles={{
                header: {
                  fontWeight: 600,
                  fontSize: 13,
                  borderBottom: "1px solid #f1f5f9",
                },
                body: { color: "#64748b", padding: 14 },
              }}
            >
              {component.children}
            </Card>
          </FieldWrap>
        );
      }

      // ── Newline ────────────────────────────────────────────────────────────
      case "newline":
        return <div style={{ gridColumn: "1 / -1" }} />;

      // ── Select ─────────────────────────────────────────────────────────────
      case "select": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        const validOptions = (component.options || []).filter(
          (o) => o && o.label && o.value !== undefined,
        );
        const isDisabled = disabled || state.isDisabled;

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
                value={value || undefined}
                onChange={(val) => onValueChange(component.name, val)}
                options={
                  component.dataSource === "api" ? apiData : validOptions
                }
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

      // ── Table ──────────────────────────────────────────────────────────────
      case "table": {
        const state = getComponentState(component);
        if (!state.isVisible) return null;

        // Determine effective data source:
        // External mode: dataSourceButtonName is set and no dataUrl
        const isExternalMode = !component.dataUrl && component.dataSourceButtonName;
        const effectiveData = isExternalMode ? (externalData || []) : filteredTableData;
        const effectiveLoading = isExternalMode ? false : tableLoading;

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
          <div style={{ gridColumn: "1 / -1", padding: "0 8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 12,
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
                {component.enableSearch !== false && (
                  <Input.Search
                    placeholder="Search table records..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 260 }}
                  />
                )}
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

      // ── Checkbox (single or group) ──────────────────────────────────────
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

// ── Shared style tokens ────────────────────────────────────────────────────────

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginBottom: 5,
};

const labelText = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "#475569",
  letterSpacing: "0.01em",
  lineHeight: 1,
};

const requiredDot = {
  color: "#ef4444",
  flexShrink: 0,
  fontSize: 13,
  lineHeight: 1,
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
  paddingBottom: 4,
};

const inputStyle = (isDisabled) => ({
  borderRadius: 8,
  fontSize: 13.5,
  height: 36,
  background: isDisabled ? "#f8fafc" : "#fff",
  borderColor: "#e2e8f0",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

export default ComponentRenderer;
