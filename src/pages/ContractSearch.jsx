import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Row,
  Col,
  Select,
  Typography,
  message,
  Divider,
  Tag,
  Empty,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ContractDetails from "./ContractDetails";
import CustomTable from "../components/UI/CustomTable";

const { Title, Text } = Typography;

// Dummy data for demonstration
const DUMMY_CONTRACTS = [
  {
    id: 1,
    contractNo: "CNT001234",
    branchNo: "101",
    productCode: "PRD-001",
    borrowerName: "Rabindranath Tagore",
    loanIdNo: "LOAN-001",
  },
  {
    id: 2,
    contractNo: "CNT001235",
    branchNo: "102",
    productCode: "PRD-002",
    borrowerName: "Kazi Nazrul Islam",
    loanIdNo: "LOAN-002",
  },
  {
    id: 3,
    contractNo: "CNT001236",
    branchNo: "103",
    productCode: "PRD-003",
    borrowerName: "Jibanananda Das",
    loanIdNo: "LOAN-003",
  },
  {
    id: 4,
    contractNo: "CNT001237",
    branchNo: "101",
    productCode: "PRD-001",
    borrowerName: "Sathendranath Dutta",
    loanIdNo: "LOAN-004",
  },
  {
    id: 5,
    contractNo: "CNT001238",
    branchNo: "102",
    productCode: "PRD-004",
    borrowerName: "Begum Rokeya",
    loanIdNo: "LOAN-005",
  },
  {
    id: 6,
    contractNo: "CNT001239",
    branchNo: "102",
    productCode: "PRD-002",
    borrowerName: "Kazi Abdul Wadud",
    loanIdNo: "LOAN-006",
  },
  {
    id: 7,
    contractNo: "CNT001240",
    branchNo: "101",
    productCode: "PRD-005",
    borrowerName: "Jasimuddin",
    loanIdNo: "LOAN-007",
  },
  {
    id: 8,
    contractNo: "CNT001241",
    branchNo: "103",
    productCode: "PRD-003",
    borrowerName: "Sufia Kamal",
    loanIdNo: "LOAN-008",
  },
];

