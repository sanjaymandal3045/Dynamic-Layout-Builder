// ReusableTable.jsx
import React, { useRef, memo } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Empty,
  Typography,
  message,
} from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Text } = Typography;

const CustomTable = memo(({
  // Data props
  dataSource = [],
  columns = [],
  rowKey = "id",
  loading = false,

  // Pagination props
  pagination = true,
  pageSize = 10,
  showSizeChanger = true,
  showQuickJumper = true,

  // Styling props
  title = null,
  showTitle = true,
  showExport = true,
  bordered = false,
  size = "middle",
  scrollX = 1000,
  rowClassName = null,

  // Interaction props
  onRowClick = null,
  onExport = null,
  emptyText = "No data available",
  customEmptyComponent = null,

  // Animation props
  rowAnimation = "slide",
  animationDuration = 0.3,
  staggerChildren = 0.05,

  // Additional features
  showRowHoverEffect = true,
  stripedRows = true,
  highlightFirstColumn = true,
  customHeaderStyle = {},
  customRowStyle = {},

  // Theme colors
  primaryColor = "#1890ff",
  secondaryColor = "#f0f7ff",

  // Filter state
  hasActiveFilters = false,
}) => {
  const tableRef = useRef(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren,
      },
    },
  };

  const rowVariants = {
    hidden: () => {
      switch (rowAnimation) {
        case "slide":
          return { opacity: 0, x: -20 };
        case "fade":
          return { opacity: 0 };
        case "scale":
          return { opacity: 0, scale: 0.95 };
        case "zoom":
          return { opacity: 0, scale: 0.8 };
        default:
          return { opacity: 0 };
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: animationDuration,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: animationDuration / 2,
      },
    },
  };

  // Default empty component
  const defaultEmptyComponent = customEmptyComponent || (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Empty
        description="No Results"
        style={{ marginTop: "48px", marginBottom: "48px" }}
      >
        <Text type="secondary">
          {hasActiveFilters
            ? "No records found matching your filters"
            : emptyText}
        </Text>
      </Empty>
    </motion.div>
  );

  // Default pagination config
  const paginationConfig = pagination
    ? {
        pageSize,
        total: dataSource.length,
        showSizeChanger,
        showQuickJumper,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        position: ["bottomCenter"],
      }
    : false;

  // Default row class name generator with zigzag coloring
  const getRowClassName = (record, index) => {
    let className = "";

    // Zigzag coloring (alternating row colors)
    if (stripedRows) {
      if (index % 2 === 0) {
        className = "reusable-table-row-even";
      } else {
        className = "reusable-table-row-odd";
      }
    }

    if (rowClassName) {
      const customClass = rowClassName(record, index);
      className += customClass ? ` ${customClass}` : "";
    }

    return className;
  };

  // Default row click handler
  const handleRowClick = (record) => {
    if (onRowClick) {
      onRowClick(record);
    }
  };

  // Export handler
  const handleExport = async () => {
    if (onExport) {
      await onExport(dataSource);
    } else {
      try {
        const headers = columns
          .filter((col) => col.dataIndex && col.title !== "Action")
          .map((col) => col.title);

        const rows = dataSource.map((row) =>
          columns
            .filter((col) => col.dataIndex && col.title !== "Action")
            .map((col) => row[col.dataIndex]),
        );

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `table-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        message.success("Export successful");
      } catch (error) {
        message.error("Export failed");
      }
    }
  };


  // Enhanced columns with default styling
  const enhancedColumns = columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      style: {
        backgroundColor: secondaryColor,
        fontWeight: 600,
        fontSize: "14px",
        borderBottom: `2px solid ${primaryColor}`,
        ...customHeaderStyle,
      },
    }),
    onCell: (record, rowIndex) => ({
      style: {
        ...(highlightFirstColumn &&
          index === 0 && {
            backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "#ffffff",
            fontWeight: 500,
          }),
        ...customRowStyle,
      },
    }),
  }));

  // Custom body wrapper with animations
  const components = {
    body: {
      wrapper: (props) => (
        <motion.tbody
          {...props}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        />
      ),
      row: (props) => {
        const { className, ...restProps } = props;
        return (
          <motion.tr
            {...restProps}
            className={className}
            variants={rowVariants}
            style={{ cursor: onRowClick ? "pointer" : "default" }}
            whileHover={
              showRowHoverEffect
                ? {
                    backgroundColor: "rgba(24, 144, 255, 0.05)",
                    transition: { duration: 0.15 },
                  }
                : {}
            }
          />
        );
      },
    },
  };

  return (
    <motion.div
      className="reusable-table-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={tableRef}
    >
      <Table
        columns={enhancedColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={paginationConfig}
        scroll={{ x: scrollX }}
        locale={{ emptyText: defaultEmptyComponent }}
        rowClassName={getRowClassName}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        bordered={bordered}
        size={size}
        components={components}
      />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - return true if props are equal (skip re-render)
  // We only care about these key props for the table
  return (
    prevProps.dataSource === nextProps.dataSource &&
    prevProps.loading === nextProps.loading &&
    prevProps.hasActiveFilters === nextProps.hasActiveFilters &&
    prevProps.columns === nextProps.columns
  );
});

CustomTable.displayName = 'CustomTable';

export default CustomTable;