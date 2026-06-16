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
import { useFieldPermissions } from "../utils/userFieldPermissions";
import { useApi } from "../services/axiosClient";

const ContractDetails = ({ contract }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(true);
  const [permissions, setPermissions] = useState({});
  const fetchPermissionsApi = useApi();

  useEffect(() => {
    console.log("contract", contract);
  }, [contract]);

  // Initialize permissions hook
  const {
    getFieldPermission,
    isFieldVisible,
    isFieldEditable,
    getMaskedValue,
    renderWithPermission,
  } = useFieldPermissions(permissions);

  // Fetch permissions when edit is clicked
  const handleEditClick = async () => {
    try {
      const menuParams = {
        subChannelId: "2",
        subServiceId: "15",
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
      // {
      //   label: "CONTACT NO",
      //   value: contract.contractNo ?? contract.P_CUSTOMER_ID,
      //   fieldId: "contactNo",
      // },
      {
        label: "BRANCH CODE",
        value: contract.branchNo,
        fieldId: "branchCode",
      },
      {
        label: "BORROWER NAME",
        value: contract.borrowerName,
        fieldId: "borrowerName",
      },
      {
        label: "PRODUCT CODE",
        value: contract.productCode,
        fieldId: "productCode",
      },
      {
        label: "LOAN ID NO",
        value: contract.loanIdNo,
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
  const FormField = ({
    label,
    children,
    xs = 24,
    sm = 12,
    md = 8,
    lg = 4,
    fieldId,
  }) => {
    // If fieldId is provided and not visible, don't render
    if (fieldId && !isFieldVisible(fieldId)) {
      return null;
    }

    const { canWrite } = getFieldPermission(fieldId);
    const isDisabled = fieldId && !canWrite;

    // Clone children to apply disabled state if needed
    const enhancedChildren =
      fieldId && isDisabled
        ? React.cloneElement(children, { disabled: true })
        : children;

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
        <FormField label="Br. Code" md={6} fieldId="branchNo">
          <Input placeholder="Br. Code" defaultValue={contract.branchNo} />
        </FormField>
        <FormField label="Br. Name" md={6} fieldId="branchName">
          <Input placeholder="Br. Name" defaultValue={contract.branchName} />
        </FormField>
        <FormField label="Parent Br. Code" md={6} fieldId="parentBranchCode">
          <Input
            placeholder="Parent Br. Code"
            defaultValue={contract.parentBranchCode}
          />
        </FormField>
        <FormField label="Loan Description" md={8} fieldId="loanDescription">
          <Input.TextArea
            placeholder="Loan Description"
            rows={1}
            defaultValue={contract.loanDescription}
          />
        </FormField>
        <FormField
          label="Product Code"
          md={8}
          fieldId="productCode"
          defaultValue={contract.productCode}
        >
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
        <FormField
          label="Customer's Unique ID"
          md={8}
          fieldId="customerUniqueId"
        >
          <Input
            placeholder="Customer's Unique ID"
            defaultValue={contract.customerUniqueId}
          />
        </FormField>
        <FormField label="Amount Disbursed" md={8} fieldId="amountDisbursed">
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.amountDisbursed}
          />
        </FormField>
        <FormField
          label="Balance Outstanding"
          md={8}
          fieldId="totalOutstanding"
          defaultValue={contract.totalOutstanding}
        >
          <Input
            type="number"
            placeholder="Balance Outstanding"
            defaultValue={contract.balanceOutstanding}
          />
        </FormField>
        <FormField label="Interest Rate" md={8} fieldId="rateOfInterest">
          <Input
            type="number"
            placeholder="Interest Rate %"
            defaultValue={contract.rateOfInterest}
          />
        </FormField>
        <FormField
          label="Business Identification Number (BIN)/TIN"
          md={8}
          fieldId="tinBin"
        >
          <Input placeholder="BIN/TIN" defaultValue={contract.tinBin} />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 2: Sanction
  const SanctionTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Nature of Sanction"
          md={12}
          fieldId="natureOfSanction"
        >
          <Input
            placeholder="Nature of Sanction"
            defaultValue={contract.natureOfSanction}
          />
        </FormField>
        <FormField
          label="Nature of Facilities"
          md={12}
          fieldId="natureOfFacilities"
        >
          <Input
            placeholder="Nature of Facilities"
            defaultValue={contract.natureOfFacilities}
          />
        </FormField>
        <FormField
          label="Date of First Sanction"
          md={8}
          fieldId="dateOfFirstSanction"
        >
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.dateOfFirstSanction}
          />
        </FormField>
        <FormField
          label="Date of Sanction Reschedule"
          md={8}
          fieldId="dateOfSanctionReschedule"
        >
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.dateOfSanctionReschedule}
          />
        </FormField>
        <FormField label="Date Of Renewal" md={8} fieldId="dateOfRenewal">
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.dateOfRenewal}
          />
        </FormField>
        <FormField label="Date of Expiry" md={8} fieldId="maturityDate">
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.maturityDate}
          />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 3: Limit & Disbursement
  const LimitDisbursementTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Latest Sanctioned Limit"
          md={8}
          fieldId="latestSanctionLimit"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.latestSanctionLimit}
          />
        </FormField>
        <FormField
          label="Date Of First Disbursement"
          md={8}
          fieldId="firstDisbursementDate"
        >
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.firstDisbursementDate}
          />
        </FormField>
        <FormField
          label="1st Disbursement Amount"
          md={12}
          fieldId="firstDisbursement"
        >
          <Input type="number" placeholder="Amount" />
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
          fieldId="dueSinceSanctionAmt"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.dueSinceSanctionAmt}
          />
        </FormField>
        <FormField
          label="Amount Paid Since Sanctioning/Last Rescheduling/Restructuring"
          md={12}
          fieldId="paidSinceSanctionAmt"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.paidSinceSanctionAmt}
          />
        </FormField>
        <FormField label="Overdue Amount" md={12} fieldId="OverdueAmount">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Defaulted Outstanding"
          md={12}
          fieldId="defaultedOutstanding"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.defaultedOutstanding}
          />
        </FormField>
        <FormField
          label="Historical Recovery Data (Year wise)"
          md={8}
          fieldId="HistoricalData"
        >
          <Input placeholder="Year" defaultValue={""} />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 5: Installment Tab
  const InstallmentTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Date Of First Installment"
          md={8}
          fieldId="dueDateOfFirstInstallment"
        >
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.dueDateOfFirstInstallment}
          />
        </FormField>
        <FormField label="Installment Size" md={12} fieldId="installmentSize">
          <Input
            type="number"
            placeholder="installmentSize"
            defaultValue={contract.installmentSize}
          />
        </FormField>
        <FormField
          label="Installment Frequency"
          md={12}
          fieldId="installmentFrequency"
        >
          <Input
            placeholder="installmentFrequency"
            defaultValue={contract.installmentFrequency}
          />
        </FormField>
        <FormField
          label="Due date of Last Installment"
          md={8}
          fieldId="lastInstDueDate"
        >
          <Input
            placeholder="DD/MM/YYYY"
            defaultValue={contract.lastInstDueDate}
          />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 6: CL Status
  const CLStatusTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Time Equivalent of Amount Overdue (in months)"
          md={8}
          fieldId="timeEquivalOdAmt"
        >
          <Input
            type="number"
            placeholder="Months"
            defaultValue={contract.timeEquivalOdAmt}
          />
        </FormField>
        <FormField
          label="Time after expiry (if any) (in months)"
          md={8}
          fieldId="timeAfterExpiry"
        >
          <Input
            type="number"
            placeholder="Months"
            defaultValue={contract.timeAfterExpiry}
          />
        </FormField>
        <FormField
          label="Period of Overdue/Past Due (in Months)"
          md={8}
          fieldId="periodOfArears"
        >
          <Input placeholder="Months" defaultValue={contract.periodOfArears} />
        </FormField>
        <FormField
          label="Preliminary Classification Objective Criteria (OC)"
          md={12}
          fieldId="preliminaryStatusOfClOb"
        >
          <Input
            placeholder="OC"
            defaultValue={contract.preliminaryStatusOfClOb}
          />
        </FormField>
        <FormField
          label="Qualitative Judgment (QJ)"
          md={12}
          fieldId="preliminaryStatusOfClQj"
        >
          <Input
            placeholder="QJ"
            defaultValue={contract.preliminaryStatusOfClQj}
          />
        </FormField>
        <FormField
          label="Final Classification Status"
          md={12}
          fieldId="finalClStatus"
        >
          <Input
            placeholder="finalClStatus"
            defaultValue={contract.finalClStatus}
          />
        </FormField>
        <FormField
          label="Basis for Classification (OC/QJ)"
          md={12}
          fieldId="finalClStatusBasisForCl"
        >
          <Input
            placeholder="finalClStatusBasisForCl"
            defaultValue={contract.finalClStatusBasisForCl}
          />
        </FormField>
      </Row>
    </Form>
  );

  //Tab 7: Interest Suspense
  const InterestSuspenseTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Manual Interest suspense"
          md={12}
          fieldId="manualSuspenseAmt"
        >
          <Input placeholder="QJ" defaultValue={contract.manualSuspenseAmt} />
        </FormField>
        <FormField
          label="Automated Interest suspense "
          md={12}
          fieldId="autoIntSuspenseAmount"
        >
          <Input
            placeholder="QJ"
            type="number"
            defaultValue={contract.autoIntSuspenseAmount}
          />
        </FormField>
        <FormField
          label="Total Interest Suspense"
          md={12}
          fieldId="totalSuspense"
        >
          <Input
            placeholder="QJ"
            type="number"
            defaultValue={contract.totalSuspense}
          />
        </FormField>
      </Row>
    </Form>
  );
  //Tab 8: Collateral Security
  const CollateralSecurityTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField label="Collateral Type" md={12} fieldId="collateralType">
          <Input
            placeholder="QJ"
            type="number"
            defaultValue={contract.collateralType}
          />
        </FormField>
        <FormField
          label="Value of Eligible Collateral "
          md={12}
          fieldId="valueOfEligibleSecurity"
        >
          <Input
            placeholder="QJ"
            type="number"
            defaultValue={contract.valueOfEligibleSecurity}
          />
        </FormField>
      </Row>
    </Form>
  );
  // Tab 9: Provision
  const ProvisionTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Outstanding Amount-Interest Suspense-Value of eligible Collateral"
          md={12}
          fieldId="osIntCollat"
        >
          <Input placeholder="Details" defaultValue={contract.osIntCollat} />
        </FormField>
        <FormField
          label="SS_Base for Provision"
          md={12}
          fieldId="ssBaseProvision"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.ssBaseProvision}
          />
        </FormField>
        <FormField
          label="DF_Base for Provision"
          md={12}
          fieldId="dfBaseProvision"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.dfBaseProvision}
          />
        </FormField>
        <FormField
          label="B/L_Base for Provision"
          md={12}
          fieldId="blBaseProvision"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.blBaseProvision}
          />
        </FormField>
        <FormField
          label="Amount of Provision Required"
          md={12}
          fieldId="reqProvisionAmt"
        >
          <Input
            type="number"
            placeholder="Amount"
            defaultValue={contract.reqProvisionAmt}
          />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 10: BB Sector
  const BBSectorTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="BB Category As per CL Statement"
          md={12}
          fieldId="loanBbCategory"
        >
          <Input placeholder="loanBbCategory" />
        </FormField>
        <FormField label="Sector Code As per SBS" md={12} fieldId="sectorCode">
          <Input placeholder="Sector Code" defaultValue={contract.sectorCode} />
        </FormField>
        <FormField label="Sector Name As per SBS" md={12} fieldId="sectorName">
          <Input placeholder="Sector Name" defaultValue={contract.sectorName} />
        </FormField>
        <FormField
          label="Product Code as per SBS"
          md={12}
          fieldId="sbsProductCode"
        >
          <Input
            placeholder="Product Code"
            defaultValue={contract.sbsProductCode}
          />
        </FormField>
        <FormField label="SME Code as per SBS" md={12} fieldId="smeCode">
          <Input placeholder="SME Code" defaultValue={contract.smeCode} />
        </FormField>
        <FormField label="Sector As per CL" md={12} fieldId="sectorCL">
          <Input placeholder="Sector" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 11: Rating
  const RatingTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="ECAI Rating Agency"
          md={12}
          fieldId="ecaiRatingAgency"
        >
          <Input placeholder="Agency Name" />
        </FormField>
        <FormField label="ECAI Rating Long Term" md={12} fieldId="ecaiRatingLT">
          <Input placeholder="Rating" />
        </FormField>
        <FormField
          label="ECAI Rating Short Term"
          md={12}
          fieldId="ecaiRatingST"
        >
          <Input placeholder="Rating" />
        </FormField>
        <FormField
          label="ECAI Rating Validity"
          md={12}
          fieldId="ecaiRatingValidity"
        >
          <Input placeholder="DD/MM/YYYY" />
        </FormField>
        <FormField
          label="First ICRRS rating"
          md={12}
          fieldId="firstICRRSRating"
        >
          <Input placeholder="Rating" />
        </FormField>
        <FormField
          label="Latest ICRRS rating"
          md={12}
          fieldId="latestICRRSRating"
        >
          <Input placeholder="Rating" />
        </FormField>
        <FormField
          label="Latest ICRRS rating Validity"
          md={12}
          fieldId="latestICRRSValidity"
        >
          <Input placeholder="DD/MM/YYYY" />
        </FormField>
        <FormField
          label="Latest ICRRS Total Score"
          md={12}
          fieldId="icrrsScore"
        >
          <Input type="number" placeholder="Score" />
        </FormField>
        <FormField label="Net Operating Income" md={12} fieldId="netOpIncome">
          <Input type="number" placeholder="Amount" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 12: Company Balance Sheet
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
        <FormField
          label="Average Account Receivable"
          md={12}
          fieldId="avgAcctReceivable"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Net Credit Purchase"
          md={12}
          fieldId="netCreditPurchase"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Average Account Payable"
          md={12}
          fieldId="avgAcctPayable"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Average Total Assets"
          md={12}
          fieldId="avgTotalAssets"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Shareholders' Equity"
          md={12}
          fieldId="shareholdersEquity"
        >
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Long-Term Debt" md={12} fieldId="longTermDebt">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField label="Current Assets" md={12} fieldId="currentAssets">
          <Input type="number" placeholder="Amount" />
        </FormField>
        <FormField
          label="Current Liabilities"
          md={12}
          fieldId="currentLiabilities"
        >
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
          <Input placeholder="DD/MM/YYYY" />
        </FormField>
      </Row>
    </Form>
  );

  // Tab 13: Others
  const OthersTab = () => (
    <Form form={form} layout="vertical" disabled={!isEditing}>
      <Row gutter={[8, 8]}>
        <FormField
          label="Remarks (CIB Status etc.)"
          md={24}
          xs={24}
          fieldId="remarks"
        >
          <Input.TextArea placeholder="Remarks" rows={1} />
        </FormField>
        <FormField
          label="Grace Period/Moratorium Period (in Months)"
          md={12}
          fieldId="gracePeriod"
        >
          <Input type="number" placeholder="Months" />
        </FormField>
        <FormField label="CL-Remarks" md={12} fieldId="clRemarks">
          <Input.TextArea placeholder="CL Remarks" rows={1} />
        </FormField>
        <FormField label="Loan belongs to" md={12} fieldId="loanCategory">
          <Input
            placeholder="loanCategory"
            defaultValue={contract.loanCategory}
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
      label: "Installment",
      children: <InstallmentTab />,
    },
    {
      key: "6",
      label: "CL Status",
      children: <CLStatusTab />,
    },
    {
      key: "7",
      label: "Interest Suspense",
      children: <InterestSuspenseTab />,
    },
    {
      key: "8",
      label: "Collateral Security",
      children: <CollateralSecurityTab />,
    },
    {
      key: "9",
      label: "Provision",
      children: <ProvisionTab />,
    },
    {
      key: "10",
      label: "BB Sector",
      children: <BBSectorTab />,
    },
    {
      key: "11",
      label: "Rating",
      children: <RatingTab />,
    },
    {
      key: "12",
      label: "Company Balance Sheet",
      children: <CompanyBalanceSheetTab />,
    },
    {
      key: "13",
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
        styles={{
          body: { padding: "0px 12px" },
          header: { fontSize: "18px", fontWeight: "bold" },
        }}
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
