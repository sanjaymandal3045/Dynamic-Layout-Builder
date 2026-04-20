import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  InputNumber,
  Select,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { BUTTON_VARIANTS, FIELD_TYPES } from "../../utilities/constants";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// Mock data - will be replaced with API calls later
const SUBCHANNEL_OPTIONS = [
  { label: "Channel 1", value: 1 },
  { label: "Channel 2", value: 2 },
  { label: "Channel 3", value: 3 },
];

const SUBSERVICE_OPTIONS = [
  { label: "Service 1", value: 1 },
  { label: "Service 2", value: 2 },
  { label: "Service 3", value: 3 },
  { label: "Service 4", value: 4 },
  { label: "Service 5", value: 5 },
  { label: "Service 6", value: 6 },
  { label: "Service 7", value: 7 },
];

const ComponentConfigDrawer = ({ open, onClose, component, onSave, config }) => {
  const [formData, setFormData] = useState(component || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (component) {
      setFormData(component);
    }
  }, [component, open]);

  if (!component) return null;

  const validate = () => {
    const newErrors = {};
    if (formData.type === "field") {
      if (!formData.name)
        newErrors.name = "Field Name is required for data mapping";
      if (!formData.label) newErrors.label = "Display Label is required";

      // Validate onBlur API if enabled
      if (formData.onBlurApi?.enabled) {
        if (!formData.onBlurApi?.url) {
          newErrors.onBlurApiUrl = "API URL is required for onBlur";
        }
        if (!formData.onBlurApi?.apiCommon?.subChannelId) {
          newErrors.onBlurSubChannelId = "Sub Channel ID is required";
        }
        if (!formData.onBlurApi?.apiCommon?.subServiceId) {
          newErrors.onBlurSubServiceId = "Sub Service ID is required";
        }
        if (!formData.onBlurApi?.apiCommon?.traceNo) {
          newErrors.onBlurTraceNo = "Trace No is required";
        }
        if (!formData.onBlurApi?.fieldMappings || formData.onBlurApi.fieldMappings.length === 0) {
          newErrors.onBlurFieldMappings = "At least one field mapping is required";
        }
      }
    }
    if (formData.type === "button") {
      // ✅ NEW: Button name validation
      if (!formData.name) newErrors.name = "Button Name is required for binding";
      if (!formData.label) newErrors.label = "Button text is required";

      // Validate API fields only if action is not "reset"
      if (formData.onClick !== "reset") {
        if (!formData.api?.url) {
          newErrors.apiUrl = "API Endpoint URL is required";
        }
        if (!formData.apiCommon?.subChannelId) {
          newErrors.subChannelId = "Sub Channel ID is required";
        }
        if (!formData.apiCommon?.subServiceId) {
          newErrors.subServiceId = "Sub Service ID is required";
        }
        if (!formData.apiCommon?.traceNo) {
          newErrors.traceNo = "Trace No is required";
        }
      }
    }
    if (formData.type === "table") {
      // ✅ NEW: Table name validation
      if (!formData.name) newErrors.name = "Table Name is required for binding";
      if (!formData.label) newErrors.label = "Table Label is required";
      if (!formData.dataUrl) newErrors.dataUrl = "Data API URL is required";
      if (!formData.columns || formData.columns.length === 0) {
        newErrors.columns = "At least one column is required";
      }
      if (!formData.tableApiCommon?.subChannelId) {
        newErrors.subChannelId = "Sub Channel ID is required";
      }
      if (!formData.tableApiCommon?.subServiceId) {
        newErrors.subServiceId = "Sub Service ID is required";
      }
      if (!formData.tableApiCommon?.traceNo) {
        newErrors.traceNo = "Trace No is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      setErrors({});
    }
  };

  const updateField = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const updateApiField = (key, value) => {
    setFormData({
      ...formData,
      api: { ...formData.api, [key]: value },
    });
  };

  const updateApiCommonField = (key, value) => {
    setFormData({
      ...formData,
      apiCommon: { ...formData.apiCommon, [key]: value },
    });
  };

  const updateTableColumn = (index, key, value) => {
    const updatedColumns = [...(formData.columns || [])];
    updatedColumns[index] = { ...updatedColumns[index], [key]: value };
    setFormData({ ...formData, columns: updatedColumns });
  };

  const addTableColumn = () => {
    const newColumn = {
      id: Date.now(),
      label: "New Column",
      name: `col_${Date.now()}`,
      dataIndex: `col_${Date.now()}`,
    };
    setFormData({
      ...formData,
      columns: [...(formData.columns || []), newColumn],
    });
  };

  const removeTableColumn = (index) => {
    const updatedColumns = formData.columns.filter((_, i) => i !== index);
    setFormData({ ...formData, columns: updatedColumns });
  };

  const updateTableRowAction = (actionKey, value) => {
    setFormData({
      ...formData,
      rowActions: { ...formData.rowActions, [actionKey]: value },
    });
  };

  const updateViewDetailsState = (currentObj) => {
    setFormData((prev) => ({
      ...prev,
      rowActions: {
        ...prev.rowActions,
        viewDetailsConfig: currentObj,
        viewDetailsConfigText: currentObj === undefined ? undefined : JSON.stringify(currentObj, null, 2),
      },
    }));
  };

  const updateTableApiField = (key, value) => {
    setFormData({
      ...formData,
      tableApi: { ...formData.tableApi, [key]: value },
    });
  };

  const updateTableApiCommonField = (key, value) => {
    setFormData({
      ...formData,
      tableApiCommon: { ...formData.tableApiCommon, [key]: value },
    });
  };

  const containerStyle = {
    marginBottom: 16,
  };

  const labelStyle = {
    display: "block",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  };

  return (
    <Drawer
      title={`Configure ${component.type}`}
      onClose={onClose}
      open={open}
      width={500}
    >
      <div className="flex flex-col gap-4">
        {component.type === "field" && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Field Name
              </label>
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. fromDate"
                size="large"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Label
              </label>
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. From Date"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Field Type
              </label>
              <Select
                popupMatchSelectWidth={false}
                value={formData.fieldType}
                options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
                onChange={(v) => updateField("fieldType", v)}
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Placeholder
              </label>
              <Input
                value={formData.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
                placeholder="Enter placeholder text"
                size="large"
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={formData.required}
                onChange={(e) => updateField("required", e.target.checked)}
              >
                Mark as Required
              </Checkbox>
            </div>

            <Divider />

            {/* API Configuration for onBlur */}
            <div className="flex items-center mb-4">
              <Checkbox
                checked={formData.onBlurApi?.enabled}
                onChange={(e) =>
                  updateField("onBlurApi", {
                    ...formData.onBlurApi,
                    enabled: e.target.checked,
                  })
                }
              >
                Enable onBlur API Call
              </Checkbox>
            </div>

            {formData.onBlurApi?.enabled && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                  <p className="text-xs text-blue-700 mb-3">
                    When user leaves this field, an API will be called and response data can populate other fields.
                  </p>

                  {/* API Endpoint */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      API Endpoint URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      status={errors.onBlurApiUrl ? "error" : ""}
                      value={formData.onBlurApi?.url || ""}
                      onChange={(e) =>
                        updateField("onBlurApi", {
                          ...formData.onBlurApi,
                          url: e.target.value,
                        })
                      }
                      placeholder="/api/validate"
                      size="large"
                    />
                    {errors.onBlurApiUrl && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.onBlurApiUrl}
                      </p>
                    )}
                  </div>

                  {/* HTTP Method */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      HTTP Method
                    </label>
                    <Select
                      popupMatchSelectWidth={false}
                      value={formData.onBlurApi?.method || "post"}
                      options={[
                        { value: "get", label: "GET" },
                        { value: "post", label: "POST" },
                      ]}
                      onChange={(v) =>
                        updateField("onBlurApi", {
                          ...formData.onBlurApi,
                          method: v,
                        })
                      }
                      size="large"
                    />
                  </div>

                  {/* Sub Channel ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      Sub Channel ID <span className="text-red-500">*</span>
                    </label>
                    <Select
                      status={errors.onBlurSubChannelId ? "error" : ""}
                      popupMatchSelectWidth={false}
                      value={formData.onBlurApi?.apiCommon?.subChannelId}
                      options={SUBCHANNEL_OPTIONS}
                      onChange={(v) =>
                        updateField("onBlurApi", {
                          ...formData.onBlurApi,
                          apiCommon: {
                            ...formData.onBlurApi?.apiCommon,
                            subChannelId: v,
                          },
                        })
                      }
                      placeholder="Select a channel"
                      size="large"
                    />
                    {errors.onBlurSubChannelId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.onBlurSubChannelId}
                      </p>
                    )}
                  </div>

                  {/* Sub Service ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      Sub Service ID <span className="text-red-500">*</span>
                    </label>
                    <Select
                      status={errors.onBlurSubServiceId ? "error" : ""}
                      popupMatchSelectWidth={false}
                      value={formData.onBlurApi?.apiCommon?.subServiceId}
                      options={SUBSERVICE_OPTIONS}
                      onChange={(v) =>
                        updateField("onBlurApi", {
                          ...formData.onBlurApi,
                          apiCommon: {
                            ...formData.onBlurApi?.apiCommon,
                            subServiceId: v,
                          },
                        })
                      }
                      placeholder="Select a service"
                      size="large"
                    />
                    {errors.onBlurSubServiceId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.onBlurSubServiceId}
                      </p>
                    )}
                  </div>

                  {/* Trace No */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      Trace No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      status={errors.onBlurTraceNo ? "error" : ""}
                      value={formData.onBlurApi?.apiCommon?.traceNo || ""}
                      onChange={(e) =>
                        updateField("onBlurApi", {
                          ...formData.onBlurApi,
                          apiCommon: {
                            ...formData.onBlurApi?.apiCommon,
                            traceNo: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. REQ-VALIDATE-FIELD"
                      size="large"
                    />
                    {errors.onBlurTraceNo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.onBlurTraceNo}
                      </p>
                    )}
                  </div>

                  <Divider />

                  {/* Field Mapping */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Field Mappings <span className="text-red-500">*</span>
                      </label>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newMapping = {
                            id: Date.now(),
                            apiResponseField: "",
                            targetFieldName: "",
                          };
                          updateField("onBlurApi", {
                            ...formData.onBlurApi,
                            fieldMappings: [
                              ...(formData.onBlurApi?.fieldMappings || []),
                              newMapping,
                            ],
                          });
                        }}
                      >
                        Add Mapping
                      </Button>
                    </div>

                    {errors.onBlurFieldMappings && (
                      <p className="text-red-500 text-xs mb-2">
                        {errors.onBlurFieldMappings}
                      </p>
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {formData.onBlurApi?.fieldMappings?.map(
                        (mapping, index) => (
                          <div
                            key={mapping.id}
                            className="p-3 bg-white rounded border border-slate-200 hover:border-blue-300 space-y-2 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                Mapping {index + 1}
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  const updated = formData.onBlurApi?.fieldMappings?.filter(
                                    (_, i) => i !== index
                                  );
                                  updateField("onBlurApi", {
                                    ...formData.onBlurApi,
                                    fieldMappings: updated,
                                  });
                                }}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-slate-600 block mb-1">
                                API Response Field Name
                              </label>
                              <Input
                                size="small"
                                placeholder="e.g. menuName"
                                value={mapping.apiResponseField || ""}
                                onChange={(e) => {
                                  const updated =
                                    formData.onBlurApi?.fieldMappings?.map(
                                      (m, i) =>
                                        i === index
                                          ? {
                                              ...m,
                                              apiResponseField:
                                                e.target.value,
                                            }
                                          : m
                                    );
                                  updateField("onBlurApi", {
                                    ...formData.onBlurApi,
                                    fieldMappings: updated,
                                  });
                                }}
                              />
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Enter the exact field name from the API response
                              </p>
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-slate-600 block mb-1">
                                Target Field Name
                              </label>
                              <Input
                                size="small"
                                placeholder="e.g. field_1234567890"
                                value={mapping.targetFieldName || ""}
                                onChange={(e) => {
                                  const updated =
                                    formData.onBlurApi?.fieldMappings?.map(
                                      (m, i) =>
                                        i === index
                                          ? {
                                              ...m,
                                              targetFieldName:
                                                e.target.value,
                                            }
                                          : m
                                    );
                                  updateField("onBlurApi", {
                                    ...formData.onBlurApi,
                                    fieldMappings: updated,
                                  });
                                }}
                              />
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                The form field name to populate (must match another field's name)
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {component.type === "text" && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Content
              </label>
              <Input.TextArea
                value={formData.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={4}
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Font Size (px)
              </label>
              <InputNumber
                min={12}
                max={48}
                value={formData.fontSize}
                onChange={(v) => updateField("fontSize", v)}
                className="w-full"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Font Weight
              </label>
              <Select
                popupMatchSelectWidth={false}
                value={formData.fontWeight}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "bold", label: "Bold" },
                  { value: "lighter", label: "Lighter" },
                ]}
                onChange={(v) => updateField("fontWeight", v)}
                size="large"
              />
            </div>
          </>
        )}

        {component.type === "button" && (
          <>
            {/* ✅ Button Name Field */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Button Name <span className="text-red-500">*</span>
              </label>
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. submitButton, searchButton"
                size="large"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Used to identify this button for table bindings
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Button Label
              </label>
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Submit"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Variant
              </label>
              <Select
                popupMatchSelectWidth={false}
                value={formData.variant}
                options={BUTTON_VARIANTS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                onChange={(v) => updateField("variant", v)}
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                On Click Action
              </label>
              <Select
                popupMatchSelectWidth={false}
                value={formData.onClick}
                options={[
                  { value: "submit", label: "Submit Form" },
                  { value: "reset", label: "Reset Form" },
                  { value: "custom", label: "Custom Action" },
                ]}
                onChange={(v) => updateField("onClick", v)}
                size="large"
              />
            </div>

            {/* CONDITIONAL API SECTION: Only show if it's NOT a reset button */}
            {formData.onClick !== "reset" && (
              <>
                <Divider />
                <h4 className="font-semibold mb-4 text-slate-800">
                  API Configuration
                </h4>

                {/* API Endpoint */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    API Endpoint URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    status={errors.apiUrl ? "error" : ""}
                    value={formData.api?.url || ""}
                    onChange={(e) => updateApiField("url", e.target.value)}
                    placeholder="/api/submit"
                    size="large"
                  />
                  {errors.apiUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.apiUrl}</p>
                  )}
                </div>

                {/* HTTP Method */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    HTTP Method
                  </label>
                  <Select
                    popupMatchSelectWidth={false}
                    value={formData.api?.method || "post"}
                    options={[
                      { value: "get", label: "GET" },
                      { value: "post", label: "POST" },
                      { value: "put", label: "PUT" },
                      { value: "delete", label: "DELETE" },
                    ]}
                    onChange={(v) => updateApiField("method", v)}
                    size="large"
                  />
                </div>

                <Divider />

                {/* Sub Channel ID */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Sub Channel ID <span className="text-red-500">*</span>
                  </label>
                  <Select
                    status={errors.subChannelId ? "error" : ""}
                    popupMatchSelectWidth={false}
                    value={formData.apiCommon?.subChannelId}
                    options={SUBCHANNEL_OPTIONS}
                    onChange={(v) => updateApiCommonField("subChannelId", v)}
                    placeholder="Select a channel"
                    size="large"
                  />
                  {errors.subChannelId && (
                    <p className="text-red-500 text-xs mt-1">{errors.subChannelId}</p>
                  )}
                </div>

                {/* Sub Service ID */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Sub Service ID <span className="text-red-500">*</span>
                  </label>
                  <Select
                    status={errors.subServiceId ? "error" : ""}
                    popupMatchSelectWidth={false}
                    value={formData.apiCommon?.subServiceId}
                    options={SUBSERVICE_OPTIONS}
                    onChange={(v) => updateApiCommonField("subServiceId", v)}
                    placeholder="Select a service"
                    size="large"
                  />
                  {errors.subServiceId && (
                    <p className="text-red-500 text-xs mt-1">{errors.subServiceId}</p>
                  )}
                </div>

                {/* Trace No */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Trace No <span className="text-red-500">*</span>
                  </label>
                  <Input
                    status={errors.traceNo ? "error" : ""}
                    value={formData.apiCommon?.traceNo || ""}
                    onChange={(e) =>
                      updateApiCommonField("traceNo", e.target.value)
                    }
                    placeholder="e.g. REQ-CREATE-001"
                    size="large"
                  />
                  {errors.traceNo && (
                    <p className="text-red-500 text-xs mt-1">{errors.traceNo}</p>
                  )}
                </div>

                {/* ── Response Field Mappings ─────────────────────── */}
                <Divider />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-0.5">
                        Response Field Mappings
                      </h4>
                      <p className="text-xs text-slate-500">
                        After a successful API call, map response fields to form inputs automatically.
                      </p>
                    </div>
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        const newMapping = {
                          id: Date.now(),
                          apiResponseField: "",
                          targetFieldName: "",
                        };
                        updateField("fieldMappings", [
                          ...(formData.fieldMappings || []),
                          newMapping,
                        ]);
                      }}
                    >
                      Add Mapping
                    </Button>
                  </div>

                  {(formData.fieldMappings || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg">
                      No mappings yet — add one above to auto-fill fields from the response.
                    </p>
                  )}

                  <div className="space-y-2 max-h-56 overflow-y-auto mt-2">
                    {(formData.fieldMappings || []).map((mapping, index) => (
                      <div
                        key={mapping.id}
                        className="p-3 bg-green-50 rounded border border-green-200 hover:border-green-400 space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            Mapping {index + 1}
                          </span>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              updateField(
                                "fieldMappings",
                                (formData.fieldMappings || []).filter(
                                  (_, i) => i !== index
                                )
                              );
                            }}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">
                            API Response Field Name
                          </label>
                          <Input
                            size="small"
                            placeholder="e.g. customerName"
                            value={mapping.apiResponseField || ""}
                            onChange={(e) => {
                              updateField(
                                "fieldMappings",
                                (formData.fieldMappings || []).map((m, i) =>
                                  i === index
                                    ? { ...m, apiResponseField: e.target.value }
                                    : m
                                )
                              );
                            }}
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Exact key from the API response (deep search supported)
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">
                            Target Field Name
                          </label>
                          <Input
                            size="small"
                            placeholder="e.g. customerName or field_123"
                            value={mapping.targetFieldName || ""}
                            onChange={(e) => {
                              updateField(
                                "fieldMappings",
                                (formData.fieldMappings || []).map((m, i) =>
                                  i === index
                                    ? { ...m, targetFieldName: e.target.value }
                                    : m
                                )
                              );
                            }}
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            The form field's name to populate with this value
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {component.type === "card" && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Card Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Card Title"
                size="large"
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={formData.bordered}
                onChange={(e) => updateField("bordered", e.target.checked)}
              >
                Show Border
              </Checkbox>
            </div>
          </>
        )}

        {component.type === "spacer" && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">
              Height (px)
            </label>
            <InputNumber
              min={8}
              max={128}
              value={formData.height}
              onChange={(v) => updateField("height", v)}
              className="w-full"
              size="large"
            />
          </div>
        )}

        {formData.type === "select" && (
          <>
            <div style={containerStyle}>
              <label style={labelStyle}>Select Name</label>
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. selectCountry"
                size="large"
              />
            </div>
            <div style={containerStyle}>
              <label style={labelStyle}>Label</label>
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Select Country"
                size="large"
              />
            </div>
            <div style={containerStyle}>
              <label style={labelStyle}>Placeholder</label>
              <Input
                value={formData.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
                placeholder="e.g. Choose an option"
                size="large"
              />
            </div>
            <div style={containerStyle}>
              <label style={labelStyle}>Data Source</label>
              <Select
                value={formData.dataSource}
                onChange={(v) => updateField("dataSource", v)}
                options={[
                  { value: "manual", label: "Manual Entry (Static)" },
                  { value: "api", label: "Remote API (Dynamic)" },
                ]}
                size="large"
              />
            </div>

            {formData.dataSource === "manual" ? (
              <div style={containerStyle}>
                <label style={labelStyle}>Options (Label/Value Pairs)</label>
                <Input.TextArea
                  rows={8}
                  placeholder='[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'
                  value={formData.optionsText || JSON.stringify(formData.options || [], null, 2)}
                  onChange={(e) => {
                    const text = e.target.value;
                    // Store the raw text for editing
                    updateField("optionsText", text);

                    // Try to parse it
                    try {
                      const parsed = JSON.parse(text);
                      if (Array.isArray(parsed)) {
                        updateField("options", parsed);
                      }
                    } catch (err) {
                      // Silent fail - let user continue typing
                    }
                  }}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                />
                <p style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                  Must be valid JSON array. Format: [{`"label": "text", "value": "value"`}]
                </p>
              </div>
            ) : (
              <div style={containerStyle}>
                <label style={labelStyle}>API Endpoint URL</label>
                <Input
                  placeholder="https://api.example.com/data"
                  value={formData.dataUrl}
                  onChange={(e) => updateField("dataUrl", e.target.value)}
                  size="large"
                />
                <p style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                  Note: API should return an array of objects with "label" and "value" keys.
                </p>
              </div>
            )}

            <div style={containerStyle}>
              <Checkbox
                checked={formData.required}
                onChange={(e) => updateField("required", e.target.checked)}
              >
                Mark as Required
              </Checkbox>
            </div>
          </>
        )}

        {component.type === "table" && (
          <>
            {/* ✅ Table Name Field */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Table Name <span className="text-red-500">*</span>
              </label>
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. resultsTable, ordersTable"
                size="large"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Used to identify this table for button bindings
              </p>
            </div>

            {/* Table Label */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Table Label
              </label>
              <Input
                status={errors.label ? "error" : ""}
                value={formData.label || ""}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Records Table"
                size="large"
              />
              {errors.label && (
                <p className="text-red-500 text-xs mt-1">{errors.label}</p>
              )}
            </div>

            {/* Data API URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Data API URL <span className="text-red-500">*</span>
              </label>
              <Input
                status={errors.dataUrl ? "error" : ""}
                value={formData.dataUrl || ""}
                onChange={(e) => updateField("dataUrl", e.target.value)}
                placeholder="e.g. /api/records"
                size="large"
              />
              {errors.dataUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.dataUrl}</p>
              )}
            </div>

            {/* API Configuration Section */}
            <h4 className="font-semibold mb-4 text-slate-800">
              API Configuration
            </h4>

            {/* Sub Channel ID */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Sub Channel ID <span className="text-red-500">*</span>
              </label>
              <Select
                status={errors.subChannelId ? "error" : ""}
                popupMatchSelectWidth={false}
                value={formData.tableApiCommon?.subChannelId}
                options={SUBCHANNEL_OPTIONS}
                onChange={(v) => updateTableApiCommonField("subChannelId", v)}
                placeholder="Select a channel"
                size="large"
              />
              {errors.subChannelId && (
                <p className="text-red-500 text-xs mt-1">{errors.subChannelId}</p>
              )}
            </div>

            {/* Sub Service ID */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Sub Service ID <span className="text-red-500">*</span>
              </label>
              <Select
                status={errors.subServiceId ? "error" : ""}
                popupMatchSelectWidth={false}
                value={formData.tableApiCommon?.subServiceId}
                options={SUBSERVICE_OPTIONS}
                onChange={(v) => updateTableApiCommonField("subServiceId", v)}
                placeholder="Select a service"
                size="large"
              />
              {errors.subServiceId && (
                <p className="text-red-500 text-xs mt-1">{errors.subServiceId}</p>
              )}
            </div>

            {/* Trace No */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Trace No <span className="text-red-500">*</span>
              </label>
              <Input
                status={errors.traceNo ? "error" : ""}
                value={formData.tableApiCommon?.traceNo || ""}
                onChange={(e) =>
                  updateTableApiCommonField("traceNo", e.target.value)
                }
                placeholder="e.g. REQ-GET-RECORDS"
                size="large"
              />
              {errors.traceNo && (
                <p className="text-red-500 text-xs mt-1">{errors.traceNo}</p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center">
              <Checkbox
                checked={formData.pagination !== false}
                onChange={(e) => updateField("pagination", e.target.checked)}
              >
                Enable Pagination
              </Checkbox>
            </div>

            <Divider />

            {/* Columns Configuration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Table Columns
                </label>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addTableColumn}
                >
                  Add Column
                </Button>
              </div>

              {errors.columns && (
                <p className="text-red-500 text-xs mb-3">{errors.columns}</p>
              )}

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formData.columns?.map((column, index) => (
                  <div
                    key={column.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Column {index + 1}
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeTableColumn(index)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">
                          Column Label
                        </label>
                        <Input
                          size="small"
                          placeholder="e.g. User Name"
                          value={column.label || ""}
                          onChange={(e) =>
                            updateTableColumn(index, "label", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600">
                          Data Key (API response field name)
                        </label>
                        <Input
                          size="small"
                          placeholder="e.g. userName"
                          value={column.dataIndex || ""}
                          onChange={(e) =>
                            updateTableColumn(index, "dataIndex", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600">
                          Form Field Name (optional - for row action mapping)
                        </label>
                        <Input
                          size="small"
                          placeholder="e.g. field_1769512887239 (leave empty if not linked)"
                          value={column.name || ""}
                          onChange={(e) =>
                            updateTableColumn(index, "name", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Row Actions */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-700">
                Row Actions
              </label>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    checked={formData.rowActions?.showSelect}
                    onChange={(e) =>
                      updateTableRowAction("showSelect", e.target.checked)
                    }
                  >
                    Show Select Button
                  </Checkbox>
                </div>

                {formData.rowActions?.showSelect && (
                  <div className="ml-6 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 mb-2">
                      When a row is selected, it will populate form fields based on column mappings.
                    </p>
                    <Input
                      size="small"
                      placeholder="Button label (e.g., Select/Edit)"
                      value={formData.rowActions?.selectLabel || "Select"}
                      onChange={(e) =>
                        updateTableRowAction("selectLabel", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <Checkbox
                    checked={formData.rowActions?.showDelete}
                    onChange={(e) =>
                      updateTableRowAction("showDelete", e.target.checked)
                    }
                  >
                    Show Delete Button
                  </Checkbox>
                </div>

                {/* ── View Details Button ─────────────────────── */}
                <div className="flex items-center">
                  <Checkbox
                    checked={formData.rowActions?.showViewDetails}
                    onChange={(e) =>
                      updateTableRowAction("showViewDetails", e.target.checked)
                    }
                  >
                    Show View Details Button
                  </Checkbox>
                </div>

                {formData.rowActions?.showViewDetails && (
                  <div className="ml-6 p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                    <p className="text-xs text-purple-700">
                      Calls an API with the row data. The response can populate fields across <strong>all tabs</strong>.
                    </p>

                    {/* Button Label */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Button Label</label>
                      <Input
                        size="small"
                        placeholder="e.g. View Details"
                        value={formData.rowActions?.viewDetailsLabel || "View Details"}
                        onChange={(e) => updateTableRowAction("viewDetailsLabel", e.target.value)}
                      />
                    </div>

                    {/* API URL */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">API Endpoint URL <span className="text-red-500">*</span></label>
                      <Input
                        size="small"
                        placeholder="/transaction/execute"
                        value={formData.rowActions?.viewDetailsApi?.url || ""}
                        onChange={(e) => updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          url: e.target.value,
                        })}
                      />
                    </div>

                    {/* Sub Channel ID */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Sub Channel ID <span className="text-red-500">*</span></label>
                      <Select
                        size="small"
                        style={{ width: "100%" }}
                        popupMatchSelectWidth={false}
                        placeholder="Select channel"
                        value={formData.rowActions?.viewDetailsApi?.subChannelId}
                        options={SUBCHANNEL_OPTIONS}
                        onChange={(v) => updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          subChannelId: v,
                        })}
                      />
                    </div>

                    {/* Sub Service ID */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Sub Service ID <span className="text-red-500">*</span></label>
                      <Select
                        size="small"
                        style={{ width: "100%" }}
                        popupMatchSelectWidth={false}
                        placeholder="Select service"
                        value={formData.rowActions?.viewDetailsApi?.subServiceId}
                        options={SUBSERVICE_OPTIONS}
                        onChange={(v) => updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          subServiceId: v,
                        })}
                      />
                    </div>

                    {/* Trace No */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Trace No <span className="text-red-500">*</span></label>
                      <Input
                        size="small"
                        placeholder="e.g. REQ-VIEW-DETAIL"
                        value={formData.rowActions?.viewDetailsApi?.traceNo || ""}
                        onChange={(e) => updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          traceNo: e.target.value,
                        })}
                      />
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    {/* Field Mappings */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700">Response Field Mappings</label>
                        <Button
                          type="dashed"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            const newMapping = { id: Date.now(), apiResponseField: "", targetFieldName: "" };
                            updateTableRowAction("viewDetailsFieldMappings", [
                              ...(formData.rowActions?.viewDetailsFieldMappings || []),
                              newMapping,
                            ]);
                          }}
                        >
                          Add Mapping
                        </Button>
                      </div>

                      {(formData.rowActions?.viewDetailsFieldMappings || []).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-1 border border-dashed border-slate-200 rounded">
                          No mappings — add one to populate fields from response.
                        </p>
                      )}

                      <div className="space-y-2 max-h-48 overflow-y-auto mt-1">
                        {(formData.rowActions?.viewDetailsFieldMappings || []).map((mapping, idx) => (
                          <div key={mapping.id} className="p-2 bg-white rounded border border-purple-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-purple-600">Mapping {idx + 1}</span>
                              <Button
                                type="text" danger size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => updateTableRowAction("viewDetailsFieldMappings",
                                  (formData.rowActions?.viewDetailsFieldMappings || []).filter((_, i) => i !== idx)
                                )}
                              />
                            </div>
                            <Input
                              size="small"
                              placeholder="API response field (e.g. customerName)"
                              value={mapping.apiResponseField || ""}
                              onChange={(e) => updateTableRowAction("viewDetailsFieldMappings",
                                (formData.rowActions?.viewDetailsFieldMappings || []).map((m, i) =>
                                  i === idx ? { ...m, apiResponseField: e.target.value } : m
                                )
                              )}
                            />
                            <Input
                              size="small"
                              placeholder="Target form field name"
                              value={mapping.targetFieldName || ""}
                              onChange={(e) => updateTableRowAction("viewDetailsFieldMappings",
                                (formData.rowActions?.viewDetailsFieldMappings || []).map((m, i) =>
                                  i === idx ? { ...m, targetFieldName: e.target.value } : m
                                )
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            {/* View Details Layout Config */}
            {formData.rowActions?.showViewDetails && (
              <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-slate-700">
                      Detail View Layout Config <span className="text-slate-400 font-normal text-xs">(optional)</span>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Configure the title, header cards, and paste JSON for tabs. Clicking "View Details" will slide in a
                    new page rendered from this config.
                  </p>

                  {/* VISUAL BUILDER FOR COMMON PROPERTIES */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Config Title</label>
                      <Input
                        size="small"
                        placeholder="e.g. Customer Details"
                        value={formData.rowActions?.viewDetailsConfig?.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          let currentObj = formData.rowActions?.viewDetailsConfig || {};
                          currentObj = { ...currentObj, title: val };
                          updateViewDetailsState(currentObj);
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Header Cards</label>
                        <Button 
                          type="dashed" size="small" 
                          icon={<PlusOutlined />}
                          onClick={() => {
                            let cards = [...(formData.rowActions?.viewDetailsConfig?.headerCards || [])];
                            cards.push({ label: "", fieldName: "" });
                            let currentObj = { ...(formData.rowActions?.viewDetailsConfig || {}), headerCards: cards };
                            updateViewDetailsState(currentObj);
                          }}
                        >
                          Add Card
                        </Button>
                      </div>
                      
                      {(formData.rowActions?.viewDetailsConfig?.headerCards || []).map((card, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center bg-white p-2 border border-slate-100 rounded">
                          <Input size="small" placeholder="Label (e.g. BRANCH)" value={card.label} 
                            onChange={(e) => {
                              let cards = [...(formData.rowActions?.viewDetailsConfig?.headerCards || [])];
                              cards[idx] = { ...cards[idx], label: e.target.value };
                              let currentObj = { ...(formData.rowActions?.viewDetailsConfig || {}), headerCards: cards };
                              updateViewDetailsState(currentObj);
                            }} 
                          />
                          <Input size="small" placeholder="Value Field (e.g. branchNo)" value={card.fieldName} 
                            onChange={(e) => {
                              let cards = [...(formData.rowActions?.viewDetailsConfig?.headerCards || [])];
                              cards[idx] = { ...cards[idx], fieldName: e.target.value };
                              let currentObj = { ...(formData.rowActions?.viewDetailsConfig || {}), headerCards: cards };
                              updateViewDetailsState(currentObj);
                            }} 
                          />
                          <Button size="small" danger type="text" icon={<DeleteOutlined />} 
                            onClick={() => {
                              let cards = [...(formData.rowActions?.viewDetailsConfig?.headerCards || [])];
                              cards.splice(idx, 1);
                              if (cards.length === 0) cards = undefined;
                              let currentObj = { ...(formData.rowActions?.viewDetailsConfig || {}) };
                              if (cards) currentObj.headerCards = cards; else delete currentObj.headerCards;
                              updateViewDetailsState(currentObj);
                            }} 
                          />
                        </div>
                      ))}
                      {(formData.rowActions?.viewDetailsConfig?.headerCards || []).length === 0 && (
                        <div className="text-[10px] text-slate-400 italic text-center py-2 border border-dashed border-slate-200 bg-white rounded">
                          No header cards added
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Raw JSON View</label>
                  <Input.TextArea
                    rows={8}
                    placeholder={'{\n  "title": "Customer Details",\n  "headerCards": [...],\n  "tabs": [{\n    "id": 1, "title": "Details",\n    "sections": [...]\n  }]\n}'}
                    value={
                      formData.rowActions?.viewDetailsConfigText ??
                      (formData.rowActions?.viewDetailsConfig
                        ? JSON.stringify(formData.rowActions.viewDetailsConfig, null, 2)
                        : "")
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      updateTableRowAction("viewDetailsConfigText", text);
                      try {
                        const parsed = JSON.parse(text);
                        // Make sure we carry over valid tabs if present
                        if (parsed) updateTableRowAction("viewDetailsConfig", parsed);
                      } catch {
                        // silent — let user keep typing
                      }
                    }}
                    style={{ fontFamily: "monospace", fontSize: 11 }}
                  />
                {formData.rowActions?.viewDetailsConfig?.tabs?.length > 0 && (
                  <p className="text-[10px] text-green-600 mt-1 font-semibold">
                    ✓ Valid — {formData.rowActions.viewDetailsConfig.tabs.length} tab(s) detected
                  </p>
                )}
              </div>
            )}

            <Divider />

            {/* ✅ Trigger Button Name Configuration */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Trigger Button Name (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Enter the button name that will trigger this table to refresh
              </p>
              
              <Input
                value={formData.triggerButtonName || ""}
                onChange={(e) => updateField("triggerButtonName", e.target.value)}
                placeholder="e.g. searchButton, submitButton"
                size="large"
              />
            </div>          
          </>
        )}

        <Button
          type="primary"
          onClick={handleSave}
          block
          size="large"
          className="mt-6"
        >
          Save Configuration
        </Button>
      </div>
    </Drawer>
  );
};

export default ComponentConfigDrawer;