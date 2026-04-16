import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Tabs,
  Form,
  Input,
  Button,
  Divider,
  Tag,
  Space,
  Select,
  DatePicker,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useFieldPermissions } from "../utilities/userFieldPermissions";
import { useApi } from "../utilities/axiosApiCall";

const ContractDetails = ({ contract }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [permissions, setPermissions] = useState({});
  const fetchPermissionsApi = useApi();

  // Initialize permissions hook
  const { getFieldPermission, isFieldVisible, isFieldEditable, getMaskedValue, renderWithPermission } =
    useFieldPermissions(permissions);

  // Dummy detailed data based on contract
  const contractDetailData = {
    ...contract,
    status: "Active",
    loanAmount: 500000,
    currency: "BDT",
    sanctionDate: "2023-01-15",
    disbursementDate: "2023-02-01",
    maturityDate: "2028-02-01",
    interestRate: 12.5,
    emi: 10750,
    tenure: 60,
    guaranter: "Guardian Bank Limited",
  };

  // Fetch permissions when edit is clicked
  const handleEditClick = async () => {
    try {
       const menuParams = {
          subChannelId: "2",
          subServiceId: "15",
          traceNo: "",
          attributes: {
            pageKey: "contract-search",
          },
        };
        const result = await fetchPermissionsApi.post(
          `/transaction/execute`,
          menuParams,
        );

      if (result.success && result.data?.attributes?.permissions) {
        // Extract permissions from API response
        const permissionsData = result.data.attributes.permissions;
        setPermissions(permissionsData);
        setIsEditing(true);
      } else {
        console.error("Failed to fetch permissions");
        setIsEditing(true); // Fallback: allow edit without permissions
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setIsEditing(true); // Fallback: allow edit without permissions
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      handleEditClick();
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log("Saved values:", values);
      setIsEditing(false);
    });
  };

  // Common header info section
  const HeaderInfo = () => {
    const headerFields = [
      { label: "CONTACT NO", value: contractDetailData.contractNo, fieldId: "contactNo" },
      { label: "BRANCH CODE", value: contractDetailData.branchNo, fieldId: "branchCode" },
      { label: "BORROWER NAME", value: contractDetailData.borrowerName, fieldId: "borrowerName" },
      { label: "PRODUCT CODE", value: contractDetailData.productCode, fieldId: "productCode" },
      {
        label: "LOAN ID NO",
        value: contractDetailData.loanIdNo,
        fieldId: "loanIdNo",
      },
    ];

    return (
      <div style={{ marginBottom: "30px" }}>
        <Row
          gutter={[12, 12]}
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          {headerFields.map((item, index) => {
            // Check if field is visible based on permissions
            if (!isFieldVisible(item.fieldId)) {
              return null;
            }

            const displayValue = getMaskedValue(item.value, item.fieldId);

            return (
              <Col key={index} xs={24} sm={8} md={4}>
                <div className="rounded-2xl p-[2px] bg-gradient-to-br from-green-200 via-cyan-500 to-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="rounded-2xl bg-white p-4 h-full">
                    <div className="text-[11px] font-medium text-black-500 tracking-wide">
                      {item.label}
                    </div>

                    <div className="text-md font-bold text-black-800 dark:text-black mt-1 ellipsis">
                      {displayValue || "-"}
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // Form field wrapper with label and permission-based rendering
  const FormField = ({ label, children, xs = 24, sm = 12, md = 8, lg = 4, fieldId }) => {
    // If fieldId is provided and not visible, don't render
    if (fieldId && !isFieldVisible(fieldId)) {
      return null;
    }

    const { canWrite } = getFieldPermission(fieldId);
    const isDisabled = fieldId && !canWrite;

    // Clone children to apply disabled state if needed
    const enhancedChildren = fieldId && isDisabled ? 
      React.cloneElement(children, { disabled: true }) : 
      children;

    return (
      <Col xs={xs} sm={sm} md={md} lg={lg}>
        <Form.Item
          label={
            <Tooltip title={label} placement="topLeft">
              <span
                style={{
                  display: "block",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </span>
            </Tooltip>
          }
          style={{ marginBottom: "16px" }}
        >
          {enhancedChildren}
        </Form.Item>
      </Col>
    );
  };

  // Tab 1: Loan Account/Contract
  const LoanAccountTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="SL. No." md={6} fieldId="slNo">
          <Input placeholder="SL. No." />
        </FormField>
        <FormField label="Br. Code" md={6} fieldId="brCode">
          <Input placeholder="Br. Code" defaultValue={contract.branchNo} />
        </FormField>
        <FormField label="Br. Name" md={6} fieldId="brName">
          <Input placeholder="Br. Name" />
        </FormField>
        <FormField label="Parent Br. Code" md={6} fieldId="parentBrCode">
          <Input placeholder="Parent Br. Code" />
        </FormField>
        <FormField label="Loan Description" md={8} fieldId="loanDesc">
          <Input.TextArea placeholder="Loan Description" rows={1} />
        </FormField>
        <FormField label="Product Code" md={8} fieldId="productCode">
          <Input
            placeholder="Product Code"
            defaultValue={contract.productCode}
          />
        </FormField>
        <FormField label="Name of the Borrower" md={8} fieldId="borrowerName">
          <Input
            placeholder="Name of the Borrower"
            defaultValue={contract.borrowerName}
          />
        </FormField>
        <FormField label="Loan Identification No." md={8} fieldId="loanIdNo">
          <Input placeholder="Loan ID No." defaultValue={contract.loanIdNo} />
        </FormField>
        <FormField label="Customer's Unique ID" md={8} fieldId="custUniqueId">
          <Input placeholder="Customer's Unique ID" />
        </FormField>
        <FormField label="Amount Disbursed" md={8} fieldId="amtDisbursed">
          <Input type="number" placeholder="Amount" defaultValue="500000" />
        </FormField>
        <FormField label="Balance Outstanding" md={8} fieldId="balanceOutstanding">
          <Input
            type="number"
            placeholder="Balance Outstanding"
            defaultValue="450000"
          />
        </FormField>
        <FormField label="Interest Rate" md={8} fieldId="interestRate">
          <Input
            type="number"
            placeholder="Interest Rate %"
            defaultValue="12.5"
          />
        </FormField>
        <FormField label="Business Identification Number (BIN)/TIN" md={8} fieldId="binTin">
          <Input placeholder="BIN/TIN" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 2: Sanction
  const SanctionTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="Nature of Sanction" md={12} fieldId="natureOfSanction">
          <Select
            placeholder="Select Nature of Sanction"
            options={[
              { label: "New Sanction", value: "new" },
              { label: "Reschedule", value: "reschedule" },
              { label: "Restructure", value: "restructure" },
            ]}
          />
        </FormField>
        <FormField label="Nature of Facilities" md={12} fieldId="natureOfFacilities">
          <Select
            placeholder="Select Nature of Facilities"
            options={[
              { label: "Term Loan", value: "term_loan" },
              { label: "Credit Line", value: "credit_line" },
              { label: "Overdraft", value: "overdraft" },
            ]}
          />
        </FormField>
        <FormField label="Date of Sanction/Reschedule/Restructure" md={8} fieldId="dateOfSanction">
          <Input placeholder="DD/MM/YY" />
        </FormField>
        <FormField label="Date of Expiry" md={8} fieldId="dateOfExpiry">
          <Input placeholder="DD/MM/YY" />
        </FormField>
        <FormField label="Latest Sanctioned Limit" md={8} fieldId="latestSanctionedLimit">
          <Input type="number" placeholder="Amount" defaultValue="500000" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 3: Limit & Disbursement
  const LimitDisbursementTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="Latest Sanctioned Limit" md={12} fieldId="sanctionedLimit">
          <Input type="number" placeholder="Amount" defaultValue="500000" />
        </FormField>
        <FormField label="1st Disbursement Amount" md={12} fieldId="firstDisbursement">
          <Input type="number" placeholder="Amount" defaultValue="500000" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 4: Due & Payment
  const DuePaymentTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Amount Due Since Sanctioning/Last Rescheduling/Restructuring"
          md={12}
          fieldId="amountDue"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Amount Paid Since Sanctioning/Last Rescheduling/Restructuring"
          md={12}
          fieldId="amountPaid"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Installment Frequency" md={12} fieldId="installmentFreq">
          <Select
            placeholder="Select Frequency"
            options={[
              { label: "Monthly", value: "monthly" },
              { label: "Quarterly", value: "quarterly" },
              { label: "Bi-annual", value: "biannual" },
              { label: "Annual", value: "annual" },
            ]}
          />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 5: CL Status
  const CLStatusTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="Time Equivalent of Amount Overdue (in months)" md={8} fieldId="timeOverdue">
          <Input type="number" placeholder="Months" />
        </FormField>
        <FormField label="Time after expiry (if any) (in months)" md={8} fieldId="timeAfterExpiry">
          <Input type="number" placeholder="Months" />
        </FormField>
        <FormField label="Period of Overdue/Past Due (in Months)" md={8} fieldId="periodOverdue">
          <Input type="number" placeholder="Months" />
        </FormField>
        <FormField
          label="Preliminary Classification Objective Criteria (OC)"
          md={12}
          fieldId="prelimClassOC"
        >
          <Input placeholder="OC" />
        </FormField>
        <FormField label="Qualitative Judgment (QJ)" md={12} fieldId="qualitativeJudgment">
          <Input placeholder="QJ" />
        </FormField>
        <FormField label="Final Classification Status" md={12} fieldId="finalClassStatus">
          <Select
            placeholder="Select Status"
            options={[
              { label: "Standard", value: "standard" },
              { label: "Substandard", value: "substandard" },
              { label: "Doubtful", value: "doubtful" },
              { label: "Bad/Loss", value: "bad_loss" },
            ]}
          />
        </FormField>
        <FormField label="Basis for Classification (OC/QJ)" md={12} fieldId="basisClassification">
          <Select
            placeholder="Select Basis"
            options={[
              { label: "OC - Objective Criteria", value: "oc" },
              { label: "QJ - Qualitative Judgment", value: "qj" },
            ]}
          />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 6: Provision
  const ProvisionTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Outstanding Amount-Interest Suspense-Value of eligible Collateral"
          md={12}
          fieldId="outstandingAmt"
        >
          <Input placeholder="Details" />
        </FormField>
        <FormField label="SS_Base for Provision" md={12} fieldId="ssBaseProvision">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="DF_Base for Provision" md={12} fieldId="dfBaseProvision">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="B/L_Base for Provision" md={12} fieldId="blBaseProvision">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Amount of Provision Required" md={12} fieldId="provisionRequired">
          <Input type="number" placeholder="Amount" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 7: BB Sector
  const BBSectorTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="BB Category As per CL Statement" md={12} fieldId="bbCategory">
          <Input placeholder="Category" />
        </FormField>
        <FormField label="Sector Code As per SBS" md={12} fieldId="sectorCode">
          <Input placeholder="Sector Code" />
        </FormField>
        <FormField label="Sector Name As per SBS" md={12} fieldId="sectorName">
          <Input placeholder="Sector Name" />
        </FormField>
        <FormField label="Product Code as per SBS" md={12} fieldId="productCodeSBS">
          <Input placeholder="Product Code" />
        </FormField>
        <FormField label="SME Code as per SBS" md={12} fieldId="smeCode">
          <Input placeholder="SME Code" />
        </FormField>
        <FormField label="Sector As per CL" md={12} fieldId="sectorCL">
          <Input placeholder="Sector" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 8: Rating
  const RatingTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="ECAI Rating Agency" md={12} fieldId="ecaiRatingAgency">
          <Input placeholder="Agency Name" />
        </FormField>
        <FormField label="ECAI Rating Long Term" md={12} fieldId="ecaiRatingLT">
          <Input placeholder="Rating" />
        </FormField>
        <FormField label="ECAI Rating Short Term" md={12} fieldId="ecaiRatingST">
          <Input placeholder="Rating" />
        </FormField>
        <FormField label="ECAI Rating Validity" md={12} fieldId="ecaiRatingValidity">
          <Input placeholder="DD/MM/YY" />
        </FormField>
        <FormField label="First ICRRS rating" md={12} fieldId="firstICRRSRating">
          <Input placeholder="Rating" />
        </FormField>
        <FormField label="Latest ICRRS rating" md={12} fieldId="latestICRRSRating">
          <Input placeholder="Rating" />
        </FormField>
        <FormField label="Latest ICRRS rating Validity" md={12} fieldId="latestICRRSValidity">
          <Input placeholder="DD/MM/YY" />
        </FormField>
        <FormField label="Latest ICRRS Total Score" md={12} fieldId="icrrsScore">
          <Input type="number" placeholder="Score" />
        </FormField>
        <FormField label="Net Operating Income" md={12} fieldId="netOpIncome">
          <Input type="number" placeholder="Amount" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 9: Company Balance Sheet
  const CompanyBalanceSheetTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Total Debt Service (Principal and Interest due)"
          md={12}
          fieldId="totalDebtService"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Net Profit (after tax)" md={12} fieldId="netProfit">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Net Sales" md={12} fieldId="netSales">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Cost of Goods Sold (COGS)" md={12} fieldId="cogs">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Average Inventory" md={12} fieldId="avgInventory">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Net Credit Sales" md={12} fieldId="netCreditSales">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Average Account Receivable" md={12} fieldId="avgAcctReceivable">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Net Credit Purchase" md={12} fieldId="netCreditPurchase">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Average Account Payable" md={12} fieldId="avgAcctPayable">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Average Total Assets" md={12} fieldId="avgTotalAssets">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Shareholders' Equity" md={12} fieldId="shareholdersEquity">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Long-Term Debt" md={12} fieldId="longTermDebt">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Current Assets" md={12} fieldId="currentAssets">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Current Liabilities" md={12} fieldId="currentLiabilities">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Inventory" md={12} fieldId="inventory">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Cash" md={12} fieldId="cash">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Total Assets" md={12} fieldId="totalAssets">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="EBITDA" md={12} fieldId="ebitda">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Debt equity ratio" md={12} fieldId="debtEquityRatio">
          <Input type="number" placeholder="Ratio" step="0.01" />
        </FormField>
        <FormField label="Financial Date" md={12} fieldId="financialDate">
          <Input placeholder="DD/MM/YY" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 10: Others
  const OthersTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="Remarks (CIB Status etc.)" md={24} xs={24} fieldId="remarks">
          <Input.TextArea placeholder="Remarks" rows={1} />
        </FormField>
        <FormField label="Grace Period/Moratorium Period (in Months)" md={12} fieldId="gracePeriod">
          <Input type="number" placeholder="Months" />
        </FormField>
        <FormField label="CL-Remarks" md={12} fieldId="clRemarks">
          <Input.TextArea placeholder="CL Remarks" rows={1} />
        </FormField>
        <FormField label="Loan belongs to" md={12} fieldId="loanCategory">
          <Select
            placeholder="Select Category"
            options={[
              { label: "Individual", value: "individual" },
              { label: "Small Business", value: "small_business" },
              { label: "Medium Business", value: "medium_business" },
              { label: "Corporate", value: "corporate" },
            ]}
          />
        </FormField>
      </Row>
    </Form>
  );

  const tabItems = [
    {
      key: "1",
      label: "Loan Account/Contract",
      children: <LoanAccountTab />,
    },
    {
      key: "2",
      label: "Sanction",
      children: <SanctionTab />,
    },
    {
      key: "3",
      label: "Limit & Disbursement",
      children: <LimitDisbursementTab />,
    },
    {
      key: "4",
      label: "Due & Payment",
      children: <DuePaymentTab />,
    },
    {
      key: "5",
      label: "CL Status",
      children: <CLStatusTab />,
    },
    {
      key: "6",
      label: "Provision",
      children: <ProvisionTab />,
    },
    {
      key: "7",
      label: "BB Sector",
      children: <BBSectorTab />,
    },
    {
      key: "8",
      label: "Rating",
      children: <RatingTab />,
    },
    {
      key: "9",
      label: "Company Balance Sheet",
      children: <CompanyBalanceSheetTab />,
    },
    {
      key: "10",
      label: "Others",
      children: <OthersTab />,
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      <HeaderInfo />

      {/* Tabs Section */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        styles={{ body: { padding: "0px 12px" }, header: { fontSize: "18px", fontWeight: "bold" } }}
        title={"Contact Details"}
        extra={
          <>
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                type={isEditing ? "primary" : "default"}
                icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                onClick={isEditing ? handleSave : handleEditToggle}
              >
                {isEditing ? "Save Changes" : "Edit"}
              </Button>
              {isEditing && <Button onClick={handleEditToggle}>Cancel</Button>}
            </div>
          </>
        }
      >
        <Tabs
          items={tabItems}
          tabBarStyle={{
            borderBottom: "2px solid #f0f0f0",
            marginBottom: "24px",
            fontWeight: "700",
          }}
          tabBarGutter={20}
        />
      </Card>
    </div>
  );
};

export default ContractDetails;