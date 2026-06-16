import { useState, useCallback, useMemo } from "react";
import { Button, Input, Select, Space, Tag, Tooltip } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

// ─────────────────────────────────────────────────────────────────────────────
// FilterSearchPanel
//
// A professional multi-criteria search panel rendered in place of a plain
// button when `component.filterSearch.enabled` is true.
//
// Props:
//   searchOptions   — array of { label, value } from the button config
//   multiFilter     — bool: allow multiple rows (default true)
//   onSearch(attrs) — called with the attributes object when Search is clicked
//   isLoading       — bool: disables controls while API call is in-flight
//   buttonLabel     — fallback label for the Search button (default "Search")
// ─────────────────────────────────────────────────────────────────────────────

// Original indigo theme
const T = {
  solid: "#6366f1",
  dark: "#4338ca",
  light: "#f5f3ff",
  mid: "#c7d2fe",
  border: "#c7d2fe",
  text: "#3730a3",
  textMid: "#6366f1",
  icon: "#6366f1",
  tagBg: "#e0e7ff",
  tagText: "#3730a3",
};

const FilterSearchPanel = ({
  searchOptions = [],
  multiFilter = true,
  onSearch,
  isLoading = false,
  buttonLabel = "Search",
  extraNodes = null,
}) => {
  const firstOption = searchOptions[0]?.value ?? null;

  const [filters, setFilters] = useState([
    { id: Date.now(), searchType: firstOption, searchValue: "" },
  ]);
  const [nextId, setNextId] = useState(Date.now() + 1);

  // Options available for a specific row (exclude types chosen in other rows)
  const getAvailableOptions = useCallback(
    (currentId) => {
      const otherSelected = filters
        .filter((f) => f.id !== currentId && f.searchType)
        .map((f) => f.searchType);
      return searchOptions.filter((o) => !otherSelected.includes(o.value));
    },
    [filters, searchOptions],
  );

  const allOptionsUsed = filters.length >= searchOptions.length;
  const hasActiveFilter = filters.some((f) => f.searchValue.trim());

  const activeTags = useMemo(
    () => filters.filter((f) => f.searchType && f.searchValue.trim()),
    [filters],
  );

  const addFilter = useCallback(() => {
    const usedTypes = filters.map((f) => f.searchType);
    const next = searchOptions.find((o) => !usedTypes.includes(o.value));
    setFilters((prev) => [
      ...prev,
      { id: nextId, searchType: next?.value ?? null, searchValue: "" },
    ]);
    setNextId((n) => n + 1);
  }, [filters, searchOptions, nextId]);

  const removeFilter = useCallback((id) => {
    setFilters((prev) =>
      prev.length === 1 ? prev : prev.filter((f) => f.id !== id),
    );
  }, []);

  const updateFilter = useCallback((id, field, val) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    );
  }, []);

  const handleReset = useCallback(() => {
    setFilters([{ id: Date.now(), searchType: firstOption, searchValue: "" }]);
    setNextId(Date.now() + 1);
  }, [firstOption]);

  const handleSearch = useCallback(() => {
    const attrs = filters
      .filter((f) => f.searchType && f.searchValue.trim())
      .reduce((acc, f) => {
        acc[f.searchType] = f.searchValue.trim();
        return acc;
      }, {});
    if (Object.keys(attrs).length === 0) return;
    onSearch?.(attrs);
  }, [filters, onSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  return (
    <div style={panelWrap}>
      {/* ── Filter Rows — 2-column responsive grid ───────────── */}
      <div style={filterGrid}>
        {filters.map((filter) => {
          const availOpts = getAvailableOptions(filter.id);
          const selectedLabel = searchOptions.find(
            (o) => o.value === filter.searchType,
          )?.label;

          return (
            <div key={filter.id} style={filterRow}>
              {/* Field selector */}
              <Select
                value={filter.searchType}
                onChange={(v) => updateFilter(filter.id, "searchType", v)}
                options={availOpts}
                style={{ width: 120, flexShrink: 0 }}
                placeholder="Select field"
                disabled={isLoading}
                size="middle"
                popupMatchSelectWidth={false}
              />

              {/* Value input */}
              <Input
                placeholder={
                  selectedLabel ? `Enter ${selectedLabel}…` : "Enter value…"
                }
                value={filter.searchValue}
                onChange={(e) =>
                  updateFilter(filter.id, "searchValue", e.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                allowClear
                style={valueInput}
              />

              {/* Remove row */}
              {filters.length > 1 && (
                <Tooltip title="Remove filter">
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFilter(filter.id)}
                    disabled={isLoading}
                    style={{ flexShrink: 0, borderRadius: 6 }}
                  />
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Action Row ───────────────────────────────────────── */}
      <div style={actionRow}>
        <div>
          {multiFilter && (
            <Tooltip
              title={
                allOptionsUsed
                  ? "All available criteria are in use"
                  : "Add another search criterion"
              }
            >
              <Button
                type="dashed"
                size="middle"
                icon={<PlusOutlined />}
                onClick={addFilter}
                disabled={allOptionsUsed || isLoading}
                style={addBtn}
              >
                Add Filter
              </Button>
            </Tooltip>
          )}
        </div>

        <Space size={8} style={{ flexWrap: "wrap" }}>
          {extraNodes}
          <Button
            size="middle"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={isLoading}
            style={resetBtn}
          >
            Reset
          </Button>

          <Button
            type="primary"
            size="middle"
            icon={<SearchOutlined />}
            loading={isLoading}
            disabled={!hasActiveFilter}
            onClick={handleSearch}
            style={searchBtn}
          >
            {buttonLabel}
          </Button>
        </Space>
      </div>

      {/* Responsive override: 1 column on small screens */}
      <style>{`
        @media (max-width: 640px) {
          .fsp-grid { grid-template-columns: 1fr !important; }
          .fsp-row  { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const panelWrap = {
  width: "100%",
};

// 2-column responsive grid — each row fills one cell
const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  padding: "0px 8px", // Reduced padding
};

// Each filter row is a flex row: [select] [input] [delete?]
const filterRow = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px", // Tighter padding
  background: "var(--bg-card)",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-sm)",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const valueInput = {
  flex: 1,
  borderRadius: 8,
  borderColor: "var(--border-color)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 13,
  height: 34,
};

const actionRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 8px 4px", // Compact top margin, minimal bottom
};

const addBtn = {
  borderColor: "var(--border-color)",
  background: "var(--bg-card)",
  color: "var(--text-secondary)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  height: 36,
  minWidth: 110,
};

const resetBtn = {
  borderColor: "var(--border-color)",
  background: "var(--bg-card)",
  color: "var(--text-secondary)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  height: 36,
  minWidth: 110,
};

const searchBtn = {
  background: "linear-gradient(135deg, #0d9488, #0f858dff)",
  borderColor: "transparent",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
  boxShadow: "0 2px 8px rgba(13,148,136,0.35)",
  color: "white",
  height: 36,
  minWidth: 110,
};

export default FilterSearchPanel;
