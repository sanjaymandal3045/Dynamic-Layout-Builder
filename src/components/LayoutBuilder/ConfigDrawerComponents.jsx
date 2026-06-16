import { Button, Input, Select } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — replace with API calls when backend is ready
// ─────────────────────────────────────────────────────────────────────────────
export const SUBCHANNEL_OPTIONS = [
  { label: "Channel 1", value: 1 },
  { label: "Channel 2", value: 2 },
  { label: "Channel 3", value: 3 },
];

export const SUBSERVICE_OPTIONS = [
  { label: "Service 1", value: 1 },
  { label: "Service 2", value: 2 },
  { label: "Service 3", value: 3 },
  { label: "Service 4", value: 4 },
  { label: "Service 5", value: 5 },
  { label: "Service 6", value: 6 },
  { label: "Service 7", value: 7 },
  { label: "Service 8", value: 8 },
  { label: "Service 9", value: 9 },
  { label: "Service 10", value: 10 },
  { label: "Service 11", value: 11 },
  { label: "Service 12", value: 12 },
  { label: "Service 13", value: 13 },
  { label: "Service 14", value: 14 },
  { label: "Service 15", value: 15 },
  { label: "Service 16", value: 16 },
  { label: "Service 17", value: 17 },
  { label: "Service 18", value: 18 },
  { label: "Service 19", value: 19 },
  { label: "Service 20", value: 20 },
  { label: "Service 21", value: 21 },
  { label: "Service 22", value: 22 },
  { label: "Service 23", value: 23 },
  { label: "Service 24", value: 24 },
  { label: "Service 25", value: 25 },
  { label: "Service 26", value: 26 },
  { label: "Service 27", value: 27 },
  { label: "Service 28", value: 28 },
  { label: "Service 29", value: 29 },
  { label: "Service 30", value: 30 },
  { label: "Service 31", value: 31 },
  { label: "Service 32", value: 32 },
  { label: "Service 33", value: 33 },
  { label: "Service 34", value: 34 },
  { label: "Service 35", value: 35 },
  { label: "Service 36", value: 36 },
  { label: "Service 37", value: 37 },
  { label: "Service 38", value: 38 },
  { label: "Service 39", value: 39 },
  { label: "Service 40", value: 40 },
];

