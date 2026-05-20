import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Row,
  Col,
  Select,
  Typography,
  message,
  Tag,
  Spin,
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
import { useApi } from "../utilities/axiosApiCall";

const { Title, Text } = Typography;

const ContractSearch = () => {
  // Multi-filter state
  const [filters, setFilters] = useState([
    { id: 1, searchType: "P_CUSTOMER_ID", searchValue: "" },
    { id: 2, searchType: "branchNo", searchValue: "" },
  ]);
  const [nextFilterId, setNextFilterId] = useState(3);

  const [tableData, setTableData] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const searchApi = useApi();
  const detailsApi = useApi();

  const searchOptions = useMemo(
    () => [
      { label: "Customer ID", value: "P_CUSTOMER_ID" },
      { label: "Branch Code", value: "branchNo" },
      { label: "Product Code", value: "productCode" },
      { label: "Borrower Name", value: "borrowerName" },
      { label: "Loan ID No", value: "loanIdNo" },
    ],
    [],
  );

  // Add a new filter row
  const handleAddFilter = useCallback(() => {
    setFilters((prevFilters) => {
      const selectedTypes = prevFilters
        .map((f) => f.searchType)
        .filter(Boolean);
      const nextOption = searchOptions.find(
        (opt) => !selectedTypes.includes(opt.value),
      );
      const nextSearchType = nextOption ? nextOption.value : null;

      return [
        ...prevFilters,
        { id: nextFilterId, searchType: nextSearchType, searchValue: "" },
      ];
    });
    setNextFilterId((prev) => prev + 1);
  }, [nextFilterId, searchOptions]);

  // Get available options for a specific filter dropdown
  const getAvailableOptions = useCallback(
    (currentFilterId) => {
      const otherSelectedTypes = filters
        .filter((f) => f.id !== currentFilterId && f.searchType)
        .map((f) => f.searchType);
      return searchOptions.filter(
        (opt) => !otherSelectedTypes.includes(opt.value),
      );
    },
    [filters, searchOptions],
  );

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
  const handleSearch = useCallback(async () => {
    // Check if any filter has a value
    const hasActiveFilter = filters.some((f) => f.searchValue.trim());
    if (!hasActiveFilter) {
      messageApi.warning("Please enter at least one search value");
      return;
    }

    // Build attributes as { searchType: searchValue } pairs from active filters
    const attributes = filters
      .filter((f) => f.searchValue.trim())
      .reduce((acc, f) => {
        acc[f.searchType] = f.searchValue.trim();
        return acc;
      }, {});

    try {
      const menuParams = {
        subChannelId: "2",
        subServiceId: "16",
        attributes,
      };

      const res = await searchApi.post("/transaction/execute", menuParams);

      if (res?.data?.attributes) {
        const results = res.data.attributes.data;
        console.log("Table Data", results);
        setTableData(Array.isArray(results) ? results : []);
        messageApi.success("Search completed successfully!");
      } else {
        messageApi.error("Invalid response received from API");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      messageApi.error("Failed to load search results");
    }
  }, [filters, messageApi]);

  const handleViewDetails = useCallback(
    async (record) => {
      try {
        const loanIdNo = record["loanIdNo"];
        const res = await detailsApi.post("/transaction/execute", {
          subChannelId: "2",
          subServiceId: "17",
          attributes: { loanIdNo: loanIdNo },
        });
        if (res?.data?.attributes) {
          setSelectedContract(res.data.attributes);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            document.body.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        } else {
          messageApi.error("Failed to load contract details");
        }
      } catch (error) {
        console.error("Error fetching contract details:", error);
        messageApi.error("Failed to load contract details");
      }
    },
    [detailsApi, messageApi],
  );

  const handleBackToSearch = useCallback(() => {
    setSelectedContract(null);
  }, []);

  const handleReset = useCallback(() => {
    setFilters([
      { id: 1, searchType: "P_CUSTOMER_ID", searchValue: "" },
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
      // {
      //   title: "Contact No",
      //   dataIndex: "contactNo",
      //   key: "contactNo",
      //   width: 140,
      //   sorter: (a, b) => a.contactNo.localeCompare(b.contactNo),
      // },
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
          {detailsApi.loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >
              <Spin size="large" tip="Loading contract details..." />
            </div>
          ) : selectedContract ? (
            // Contract Details View
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
                <ContractDetails contract={selectedContract.data[0]} />
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
                                options={getAvailableOptions(filter.id)}
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
                          disabled={filters.length >= searchOptions.length}
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
                    loading={searchApi.loading}
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
