import React, { memo, useMemo, useRef } from "react";
import { Table, Empty, Typography, message } from "antd";

const { Text } = Typography;

const CustomTable = memo(
  ({
    dataSource = [],
    columns = [],
    rowKey = "id",
    loading = false,

    pagination = true,
    pageSize = 10,
    showSizeChanger = true,
    showQuickJumper = true,

    bordered = false,
    size = "middle",
    scrollX = 1000,
    rowClassName = null,

    onRowClick = null,
    onExport = null,
    emptyText = "No data available",
    customEmptyComponent = null,

    showRowHoverEffect = true,
    stripedRows = true,
    highlightFirstColumn = true,
    customHeaderStyle = {},
    customRowStyle = {},

    primaryColor = "#0f858dff",
    secondaryColor = "#f0f7ff",

    hasActiveFilters = false,

    // Kept for API compatibility — controls stagger delay
    staggerChildren = 0.05,
    animationDuration = 0.28,

    // Unused but accepted so callers don't break
    rowAnimation,
    showExport,
    title,
    showTitle,
  }) => {
    // ── Version key ──────────────────────────────────────────────────────────
    // Increments only when the dataSource reference changes.
    // This generates a new CSS class name so the animation re-fires only on
    // real data loads — not on sort / paginate (which don't change our props).
    const animVersionRef = useRef(0);
    const prevDataRef = useRef(dataSource);
    if (prevDataRef.current !== dataSource) {
      prevDataRef.current = dataSource;
      animVersionRef.current += 1;
    }
    const v = animVersionRef.current;
    const animClass = `ctr-${v}`; // unique class per data version

    // ── Scoped CSS ───────────────────────────────────────────────────────────
    // The entrance animation is keyed to `animClass` so it only replays when
    // new data arrives. Hover and stripes are version-independent CSS.
    const staggerMs = Math.round(staggerChildren * 1000);
    const durationMs = Math.round(animationDuration * 1000);

    const css = `
      @keyframes ctRowIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Entrance — only fires when .ctr-{v} is new to the browser */
      tr.${animClass} td {
        animation: ctRowIn ${durationMs}ms ease-out both;
      }

      /* Striped rows */
      tr.ct-even td { background: #fafafa !important; }
      tr.ct-odd  td { background: #ffffff !important; }

      /* Hover highlight */
      ${
        showRowHoverEffect
          ? `
      tr.ct-even:hover td,
      tr.ct-odd:hover  td {
        background: rgba(24, 144, 255, 0.07) !important;
      }
      tr.ct-even td,
      tr.ct-odd  td {
        transition: background 0.18s ease;
      }`
          : ""
      }

      /* Smooth cursor */
      .ant-table-row { cursor: ${onRowClick ? "pointer" : "default"}; }
    `;

    // ── Row class names ──────────────────────────────────────────────────────
    const getRowClassName = (record, index) => {
      const stripe = stripedRows ? (index % 2 === 0 ? "ct-even" : "ct-odd") : "";
      const custom = rowClassName ? rowClassName(record, index) ?? "" : "";
      // animClass drives the entrance animation; stripe handles colouring
      return `${animClass} ${stripe} ${custom}`.trim();
    };

    // ── onRow — staggered animation-delay via inline style ──────────────────
    const handleRow = (record, rowIndex) => ({
      ...(onRowClick ? { onClick: () => onRowClick(record) } : {}),
      style: {
        // Push each row's animation start later so they cascade in
        animationDelay: `${rowIndex * staggerMs}ms`,
      },
    });

    // ── Enhanced columns ─────────────────────────────────────────────────────
    const enhancedColumns = useMemo(
      () =>
        columns.map((col, idx) => ({
          ...col,
          onHeaderCell: () => ({
            style: {
              backgroundColor: secondaryColor,
              fontWeight: 600,
              fontSize: 14,
              borderBottom: `2px solid ${primaryColor}`,
              ...customHeaderStyle,
            },
          }),
          onCell: (_record, rowIdx) => ({
            style: {
              ...(highlightFirstColumn &&
                idx === 0 && {
                  backgroundColor: rowIdx % 2 === 0 ? "#fafafa" : "#fff",
                  fontWeight: 500,
                }),
              ...customRowStyle,
            },
          }),
        })),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [columns, primaryColor, secondaryColor, highlightFirstColumn],
    );

    // ── Pagination ───────────────────────────────────────────────────────────
    const paginationConfig = pagination
      ? {
          pageSize,
          showSizeChanger,
          showQuickJumper,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          position: ["bottomCenter"],
        }
      : false;

    // ── Empty state ──────────────────────────────────────────────────────────
    const emptyNode = customEmptyComponent ?? (
      <Empty description="No Results" style={{ margin: "48px 0" }}>
        <Text type="secondary">
          {hasActiveFilters
            ? "No records found matching your filters"
            : emptyText}
        </Text>
      </Empty>
    );

    // ── Export ───────────────────────────────────────────────────────────────
    const handleExport = async () => {
      if (onExport) return onExport(dataSource);
      try {
        const dataCols = columns.filter(
          (c) => c.dataIndex && c.title !== "Action",
        );
        const csv = [
          dataCols.map((c) => c.title).join(","),
          ...dataSource.map((row) =>
            dataCols.map((c) => row[c.dataIndex] ?? "").join(","),
          ),
        ].join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        Object.assign(document.createElement("a"), {
          href: url,
          download: `export-${Date.now()}.csv`,
        }).click();
        URL.revokeObjectURL(url);
        message.success("Export successful");
      } catch {
        message.error("Export failed");
      }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <>
        <style>{css}</style>
        <Table
          columns={enhancedColumns}
          dataSource={dataSource}
          loading={loading}
          pagination={paginationConfig}
          scroll={{ x: scrollX }}
          locale={{ emptyText: emptyNode }}
          rowClassName={getRowClassName}
          rowKey={(record) => record[rowKey] ?? record.id ?? Math.random()}
          onRow={handleRow}
          bordered={bordered}
          size={size}
          expandable={{ showExpandColumn: false }}
          style={{
            borderRadius: 10,
            border: "1px solid #e8edf2",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
          }}
        />
      </>
    );
  },
  (prev, next) =>
    prev.dataSource === next.dataSource &&
    prev.loading === next.loading &&
    prev.hasActiveFilters === next.hasActiveFilters &&
    prev.columns === next.columns,
);

CustomTable.displayName = "CustomTable";
export default CustomTable;
