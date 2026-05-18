import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { BUTTON_VARIANTS, FIELD_TYPES } from "../../utilities/constants";
import {
  ApiCommonFields,
  FieldMappingsList,
  FilterSearchOptionsBuilder,
  FormField,
  ViewDetailsConfigBuilder,
} from "./ConfigDrawerComponents";

// ─────────────────────────────────────────────────────────────────────────────
const ComponentConfigDrawer = ({ open, onClose, component, onSave }) => {
  const [formData, setFormData] = useState(component || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (component) setFormData(component);
  }, [component, open]);

  if (!component) return null;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (formData.type === "field") {
      if (!formData.name) e.name = "Field Name is required for data mapping";
      if (!formData.label) e.label = "Display Label is required";
      if (formData.onBlurApi?.enabled) {
        if (!formData.onBlurApi?.url)
          e.onBlurApiUrl = "API URL is required for on-Tab-press";
        if (!formData.onBlurApi?.apiCommon?.subChannelId)
          e.onBlurSubChannelId = "Sub Channel ID is required";
        if (!formData.onBlurApi?.apiCommon?.subServiceId)
          e.onBlurSubServiceId = "Sub Service ID is required";
        if (!formData.onBlurApi?.fieldMappings?.length)
          e.onBlurFieldMappings = "At least one field mapping is required";
      }
    }

    if (formData.type === "button") {
      if (!formData.name) e.name = "Button Name is required for binding";
      if (!formData.label) e.label = "Button text is required";
      if (formData.onClick !== "reset") {
        const hasApi =
          formData.api?.url ||
          formData.apiCommon?.subChannelId ||
          formData.apiCommon?.subServiceId;
        if (hasApi) {
          if (!formData.api?.url) e.apiUrl = "API Endpoint URL is required";
          if (!formData.apiCommon?.subChannelId)
            e.subChannelId = "Sub Channel ID is required";
          if (!formData.apiCommon?.subServiceId)
            e.subServiceId = "Sub Service ID is required";
        }
      }
    }

    if (formData.type === "table") {
      if (!formData.name) e.name = "Table Name is required for binding";
      if (!formData.label) e.label = "Table Label is required";
      if (!formData.columns?.length)
        e.columns = "At least one column is required";

      const mode = formData.dataSourceMode || "api";
      if (mode === "api") {
        // Own API mode — require dataUrl + tableApiCommon
        if (!formData.dataUrl) e.dataUrl = "Data API URL is required";
        if (!formData.tableApiCommon?.subChannelId)
          e.subChannelId = "Sub Channel ID is required";
        if (!formData.tableApiCommon?.subServiceId)
          e.subServiceId = "Sub Service ID is required";
      } else {
        // External mode — require dataSourceButtonName
        if (!formData.dataSourceButtonName)
          e.dataSourceButtonName =
            "Source Button Name is required for external data binding";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;
    const cleanData = { ...formData };
    if (
      cleanData.rowActions &&
      "viewDetailsConfigText" in cleanData.rowActions
    ) {
      cleanData.rowActions = { ...cleanData.rowActions };
      delete cleanData.rowActions.viewDetailsConfigText;
    }
    if ("viewDetailsConfigText" in cleanData)
      delete cleanData.viewDetailsConfigText;
    onSave(cleanData);
    setErrors({});
  };

  // ── State helpers ──────────────────────────────────────────────────────────
  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const updateApiField = (key, value) =>
    setFormData((prev) => ({ ...prev, api: { ...prev.api, [key]: value } }));

  const updateApiCommonField = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      apiCommon: { ...prev.apiCommon, [key]: value },
    }));

  // Merges a partial patch into onBlurApi
  const patchOnBlurApi = (patch) =>
    setFormData((prev) => ({
      ...prev,
      onBlurApi: { ...prev.onBlurApi, ...patch },
    }));

  // Updates a key inside onBlurApi.apiCommon
  const updateOnBlurApiCommon = (key, value) =>
    patchOnBlurApi({
      apiCommon: { ...formData.onBlurApi?.apiCommon, [key]: value },
    });

  const updateTableColumn = (index, key, value) => {
    const cols = [...(formData.columns || [])];
    cols[index] = { ...cols[index], [key]: value };
    setFormData((prev) => ({ ...prev, columns: cols }));
  };

  const addTableColumn = () => {
    const ts = Date.now();
    setFormData((prev) => ({
      ...prev,
      columns: [
        ...(prev.columns || []),
        {
          id: ts,
          label: "New Column",
          name: `col_${ts}`,
          dataIndex: `col_${ts}`,
        },
      ],
    }));
  };

  const removeTableColumn = (i) =>
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, idx) => idx !== i),
    }));

  const updateTableRowAction = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      rowActions: { ...prev.rowActions, [key]: value },
    }));

  const updateTableApiCommonField = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      tableApiCommon: { ...prev.tableApiCommon, [key]: value },
    }));

  // Updates both viewDetailsConfig and its serialised text inside rowActions
  const updateViewDetailsState = (newConfig) =>
    setFormData((prev) => ({
      ...prev,
      rowActions: {
        ...prev.rowActions,
        viewDetailsConfig: newConfig,
        viewDetailsConfigText:
          newConfig === undefined
            ? undefined
            : JSON.stringify(newConfig, null, 2),
      },
    }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Drawer
      title={`Configure ${component.type}`}
      onClose={onClose}
      open={open}
      width={500}
    >
      <div className="flex flex-col gap-4">
        {/* ══════════════════════════════════ FIELD ══════════════════════════ */}
        {component.type === "field" && (
          <>
            <FormField label="Field Name" required error={errors.name}>
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. fromDate"
                size="large"
              />
            </FormField>

            <FormField label="Label" error={errors.label}>
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. From Date"
                size="large"
              />
            </FormField>

            <FormField label="Field Type">
              <Select
                popupMatchSelectWidth={false}
                value={formData.fieldType}
                options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
                onChange={(v) => updateField("fieldType", v)}
                size="large"
              />
            </FormField>

            <FormField label="Placeholder">
              <Input
                value={formData.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
                placeholder="Enter placeholder text"
                size="large"
              />
            </FormField>

            <Checkbox
              checked={formData.required}
              onChange={(e) => updateField("required", e.target.checked)}
            >
              Mark as Required
            </Checkbox>

            {formData.fieldType === "number" && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4 my-4">
                <p className="text-xs text-slate-600 font-semibold">
                  Number Validations
                </p>
                <div className="flex gap-4">
                  <FormField label="Min Value">
                    <InputNumber
                      value={formData.min}
                      onChange={(v) => updateField("min", v)}
                      className="w-full"
                      size="large"
                    />
                  </FormField>
                  <FormField label="Max Value">
                    <InputNumber
                      value={formData.max}
                      onChange={(v) => updateField("max", v)}
                      className="w-full"
                      size="large"
                    />
                  </FormField>
                </div>
                <Checkbox
                  checked={formData.onlyPositive}
                  onChange={(e) => updateField("onlyPositive", e.target.checked)}
                >
                  Only Positive Numbers
                </Checkbox>
              </div>
            )}

            <Divider />

            {/* onBlur API toggle */}
            <Checkbox
              checked={formData.onBlurApi?.enabled}
              onChange={(e) =>
                updateField("onBlurApi", {
                  ...formData.onBlurApi,
                  enabled: e.target.checked,
                })
              }
            >
              Enable on-Tab-press API Call
            </Checkbox>

            {formData.onBlurApi?.enabled && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                <p className="text-xs text-blue-700">
                  When user leaves this field, an API will be called and
                  response data can populate other fields.
                </p>

                <FormField
                  label="API Endpoint URL"
                  required
                  error={errors.onBlurApiUrl}
                >
                  <Input
                    status={errors.onBlurApiUrl ? "error" : ""}
                    value={formData.onBlurApi?.url || ""}
                    onChange={(e) => patchOnBlurApi({ url: e.target.value })}
                    placeholder="/api/validate"
                    size="large"
                  />
                </FormField>

                <FormField label="HTTP Method">
                  <Select
                    popupMatchSelectWidth={false}
                    value={formData.onBlurApi?.method || "post"}
                    options={[
                      { value: "get", label: "GET" },
                      { value: "post", label: "POST" },
                    ]}
                    onChange={(v) => patchOnBlurApi({ method: v })}
                    size="large"
                  />
                </FormField>

                <ApiCommonFields
                  required
                  channelValue={formData.onBlurApi?.apiCommon?.subChannelId}
                  serviceValue={formData.onBlurApi?.apiCommon?.subServiceId}
                  onChannelChange={(v) =>
                    updateOnBlurApiCommon("subChannelId", v)
                  }
                  onServiceChange={(v) =>
                    updateOnBlurApiCommon("subServiceId", v)
                  }
                  channelError={errors.onBlurSubChannelId}
                  serviceError={errors.onBlurSubServiceId}
                />

                <Divider />

                <FieldMappingsList
                  label="Field Mappings"
                  required
                  theme="blue"
                  mappings={formData.onBlurApi?.fieldMappings || []}
                  error={errors.onBlurFieldMappings}
                  onChange={(updated) =>
                    patchOnBlurApi({ fieldMappings: updated })
                  }
                />
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════ TEXT ═══════════════════════════ */}
        {component.type === "text" && (
          <>
            <FormField label="Content">
              <Input.TextArea
                value={formData.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={4}
                size="large"
              />
            </FormField>

            <FormField label="Font Size (px)">
              <InputNumber
                min={12}
                max={48}
                value={formData.fontSize}
                onChange={(v) => updateField("fontSize", v)}
                className="w-full"
                size="large"
              />
            </FormField>

            <FormField label="Font Weight">
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
            </FormField>
          </>
        )}

        {/* ══════════════════════════════════ BUTTON ═════════════════════════ */}
        {component.type === "button" && (
          <>
            <FormField
              label="Button Name"
              required
              error={errors.name}
              hint="Used to identify this button for table bindings"
            >
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. submitButton, searchButton"
                size="large"
              />
            </FormField>

            <FormField label="Button Label" error={errors.label}>
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Submit"
                size="large"
              />
            </FormField>

            <FormField label="Variant">
              <Select
                popupMatchSelectWidth={false}
                value={formData.variant}
                options={BUTTON_VARIANTS.map((v) => ({ value: v, label: v }))}
                onChange={(v) => updateField("variant", v)}
                size="large"
              />
            </FormField>

            <FormField label="On Click Action">
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
            </FormField>

            {formData.onClick === "submit" && (
              <div>
                <Checkbox
                  checked={formData.skipValidation}
                  onChange={(e) =>
                    updateField("skipValidation", e.target.checked)
                  }
                >
                  Skip Empty Field Validation
                </Checkbox>
                <p className="text-xs text-slate-500 mt-1 ml-6">
                  Check this to bypass the &quot;required field&quot; check
                  during form submission.
                </p>
              </div>
            )}

            {/* API config — hidden for reset action */}
            {formData.onClick !== "reset" && (
              <>
                <Divider />
                <h4 className="font-semibold text-slate-800">
                  API Configuration
                </h4>

                <FormField
                  label="API Endpoint URL (Optional)"
                  error={errors.apiUrl}
                >
                  <Input
                    status={errors.apiUrl ? "error" : ""}
                    value={formData.api?.url || ""}
                    onChange={(e) => updateApiField("url", e.target.value)}
                    placeholder="/api/submit"
                    size="large"
                  />
                </FormField>

                <FormField label="HTTP Method">
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
                </FormField>

                <Divider />

                <ApiCommonFields
                  channelValue={formData.apiCommon?.subChannelId}
                  serviceValue={formData.apiCommon?.subServiceId}
                  onChannelChange={(v) =>
                    updateApiCommonField("subChannelId", v)
                  }
                  onServiceChange={(v) =>
                    updateApiCommonField("subServiceId", v)
                  }
                  channelError={errors.subChannelId}
                  serviceError={errors.subServiceId}
                />

                <Divider />

                <div>
                  <h4 className="font-semibold text-slate-800 mb-0.5">
                    Response Field Mappings
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    After a successful API call, map response fields to form
                    inputs automatically.
                  </p>
                  <FieldMappingsList
                    theme="green"
                    mappings={formData.fieldMappings || []}
                    onChange={(updated) =>
                      updateField("fieldMappings", updated)
                    }
                  />
                </div>
              </>
            )}

            <Divider />

            {/* Optional nested detail view */}
            <Checkbox
              checked={!!formData.viewDetailsConfig}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData((prev) => ({
                    ...prev,
                    viewDetailsConfig: { title: "", tabs: [] },
                    viewDetailsConfigText: JSON.stringify(
                      { title: "", tabs: [] },
                      null,
                      2,
                    ),
                  }));
                } else {
                  setFormData((prev) => {
                    const copy = { ...prev };
                    delete copy.viewDetailsConfig;
                    delete copy.viewDetailsConfigText;
                    return copy;
                  });
                }
              }}
            >
              Enable Nested Detail View onClick
            </Checkbox>

            {formData.viewDetailsConfig && (
              <div className="ml-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700 mb-4 bg-purple-100 p-2 rounded">
                  If this button has an API config, it will await the request
                  and auto-map this new layout&apos;s header cards before
                  sliding in. Otherwise, it simply slides to this view
                  seamlessly.
                </p>
                <ViewDetailsConfigBuilder
                  config={formData.viewDetailsConfig}
                  configText={formData.viewDetailsConfigText}
                  onStructureChange={(newConfig) =>
                    setFormData((prev) => ({
                      ...prev,
                      viewDetailsConfig: newConfig,
                      viewDetailsConfigText: JSON.stringify(newConfig, null, 2),
                    }))
                  }
                  onRawChange={(parsed, text) =>
                    setFormData((prev) => ({
                      ...prev,
                      viewDetailsConfigText: text,
                      ...(parsed !== null && { viewDetailsConfig: parsed }),
                    }))
                  }
                  placeholder={
                    '{\n  "title": "Config Details",\n  "headerCards": [...],\n  "tabs": [...]\n}'
                  }
                />
              </div>
            )}

            <Divider />

            {/* ── Filter Search Panel ─────────────────────────── */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-800">
                    Filter Search Panel
                  </p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Replace this button with a multi-criteria search panel at
                    runtime.
                  </p>
                </div>
                <Checkbox
                  checked={!!formData.filterSearch?.enabled}
                  onChange={(e) =>
                    updateField("filterSearch", {
                      ...formData.filterSearch,
                      enabled: e.target.checked,
                    })
                  }
                >
                  Enable
                </Checkbox>
              </div>

              {formData.filterSearch?.enabled && (
                <div className="space-y-4">
                  <FilterSearchOptionsBuilder
                    options={formData.filterSearch?.searchOptions || []}
                    onChange={(updated) =>
                      updateField("filterSearch", {
                        ...formData.filterSearch,
                        searchOptions: updated,
                      })
                    }
                  />
                  <Checkbox
                    checked={formData.filterSearch?.multiFilter !== false}
                    onChange={(e) =>
                      updateField("filterSearch", {
                        ...formData.filterSearch,
                        multiFilter: e.target.checked,
                      })
                    }
                  >
                    Allow multiple filter rows
                  </Checkbox>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════ CARD ═══════════════════════════ */}
        {component.type === "card" && (
          <>
            <FormField label="Card Title">
              <Input
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Card Title"
                size="large"
              />
            </FormField>
            <Checkbox
              checked={formData.bordered}
              onChange={(e) => updateField("bordered", e.target.checked)}
            >
              Show Border
            </Checkbox>
          </>
        )}

        {/* ══════════════════════════════════ SPACER ═════════════════════════ */}
        {component.type === "spacer" && (
          <FormField label="Height (px)">
            <InputNumber
              min={8}
              max={128}
              value={formData.height}
              onChange={(v) => updateField("height", v)}
              className="w-full"
              size="large"
            />
          </FormField>
        )}

        {/* ══════════════════════════════════ DIVIDER ════════════════════════ */}
        {component.type === "divider" && (
          <>
            <FormField
              label="Divider Name / Key"
              hint="Unique identifier to prevent re-rendering issues"
            >
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. div_1 (optional)"
                size="large"
              />
            </FormField>

            <FormField label="Divider Title">
              <Input
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Section Title"
                size="large"
              />
            </FormField>

            <FormField label="Title Alignment">
              <Select
                popupMatchSelectWidth={false}
                value={formData.orientation || "center"}
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
                onChange={(v) => updateField("orientation", v)}
                size="large"
                className="w-full"
              />
            </FormField>

            <div className="flex items-center gap-4">
              <Checkbox
                checked={formData.dashed}
                onChange={(e) => updateField("dashed", e.target.checked)}
              >
                Dashed Line
              </Checkbox>
              <Checkbox
                checked={formData.plain}
                onChange={(e) => updateField("plain", e.target.checked)}
              >
                Plain Text
              </Checkbox>
            </div>
          </>
        )}

        {/* ══════════════════════════════════ CHECKBOX ════════════════════════ */}
        {component.type === "checkbox" && (
          <>
            <FormField
              label="Field Name (binding key)"
              required
              error={errors.name}
            >
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. hasInsurance"
                size="large"
              />
            </FormField>

            <FormField label="Label">
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Has Insurance?"
                size="large"
              />
            </FormField>

            <FormField label="Hint / Helper Text">
              <Input
                value={formData.hint || ""}
                onChange={(e) => updateField("hint", e.target.value)}
                placeholder="e.g. Check if applicable"
                size="large"
              />
            </FormField>

            <FormField label="Checkbox Mode">
              <Select
                value={formData.checkboxMode || "single"}
                onChange={(v) => updateField("checkboxMode", v)}
                options={[
                  { value: "single", label: "Single Checkbox" },
                  { value: "multiple", label: "Multiple (Checkbox Group)" },
                ]}
                size="large"
                style={{ width: "100%" }}
              />
            </FormField>

            <Checkbox
              checked={formData.required}
              onChange={(e) => updateField("required", e.target.checked)}
            >
              Mark as Required
            </Checkbox>

            <Divider />

            {/* Single mode value config */}
            {(formData.checkboxMode || "single") === "single" && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <p className="text-xs text-slate-600 font-semibold">
                  Value Mapping
                </p>
                <p className="text-xs text-slate-500">
                  Define what value gets sent when the checkbox is checked or
                  unchecked.
                </p>
                <FormField label="Checked Value">
                  <Input
                    value={formData.checkedValue ?? "Y"}
                    onChange={(e) =>
                      updateField("checkedValue", e.target.value)
                    }
                    placeholder='e.g. "Y" or "true" or "1"'
                    size="large"
                  />
                </FormField>
                <FormField label="Unchecked Value">
                  <Input
                    value={formData.uncheckedValue ?? "N"}
                    onChange={(e) =>
                      updateField("uncheckedValue", e.target.value)
                    }
                    placeholder='e.g. "N" or "false" or "0"'
                    size="large"
                  />
                </FormField>
              </div>
            )}

            {/* Multiple mode options */}
            {formData.checkboxMode === "multiple" && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600 font-semibold">
                  Checkbox Options
                </p>
                <p className="text-xs text-slate-500">
                  Define the options for the checkbox group. The selected values
                  will be sent as an array.
                </p>
                <FormField label="Options (JSON)">
                  <Input.TextArea
                    rows={6}
                    placeholder='[{"label": "Option A", "value": "A"}, {"label": "Option B", "value": "B"}]'
                    value={
                      formData.optionsText ||
                      JSON.stringify(formData.options || [], null, 2)
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      updateField("optionsText", text);
                      try {
                        const parsed = JSON.parse(text);
                        if (Array.isArray(parsed))
                          updateField("options", parsed);
                      } catch {
                        // keep raw text until valid
                      }
                    }}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Must be a valid JSON array:{" "}
                    {`[{ "label": "text", "value": "val" }]`}
                  </p>
                </FormField>
              </div>
            )}
          </>
        )}
        {/* ══════════════════════════════════ UPLOAD ══════════════════════════ */}
        {component.type === "upload" && (
          <>
            <FormField label="Field Name (binding key)" required error={errors.name}>
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. documentFile"
                size="large"
              />
            </FormField>

            <FormField label="Label">
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Upload Document"
                size="large"
              />
            </FormField>

            <FormField label="Upload Format">
              <Select
                value={formData.uploadFormat || "BLOB"}
                onChange={(v) => updateField("uploadFormat", v)}
                options={[
                  { value: "BLOB", label: "BLOB (File object)" },
                  { value: "Base64", label: "Base64 encoded string" },
                ]}
                size="large"
                style={{ width: "100%" }}
              />
            </FormField>

            <FormField label="Maximum Files">
              <InputNumber
                min={1}
                max={10}
                value={formData.maxCount || 1}
                onChange={(v) => updateField("maxCount", v)}
                size="large"
                className="w-full"
              />
            </FormField>

            <FormField label="Accepted File Types (optional)">
              <Input
                value={formData.accept || ""}
                onChange={(e) => updateField("accept", e.target.value)}
                placeholder="e.g. .pdf,.png,.jpeg"
                size="large"
              />
            </FormField>

            <Checkbox
              checked={formData.required}
              onChange={(e) => updateField("required", e.target.checked)}
            >
              Mark as Required
            </Checkbox>
          </>
        )}

        {/* ══════════════════════════════════ SELECT ═════════════════════════ */}
        {formData.type === "select" && (
          <>
            <FormField label="Select Name">
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. selectCountry"
                size="large"
              />
            </FormField>

            <FormField label="Label">
              <Input
                value={formData.label}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Select Country"
                size="large"
              />
            </FormField>

            <FormField label="Placeholder">
              <Input
                value={formData.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
                placeholder="e.g. Choose an option"
                size="large"
              />
            </FormField>

            <FormField label="Data Source">
              <Select
                value={formData.dataSource}
                onChange={(v) => updateField("dataSource", v)}
                options={[
                  { value: "manual", label: "Manual Entry (Static)" },
                  { value: "api", label: "Remote API (Dynamic)" },
                ]}
                size="large"
              />
            </FormField>

            {/* Static options */}
            {formData.dataSource === "manual" ? (
              <FormField label="Options (Label/Value Pairs)">
                <Input.TextArea
                  rows={8}
                  placeholder='[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'
                  value={
                    formData.optionsText ||
                    JSON.stringify(formData.options || [], null, 2)
                  }
                  onChange={(e) => {
                    const text = e.target.value;
                    updateField("optionsText", text);
                    try {
                      const parsed = JSON.parse(text);
                      if (Array.isArray(parsed)) updateField("options", parsed);
                    } catch {
                      // keep typing — silent fail
                    }
                  }}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Must be valid JSON array. Format: [
                  {'"label": "text", "value": "value"'}]
                </p>
              </FormField>
            ) : (
              /* Remote API options */
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                <p className="text-xs text-blue-700">
                  The API response must include{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    data.attributes.dropdownValues
                  </code>{" "}
                  — an array of{" "}
                  <code className="bg-blue-100 px-1 rounded">{`{ label, value }`}</code>{" "}
                  objects.
                </p>

                <FormField label="API Endpoint URL" required>
                  <Input
                    placeholder="/transaction/execute"
                    value={formData.dataUrl || ""}
                    onChange={(e) => updateField("dataUrl", e.target.value)}
                    size="large"
                  />
                </FormField>

                <FormField label="HTTP Method">
                  <Select
                    popupMatchSelectWidth={false}
                    value={formData.selectApiCommon?.method || "post"}
                    options={[
                      { value: "get", label: "GET" },
                      { value: "post", label: "POST" },
                    ]}
                    onChange={(v) =>
                      updateField("selectApiCommon", {
                        ...formData.selectApiCommon,
                        method: v,
                      })
                    }
                    size="large"
                    style={{ width: "100%" }}
                  />
                </FormField>

                <ApiCommonFields
                  required
                  channelValue={formData.selectApiCommon?.subChannelId}
                  serviceValue={formData.selectApiCommon?.subServiceId}
                  onChannelChange={(v) =>
                    updateField("selectApiCommon", {
                      ...formData.selectApiCommon,
                      subChannelId: v,
                    })
                  }
                  onServiceChange={(v) =>
                    updateField("selectApiCommon", {
                      ...formData.selectApiCommon,
                      subServiceId: v,
                    })
                  }
                />
              </div>
            )}

            <Checkbox
              checked={formData.required}
              onChange={(e) => updateField("required", e.target.checked)}
            >
              Mark as Required
            </Checkbox>
          </>
        )}

        {/* ══════════════════════════════════ TABLE ══════════════════════════ */}
        {component.type === "table" && (
          <>
            <FormField
              label="Table Name"
              required
              error={errors.name}
              hint="Used to identify this table for button bindings"
            >
              <Input
                status={errors.name ? "error" : ""}
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. resultsTable, ordersTable"
                size="large"
              />
            </FormField>

            <FormField label="Table Label" error={errors.label}>
              <Input
                status={errors.label ? "error" : ""}
                value={formData.label || ""}
                onChange={(e) => updateField("label", e.target.value)}
                placeholder="e.g. Records Table"
                size="large"
              />
            </FormField>

            <Divider />

            {/* Data Source Mode */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Data Source Mode
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Choose how this table gets its data.
                </p>
              </div>
              <FormField label="Mode">
                <Select
                  popupMatchSelectWidth={false}
                  value={formData.dataSourceMode || "api"}
                  options={[
                    { value: "api", label: "Own API — Table fetches its own data" },
                    {
                      value: "external",
                      label: "External Button/Filter — Receives data from a button's API response",
                    },
                  ]}
                  onChange={(v) => {
                    updateField("dataSourceMode", v);
                    // Clear incompatible fields when switching modes
                    if (v === "external") {
                      updateField("dataUrl", undefined);
                      updateField("tableApiCommon", undefined);
                    } else {
                      updateField("dataSourceButtonName", undefined);
                      updateField("dataResponsePath", undefined);
                    }
                  }}
                  size="large"
                  style={{ width: "100%" }}
                />
              </FormField>

              {/* Own API Mode */}
              {(formData.dataSourceMode || "api") === "api" && (
                <>
                  <FormField
                    label="Data API URL"
                    required
                    error={errors.dataUrl}
                  >
                    <Input
                      status={errors.dataUrl ? "error" : ""}
                      value={formData.dataUrl || ""}
                      onChange={(e) => updateField("dataUrl", e.target.value)}
                      placeholder="e.g. /api/records"
                      size="large"
                    />
                  </FormField>

                  <h4 className="font-semibold text-slate-800">
                    API Configuration
                  </h4>

                  <ApiCommonFields
                    required
                    channelValue={formData.tableApiCommon?.subChannelId}
                    serviceValue={formData.tableApiCommon?.subServiceId}
                    onChannelChange={(v) =>
                      updateTableApiCommonField("subChannelId", v)
                    }
                    onServiceChange={(v) =>
                      updateTableApiCommonField("subServiceId", v)
                    }
                    channelError={errors.subChannelId}
                    serviceError={errors.subServiceId}
                  />
                </>
              )}

              {/* External Button/Filter Mode */}
              {formData.dataSourceMode === "external" && (
                <>
                  <FormField
                    label="Source Button Name"
                    required
                    error={errors.dataSourceButtonName}
                    hint="Enter the exact name of the button or filter whose API response will populate this table."
                  >
                    <Input
                      status={errors.dataSourceButtonName ? "error" : ""}
                      value={formData.dataSourceButtonName || ""}
                      onChange={(e) =>
                        updateField("dataSourceButtonName", e.target.value)
                      }
                      placeholder="e.g. searchButton, filterBtn"
                      size="large"
                    />
                  </FormField>

                  <FormField
                    label="Response Data Path"
                    hint='Dot-notation path to extract the data array from the API response. Default: "data.attributes.data"'
                  >
                    <Input
                      value={formData.dataResponsePath || ""}
                      onChange={(e) =>
                        updateField("dataResponsePath", e.target.value)
                      }
                      placeholder="data.attributes.data"
                      size="large"
                    />
                  </FormField>
                </>
              )}
            </div>

            <Checkbox
              checked={formData.pagination !== false}
              onChange={(e) => updateField("pagination", e.target.checked)}
            >
              Enable Pagination
            </Checkbox>

            <Divider />

            {/* Columns */}
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
                {formData.columns?.map((column, i) => (
                  <div
                    key={column.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Column {i + 1}
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeTableColumn(i)}
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
                            updateTableColumn(i, "label", e.target.value)
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
                            updateTableColumn(i, "dataIndex", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">
                          Form Field Name (optional — for row action mapping)
                        </label>
                        <Input
                          size="small"
                          placeholder="e.g. field_1769512887239 (leave empty if not linked)"
                          value={column.name || ""}
                          onChange={(e) =>
                            updateTableColumn(i, "name", e.target.value)
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
                {/* Select row */}
                <Checkbox
                  checked={formData.rowActions?.showSelect}
                  onChange={(e) =>
                    updateTableRowAction("showSelect", e.target.checked)
                  }
                >
                  Show Select Button
                </Checkbox>
                {formData.rowActions?.showSelect && (
                  <div className="ml-6 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 mb-2">
                      When a row is selected, it will populate form fields based
                      on column mappings.
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

                {/* View Details */}
                <Checkbox
                  checked={formData.rowActions?.showViewDetails}
                  onChange={(e) =>
                    updateTableRowAction("showViewDetails", e.target.checked)
                  }
                >
                  Show View Details Button
                </Checkbox>

                {formData.rowActions?.showViewDetails && (
                  <div className="ml-6 p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                    <p className="text-xs text-purple-700">
                      Calls an API with the row data. The response can populate
                      fields across <strong>all tabs</strong>.
                    </p>

                    <FormField label="Button Label">
                      <Input
                        size="small"
                        placeholder="e.g. View Details"
                        value={
                          formData.rowActions?.viewDetailsLabel ||
                          "View Details"
                        }
                        onChange={(e) =>
                          updateTableRowAction(
                            "viewDetailsLabel",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>

                    <FormField label="API Endpoint URL" required>
                      <Input
                        size="small"
                        placeholder="/transaction/execute"
                        value={formData.rowActions?.viewDetailsApi?.url || ""}
                        onChange={(e) =>
                          updateTableRowAction("viewDetailsApi", {
                            ...formData.rowActions?.viewDetailsApi,
                            url: e.target.value,
                          })
                        }
                      />
                    </FormField>

                    <ApiCommonFields
                      required
                      size="small"
                      channelValue={
                        formData.rowActions?.viewDetailsApi?.subChannelId
                      }
                      serviceValue={
                        formData.rowActions?.viewDetailsApi?.subServiceId
                      }
                      onChannelChange={(v) =>
                        updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          subChannelId: v,
                        })
                      }
                      onServiceChange={(v) =>
                        updateTableRowAction("viewDetailsApi", {
                          ...formData.rowActions?.viewDetailsApi,
                          subServiceId: v,
                        })
                      }
                    />

                    <Divider style={{ margin: "8px 0" }} />

                    <FieldMappingsList
                      label="Response Field Mappings"
                      theme="purple"
                      mappings={
                        formData.rowActions?.viewDetailsFieldMappings || []
                      }
                      onChange={(updated) =>
                        updateTableRowAction(
                          "viewDetailsFieldMappings",
                          updated,
                        )
                      }
                    />
                  </div>
                )}
              </div>
              <Divider />
            </div>

            {/* View Details Layout Config */}
            {formData.rowActions?.showViewDetails && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-700">
                    Detail View Layout Config{" "}
                    <span className="text-slate-400 font-normal text-xs">
                      (optional)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Configure the title, header cards, and paste JSON for tabs.
                  Clicking &quot;View Details&quot; will slide in a new page
                  rendered from this config.
                </p>

                <ViewDetailsConfigBuilder
                  config={formData.rowActions?.viewDetailsConfig}
                  configText={formData.rowActions?.viewDetailsConfigText}
                  onStructureChange={(newConfig) =>
                    updateViewDetailsState(newConfig)
                  }
                  onRawChange={(parsed, text) =>
                    setFormData((prev) => ({
                      ...prev,
                      rowActions: {
                        ...prev.rowActions,
                        viewDetailsConfigText: text,
                        ...(parsed !== null && { viewDetailsConfig: parsed }),
                      },
                    }))
                  }
                  placeholder={
                    '{\n  "title": "Customer Details",\n  "headerCards": [...],\n  "tabs": [{\n    "id": 1, "title": "Details",\n    "sections": [...]\n  }]\n}'
                  }
                />
                {formData.rowActions?.viewDetailsConfig?.tabs?.length > 0 && (
                  <p className="text-[10px] text-green-600 mt-1 font-semibold">
                    ✓ Valid —{" "}
                    {formData.rowActions.viewDetailsConfig.tabs.length} tab(s)
                    detected
                  </p>
                )}
                <Divider />
              </div>
            )}

            {/* Trigger button binding */}
            <FormField
              label="Trigger Button Name (Optional)"
              hint="Enter the button name that will trigger this table to refresh"
            >
              <Input
                value={formData.triggerButtonName || ""}
                onChange={(e) =>
                  updateField("triggerButtonName", e.target.value)
                }
                placeholder="e.g. searchButton, submitButton"
                size="large"
              />
            </FormField>
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
