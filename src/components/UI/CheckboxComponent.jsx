import { Checkbox } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

// ─────────────────────────────────────────────────────────────────────────────
// CheckboxComponent
//
// Handles both SINGLE and MULTIPLE (group) checkbox modes.
//
// Single mode (checkboxMode = "single"):
//   - Renders one ant Checkbox
//   - When checked  → sends `checkedValue`  (default "Y")
//   - When unchecked → sends `uncheckedValue` (default "N")
//
// Multiple mode (checkboxMode = "multiple"):
//   - Renders an ant Checkbox.Group
//   - Options come from `options: [{ label, value }]` (same as Select)
//   - Returns an array of the checked values
//
// Props mirror the ComponentRenderer contract:
//   component   — the config object from the layout builder
//   value       — current form value (string for single, array for group)
//   onValueChange(name, newValue)
//   disabled    — global disable flag
//   state       — { isDisabled, isVisible } from parsePermissions
// ─────────────────────────────────────────────────────────────────────────────

const CheckboxComponent = ({ component, value, onValueChange, disabled, state }) => {
  const isDisabled = disabled || state?.isDisabled;

  const isMultiple = component.checkboxMode === "multiple";
  const checkedValue   = component.checkedValue   ?? "Y";
  const uncheckedValue = component.uncheckedValue ?? "N";

  // ── Single checkbox ────────────────────────────────────────────────────────
  if (!isMultiple) {
    const isChecked = value === checkedValue || value === true;

    return (
      <div style={singleWrap}>
        <Checkbox
          checked={isChecked}
          disabled={isDisabled}
          onChange={(e) =>
            onValueChange(
              component.name,
              e.target.checked ? checkedValue : uncheckedValue,
            )
          }
        >
          <span style={labelStyle}>
            {component.label}
            {component.required && <span style={required}>*</span>}
            {isDisabled && (
              <Tooltip title="Read-only field">
                <LockOutlined style={{ fontSize: 11, color: "#f59e0b", marginLeft: 4 }} />
              </Tooltip>
            )}
          </span>
        </Checkbox>

        {component.hint && (
          <p style={hintStyle}>{component.hint}</p>
        )}
      </div>
    );
  }

  // ── Checkbox Group ─────────────────────────────────────────────────────────
  const validOptions = (component.options || []).filter(
    (o) => o && o.label && o.value !== undefined,
  );

  const groupValue = Array.isArray(value) ? value : [];

  return (
    <div style={groupWrap}>
      <div style={groupLabelRow}>
        <span style={groupLabelText}>
          {component.label}
          {component.required && <span style={required}>*</span>}
          {isDisabled && (
            <Tooltip title="Read-only field">
              <LockOutlined style={{ fontSize: 11, color: "#f59e0b", marginLeft: 4 }} />
            </Tooltip>
          )}
        </span>
      </div>

      <Checkbox.Group
        options={validOptions}
        value={groupValue}
        disabled={isDisabled}
        onChange={(checked) => onValueChange(component.name, checked)}
        style={groupStyle}
      />

      {component.hint && (
        <p style={hintStyle}>{component.hint}</p>
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const singleWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "6px 0",
};

const groupWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: "4px 0",
};

const groupLabelRow = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginBottom: 4,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-primary)",
};

const groupLabelText = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-secondary)",
  letterSpacing: "0.01em",
};

const required = {
  color: "#ef4444",
  marginLeft: 2,
  fontSize: 13,
};

const groupStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px 16px",
};

const hintStyle = {
  fontSize: 11,
  color: "var(--text-muted)",
  margin: 0,
  lineHeight: 1.4,
};

export default CheckboxComponent;