// ─────────────────────────────────────────────────────────────────────────────
// FormField
// Wraps any form control with a label, required indicator, error, and hint.
// ─────────────────────────────────────────────────────────────────────────────
export const FormField = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = "",
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-semibold mb-2 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ApiCommonFields
// Sub Channel ID + Sub Service ID select pair — appears in 5 different
// sections (button, onBlur API, select remote, table API, table row details).
// ─────────────────────────────────────────────────────────────────────────────
export const ApiCommonFields = ({
  channelValue,
  serviceValue,
  onChannelChange,
  onServiceChange,
  channelError,
  serviceError,
  required = false,
  size = "large",
  className = "",
}) => {
  const fullWidth = size === "small" ? { width: "100%" } : undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      <FormField
        label="Sub Channel ID"
        required={required}
        error={channelError}
      >
        <Select
          status={channelError ? "error" : ""}
          popupMatchSelectWidth={false}
          value={channelValue}
          options={SUBCHANNEL_OPTIONS}
          onChange={onChannelChange}
          placeholder="Select a channel"
          size={size}
          style={fullWidth}
        />
      </FormField>

      <FormField
        label="Sub Service ID"
        required={required}
        error={serviceError}
      >
        <Select
          status={serviceError ? "error" : ""}
          popupMatchSelectWidth={false}
          value={serviceValue}
          options={SUBSERVICE_OPTIONS}
          onChange={onServiceChange}
          placeholder="Select a service"
          size={size}
          style={fullWidth}
        />
      </FormField>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FieldMappingsList
// Add / remove / edit API response → form field mappings.
// Appears in: onBlur API (blue), button response (green), table row action (purple).
// ─────────────────────────────────────────────────────────────────────────────
const MAPPING_THEMES = {
  blue: {
    row: "p-3 bg-white rounded border border-slate-200 hover:border-blue-300 space-y-2 transition-colors",
    badge:
      "text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded",
  },
  green: {
    row: "p-3 bg-green-50 rounded border border-green-200 hover:border-green-400 space-y-2 transition-colors",
    badge:
      "text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded",
  },
  purple: {
    row: "p-2 bg-white rounded border border-purple-200 space-y-1",
    badge: "text-[10px] font-semibold text-purple-600",
  },
};

export const FieldMappingsList = ({
  mappings = [],
  onChange,
  theme = "green",
  label = "Field Mappings",
  required = false,
  error,
}) => {
  const styles = MAPPING_THEMES[theme] ?? MAPPING_THEMES.green;
  const showHints = theme !== "purple";

  const add = () =>
    onChange([
      ...mappings,
      { id: Date.now(), apiResponseField: "", targetFieldName: "" },
    ]);
  const remove = (i) => onChange(mappings.filter((_, idx) => idx !== i));
  const update = (i, key, val) =>
    onChange(mappings.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={add}
        >
          Add Mapping
        </Button>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {mappings.length === 0 && (
        <p className="text-[10px] text-slate-400 italic text-center py-1 border border-dashed border-slate-200 rounded">
          No mappings — add one to populate fields from response.
        </p>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto mt-1">
        {mappings.map((m, i) => (
          <div key={m.id} className={styles.row}>
            <div className="flex items-center justify-between mb-1">
              <span className={styles.badge}>Mapping {i + 1}</span>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => remove(i)}
              />
            </div>

            <div>
              {showHints && (
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  API Response Field Name
                </label>
              )}
              <Input
                size="small"
                placeholder="e.g. menuName"
                value={m.apiResponseField || ""}
                onChange={(e) => update(i, "apiResponseField", e.target.value)}
              />
              {showHints && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Enter the exact field name from the API response
                </p>
              )}
            </div>

            <div>
              {showHints && (
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Target Field Name
                </label>
              )}
              <Input
                size="small"
                placeholder="e.g. field_1234567890"
                value={m.targetFieldName || ""}
                onChange={(e) => update(i, "targetFieldName", e.target.value)}
              />
              {showHints && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  The form field name to populate
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HeaderCardsBuilder
// Visual editor for label + fieldName card pairs used in detail-view configs.
// Appears in both button onClick view and table row viewDetails.
// ─────────────────────────────────────────────────────────────────────────────
export const HeaderCardsBuilder = ({ cards = [], onChange }) => {
  const add = () => onChange([...cards, { label: "", fieldName: "" }]);
  const remove = (i) => onChange(cards.filter((_, idx) => idx !== i));
  const update = (i, key, val) => {
    const next = [...cards];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">
          Header Cards
        </label>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={add}
        >
          Add Card
        </Button>
      </div>

      {cards.map((card, i) => (
        <div
          key={i}
          className="flex gap-2 mb-2 items-center bg-white p-2 border border-slate-100 rounded"
        >
          <Input
            size="small"
            placeholder="Label (e.g. BRANCH)"
            value={card.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <Input
            size="small"
            placeholder="Value Field (e.g. branchNo)"
            value={card.fieldName}
            onChange={(e) => update(i, "fieldName", e.target.value)}
          />
          <Button
            size="small"
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => remove(i)}
          />
        </div>
      ))}

      {cards.length === 0 && (
        <div className="text-[10px] text-slate-400 italic text-center py-2 border border-dashed border-slate-200 bg-white rounded">
          No header cards added
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ViewDetailsConfigBuilder
// Combined visual editor (title + header cards) + raw JSON textarea for a
// detail-view config object. Used in button onClick and table row viewDetails.
//
// Callbacks:
//   onStructureChange(newConfig) — visual builder changed; parent must update
//     both `config` and `configText` (e.g. JSON.stringify the new config).
//   onRawChange(parsedOrNull, rawText) — textarea changed; if parsedOrNull is
//     null (invalid JSON) parent should update only the raw text, not config.
// ─────────────────────────────────────────────────────────────────────────────
export const ViewDetailsConfigBuilder = ({
  config,
  configText,
  onStructureChange,
  onRawChange,
  placeholder,
}) => {
  const updateTitle = (val) =>
    onStructureChange({ ...(config || {}), title: val });

  const updateCards = (cards) => {
    const next = { ...(config || {}) };
    if (cards.length > 0) next.headerCards = cards;
    else delete next.headerCards;
    onStructureChange(next);
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    try {
      onRawChange(JSON.parse(text), text);
    } catch {
      onRawChange(null, text);
    }
  };

  const jsonValue =
    configText ?? (config ? JSON.stringify(config, null, 2) : "");

  return (
    <div>
      {/* Visual builder */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">
            Config Title
          </label>
          <Input
            size="small"
            placeholder="e.g. Details View"
            value={config?.title || ""}
            onChange={(e) => updateTitle(e.target.value)}
          />
        </div>
        <HeaderCardsBuilder
          cards={config?.headerCards || []}
          onChange={updateCards}
        />
      </div>

      {/* Raw JSON editor */}
      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
        Raw JSON View
      </label>
      <Input.TextArea
        rows={8}
        placeholder={placeholder}
        value={jsonValue}
        onChange={handleJsonChange}
        style={{ fontFamily: "monospace", fontSize: 11 }}
      />
      {config?.tabs?.length > 0 && (
        <p className="text-[10px] text-green-600 mt-1 font-semibold">
          ✓ Valid — {config.tabs.length} tab(s) detected
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FilterSearchOptionsBuilder
// Defines the list of { label, value } pairs the end-user can pick from when
// building filter criteria rows in the runtime FilterSearchPanel.
// Used in the button config drawer's "Filter Search" section.
// ─────────────────────────────────────────────────────────────────────────────
export const FilterSearchOptionsBuilder = ({ options = [], onChange }) => {
  const add = () => onChange([...options, { label: "", value: "" }]);
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));
  const update = (i, key, val) => {
    const next = [...options];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-slate-700">
          Search Options
        </label>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={add}
        >
          Add Option
        </Button>
      </div>

      {options.length === 0 && (
        <div className="text-[10px] text-slate-400 italic text-center py-2 border border-dashed border-slate-200 bg-white rounded">
          No options yet — add at least one search criterion
        </div>
      )}

      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {options.map((opt, i) => (
          <div
            key={i}
            className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded hover:border-indigo-300 transition-colors"
          >
            <Input
              size="small"
              placeholder="Label (e.g. Customer ID)"
              value={opt.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <Input
              size="small"
              placeholder="Key (e.g. P_CUSTOMER_ID)"
              value={opt.value}
              onChange={(e) => update(i, "value", e.target.value)}
            />
            <Button
              size="small"
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => remove(i)}
            />
          </div>
        ))}
      </div>

      {options.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-1">
          &quot;Label&quot; is shown to end-users. &quot;Key&quot; is sent as
          the attribute name in the API payload.
        </p>
      )}
    </div>
  );
};