const ContractSearch = () => {
  // Multi-filter state
  const [filters, setFilters] = useState([
    { id: 1, searchType: "contractNo", searchValue: "" },
    { id: 2, searchType: "branchNo", searchValue: "" },
  ]);
  const [nextFilterId, setNextFilterId] = useState(3);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const searchOptions = useMemo(
    () => [
      { label: "Contact No", value: "contractNo" },
      { label: "Branch Code", value: "branchNo" },
      { label: "Product Code", value: "productCode" },
      { label: "Borrower Name", value: "borrowerName" },
      { label: "Loan ID No", value: "loanIdNo" },
    ],
    [],
  );

  // Add a new filter row
  const handleAddFilter = useCallback(() => {
    setFilters((prevFilters) => [
      ...prevFilters,
      { id: nextFilterId, searchType: "contractNo", searchValue: "" },
    ]);
    setNextFilterId((prev) => prev + 1);
  }, [nextFilterId]);

  // Remove a filter row
  const handleRemoveFilter = useCallback(
    (filterId) => {
      setFilters((prevFilters) => {
        if (prevFilters.length === 1) {
          messageApi.warning("You must have at least one filter");
          return prevFilters;
        }
        return prevFilters.filter((f) => f.id !== filterId);
      });
    },
    [messageApi],
  );

  // Update filter value
  const handleUpdateFilter = useCallback((filterId, field, value) => {
    setFilters((prevFilters) =>
      prevFilters.map((f) =>
        f.id === filterId ? { ...f, [field]: value } : f,
      ),
    );
  }, []);

  // Multi-criteria search
  const handleSearch = useCallback(() => {
    // Check if any filter has a value
    const hasActiveFilter = filters.some((f) => f.searchValue.trim());
    if (!hasActiveFilter) {
      messageApi.warning("Please enter at least one search value");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let results = DUMMY_CONTRACTS;

      // Apply all filters (AND logic)
      for (const filter of filters) {
        if (filter.searchValue.trim()) {
          results = results.filter((contract) => {
            const fieldValue = String(
              contract[filter.searchType],
            ).toLowerCase();
            return fieldValue.includes(filter.searchValue.toLowerCase());
          });
        }
      }

      if (results.length === 0) {
        messageApi.info("No contracts found matching all criteria");
      } else {
        messageApi.success(`Found ${results.length} contract(s)`);
      }
      setTableData(results);
      setLoading(false);
    }, 500);
  }, [filters, messageApi]);

  const handleViewDetails = useCallback((record) => {
    setSelectedContract(record);
  }, []);

  const handleBackToSearch = useCallback(() => {
    setSelectedContract(null);
  }, []);

  const handleReset = useCallback(() => {
    setFilters([
      { id: 1, searchType: "contractNo", searchValue: "" },
      { id: 2, searchType: "branchNo", searchValue: "" },
    ]);
    setNextFilterId(3);
    setTableData([]);
    messageApi.info("All filters have been reset");
  }, [messageApi]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: "Action",
        key: "action",
        width: 100,
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
        ),
      },
      {
        title: "Contact No",
        dataIndex: "contractNo",
        key: "contractNo",
        width: 140,
        sorter: (a, b) => a.contractNo.localeCompare(b.contractNo),
      },
      {
        title: "Branch No",
        dataIndex: "branchNo",
        key: "branchNo",
        width: 140,
        sorter: (a, b) => a.branchNo.localeCompare(b.branchNo),
      },
      {
        title: "Product Code",
        dataIndex: "productCode",
        key: "productCode",
        width: 140,
        sorter: (a, b) => a.productCode.localeCompare(b.productCode),
      },
      {
        title: "Name of Borrower",
        dataIndex: "borrowerName",
        key: "borrowerName",
        width: 140,
        sorter: (a, b) => a.borrowerName.localeCompare(b.borrowerName),
      },
      {
        title: "Loan ID No",
        dataIndex: "loanIdNo",
        key: "loanIdNo",
        width: 140,
        sorter: (a, b) => a.loanIdNo.localeCompare(b.loanIdNo),
      },
    ],
    [handleViewDetails],
  );

  // Animation variants
  const searchViewVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  const detailsViewVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const backButtonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      {contextHolder}
      <AnimatePresence mode="wait">
        <div style={{ padding: "12px" }}>
          {selectedContract ? (
            // contact Details View
            <motion.div
              key="details"
              variants={detailsViewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <motion.div
                variants={backButtonVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToSearch}
                  style={{ marginBottom: "16px", paddingLeft: 0 }}
                >
                  Back to Search
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <ContractDetails contract={selectedContract} />
              </motion.div>
            </motion.div>
          ) : (
            // Contact Search View
            <motion.div
              key="search"
              variants={searchViewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <>
                <Card
                  title={
                    <Title level={4} style={{ marginTop: 0, color: "#1890ff" }}>
                      Contact Search
                    </Title>
                  }
                  style={{
                    marginBottom: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Multi-Filter Builder */}
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    {/* Active Filters Info */}
                    {tableData.length > 0 && (
                      <div
                        style={{
                          padding: "12px 16px",
                          backgroundColor: "#e3f1f7",
                          borderRadius: "6px",
                        }}
                      >
                        <Text strong>
                          {filters.filter((f) => f.searchValue.trim()).length}{" "}
                          filter(s) applied
                        </Text>
                        <Space size={8} style={{ marginLeft: 16 }}>
                          {filters
                            .filter((f) => f.searchValue.trim())
                            .map((f) => (
                              <Tag key={f.id} closable>
                                {
                                  searchOptions.find(
                                    (opt) => opt.value === f.searchType,
                                  )?.label
                                }
                                : "{f.searchValue}"
                              </Tag>
                            ))}
                        </Space>
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "16px",
                      }}
                    >
                      {filters.map((filter, index) => (
                        <div
                          key={filter.id}
                          style={{
                            padding: "12px",
                            backgroundColor: "#fafafa",
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} sm={24} md={10}>
                              <Select
                                value={filter.searchType}
                                onChange={(value) =>
                                  handleUpdateFilter(
                                    filter.id,
                                    "searchType",
                                    value,
                                  )
                                }
                                options={searchOptions}
                                style={{ width: "100%" }}
                                placeholder="Select field"
                              />
                            </Col>
                            <Col xs={24} sm={20} md={12}>
                              <Input
                                style={{
                                  borderColor: "#13c2c2",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "#1890ff";
                                  e.target.style.boxShadow =
                                    "0 0 0 2px rgba(24, 144, 255, 0.1)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "#13c2c2";
                                  e.target.style.boxShadow = "none";
                                }}
                                placeholder={`Enter ${
                                  searchOptions.find(
                                    (opt) => opt.value === filter.searchType,
                                  )?.label
                                }`}
                                value={filter.searchValue}
                                onChange={(e) =>
                                  handleUpdateFilter(
                                    filter.id,
                                    "searchValue",
                                    e.target.value,
                                  )
                                }
                                onPressEnter={handleSearch}
                                allowClear
                              />
                            </Col>
                            <Col xs={24} sm={4} md={2}>
                              <Space>
                                {filters.length > 1 && (
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveFilter(filter.id)
                                    }
                                    size="small"
                                  />
                                )}
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <Row
                      gutter={16}
                      justify="center"
                      style={{ marginTop: "16px" }}
                    >
                      <Col>
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={handleAddFilter}
                        >
                          Add Filter
                        </Button>
                      </Col>
                      <Col>
                        <Space>
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                          >
                            Search
                          </Button>
                          <Button onClick={handleReset}>Reset</Button>
                        </Space>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                {/* Results Table */}
                <Card
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                  styles={{ body: { padding: "0px" } }}
                >
                  <CustomTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    showExport={true}
                    onExport={(data) => {
                      console.log("Exporting data:", data);
                    }}
                    onRowClick={(record) => {
                      console.log("Row clicked:", record);
                    }}
                    hasActiveFilters={filters.some((f) => f.searchValue.trim())}
                    primaryColor="#1890ff"
                    secondaryColor="#f0f7ff"
                    stripedRows={true}
                    showRowHoverEffect={true}
                    highlightFirstColumn={true}
                    // Animation props
                    rowAnimation="zoom"
                    animationDuration={0.3}
                    staggerChildren={0.05}
                  />
                </Card>
              </>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </>
  );
};

export default ContractSearch;
