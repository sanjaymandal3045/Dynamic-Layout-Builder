import React, { useEffect, useState } from "react";
import { Card, DatePicker, Segmented, Space, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const DateRangePicker = ({
  onDateChange,
  defaultType = "single",
  isSingleOnly = false,
}) => {
  const [datePickerType, setDatePickerType] = useState(
    isSingleOnly ? "single" : defaultType
  );

  const [baseDate, setBaseDate] = useState(dayjs().subtract(1, "day"));
  const [comparisonDate, setComparisonDate] = useState(
    dayjs().subtract(2, "day")
  );

  useEffect(() => {
    if (onDateChange) {
      const output =
        datePickerType === "single" ? [baseDate] : [baseDate, comparisonDate];
      onDateChange(output);
    }
  }, [baseDate, comparisonDate, datePickerType, onDateChange]);

  const handleTypeChange = (value) => {
    setDatePickerType(value === "Single Date" ? "single" : "compare");
  };

  return (
    <Card
      className="h-full border-0 shadow-lg rounded-2xl"
      bodyStyle={{ padding: "0px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // marginBottom: "16px",
          padding: "10px 20px",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          {/* {!isSingleOnly && ( */}
          <Text
            type="secondary"
            style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563" }}
          >
            AS ON DATE
          </Text>
          {/* )} */}
        </div>

        {/* RIGHT SIDE: Labels and Pickers */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Base Date Picker Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Text
              type="secondary"
              style={{ fontSize: "12px", fontWeight: 600, color: "#4b5563" }}
            >
              {datePickerType === "single" ? "" : ""}
            </Text>
            <DatePicker
              value={baseDate}
              onChange={(date) => date && setBaseDate(date)}
              format="YYYY-MM-DD"
              allowClear={false}
              style={{ width: "140px" }}
            />
          </div>

          {/* Comparison Date Picker Group */}
          {datePickerType === "compare" && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#4b5563",
                  }}
                >
                  COMPARE TO
                </Text>
                <DatePicker
                  value={comparisonDate}
                  onChange={(date) => date && setComparisonDate(date)}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  style={{ width: "140px" }}
                />
              </div>
            </>
          )}
          {!isSingleOnly && (
            <Segmented
              options={["Single Date", "Comparison"]}
              value={datePickerType === "single" ? "Single Date" : "Comparison"}
              onChange={handleTypeChange}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default DateRangePicker;
