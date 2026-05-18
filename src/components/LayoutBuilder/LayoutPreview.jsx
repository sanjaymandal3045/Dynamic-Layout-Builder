import React, { useState } from "react";
import { Button, message, Tabs, Badge } from "antd";
import { ArrowLeft } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";
import { useApi } from "../../utilities/axiosApiCall";

const getResponsiveGridTemplate = (columns) => {
  const minWidths = { 1: "100%", 2: "360px", 3: "280px", 4: "220px" };
  const minW = minWidths[columns] ?? "180px";
  return `repeat(auto-fit, minmax(min(${minW}, 100%), 1fr))`;
};

const LayoutPreview = ({
  config,
  onBack,
  formValues,
  onValueChange,
  hideBackButton = false,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const apiHandler = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableRefreshTriggers, setTableRefreshTriggers] = useState({});
  // External table data — populated by button/filter API responses
  // Map of { [tableName]: arrayData }
  const [externalTableData, setExternalTableData] = useState({});
  // Master-detail view state — null = search/list view, object = detail view
  const [detailView, setDetailView] = useState(null); // { config, formValues }

  // ── Deep-search a field anywhere in a nested response object ────────────────
  const searchFieldInResponse = (obj, fieldName) => {
    if (!obj || typeof obj !== "object") return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, fieldName))
      return obj[fieldName];
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const r = searchFieldInResponse(item, fieldName);
        if (r !== undefined) return r;
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const r = searchFieldInResponse(obj[key], fieldName);
          if (r !== undefined) return r;
        }
      }
    }
    return undefined;
  };

  // ── Resolve a dot-notation path on an object (e.g. "data.attributes.data") ──
  const resolvePath = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  // ── Row select handler (column-mapping based, same-tab) ───────────────────────
  const handleTableRowAction = (tableComponent, rowData) => {
    if (tableComponent.rowActions?.showSelect) {
      const mappedValues = {};
      let hasMapping = false;

      (tableComponent.columns || []).forEach((column) => {
        if (column.name) {
          const rowValue = rowData[column.dataIndex];
          if (rowValue !== undefined) {
            mappedValues[column.name] = rowValue;
            hasMapping = true;
          }
        }
      });

      if (!hasMapping) {
        messageApi.warning(
          "No field mappings configured for this table. Please configure column mappings in the table settings.",
        );
        return;
      }

      Object.entries(mappedValues).forEach(([fieldName, fieldValue]) => {
        onValueChange(fieldName, fieldValue);
      });
    }
  };

  // ── View Details handler (API-based, cross-tab field population) ────────────
  const handleViewDetails = async (tableComponent, rowData) => {
    const ra = tableComponent.rowActions;
    if (!ra?.showViewDetails || !ra?.viewDetailsApi?.url) {
      messageApi.warning("View Details API is not configured for this table.");
      return;
    }

    const { url, subChannelId, subServiceId } = ra.viewDetailsApi;
    if (!subChannelId || !subServiceId) {
      messageApi.error("View Details API configuration is incomplete.");
      return;
    }

    const hideLoading = messageApi.loading("Loading details...", 0);
    try {
      const result = await apiHandler.post(url, {
        subChannelId,
        subServiceId,
        attributes: { ...rowData },
      });
      console.log("ViewDetails Response:", result);
      hideLoading();

      if (result) {
        const mappings = ra.viewDetailsFieldMappings || [];
        let populated = 0;
        const resolvedValues = {};

        mappings.forEach((mapping) => {
          if (!mapping.apiResponseField || !mapping.targetFieldName) return;
          // Deep search the entire JSON payload instead of an explicit path
          const val = searchFieldInResponse(result, mapping.apiResponseField);
          if (val !== undefined && val !== null) {
            resolvedValues[mapping.targetFieldName] = val;
            populated++;
          }
        });

        // Auto-resolve Header Cards without needing explicit mappings
        if (ra.viewDetailsConfig?.headerCards) {
          ra.viewDetailsConfig.headerCards.forEach((card) => {
            if (card.fieldName) {
              const val = searchFieldInResponse(result, card.fieldName);
              if (val !== undefined && val !== null) {
                resolvedValues[card.fieldName] = val;
              }
            }
          });
        }

        // Auto-resolve all form fields in the details view config
        if (ra.viewDetailsConfig?.tabs) {
          ra.viewDetailsConfig.tabs.forEach((tab) => {
            tab.sections?.forEach((section) => {
              section.components?.forEach((comp) => {
                if (comp.name) {
                  const val = searchFieldInResponse(result, comp.name);
                  if (val !== undefined && val !== null) {
                    resolvedValues[comp.name] = val;
                  }
                }
              });
            });
          });
        }

        // If the table has a detail config, switch to detail view
        if (ra.viewDetailsConfig?.tabs?.length > 0) {
          // Merge resolved values with current formValues for the detail view
          const detailFormValues = { ...formValues, ...resolvedValues };
          setDetailView({
            config: ra.viewDetailsConfig,
            formValues: detailFormValues,
          });
        } else {
          // Fallback: populate fields in-place (original behavior)
          Object.entries(resolvedValues).forEach(([k, v]) =>
            onValueChange(k, v),
          );
          if (populated > 0) {
            messageApi.success(
              `${populated} field${populated > 1 ? "s" : ""} populated from details.`,
            );
          } else {
            messageApi.info("Details loaded but no field mappings matched.");
          }
        }
      }
    } catch (err) {
      hideLoading();
      console.error("View Details API error:", err);
      messageApi.error("Failed to load details. Please try again.");
    }
  };

  // ── Button click handler ─────────────────────────────────────────────────────
  const handleAction = (section, buttonComponent) => {
    const sectionFieldNames = section.components
      .filter(
        (comp) =>
          comp.type === "field" ||
          comp.type === "select" ||
          comp.type === "checkbox" ||
          comp.type === "upload",
      )
      .map((comp) => comp.name);

    if (buttonComponent.onClick === "reset") {
      sectionFieldNames.forEach((name) => {
        const comp = section.components.find((c) => c.name === name);
        if (comp?.type === "checkbox") {
          // Reset to the configured unchecked default, not undefined
          const resetVal =
            comp.checkboxMode === "multiple"
              ? []
              : (comp.uncheckedValue ?? "N");
          onValueChange(name, resetVal);
        } else {
          onValueChange(name, undefined);
        }
      });
      messageApi.success(`Cleared fields in ${section.name || "section"}`);
      return;
    }

    if (
      buttonComponent.onClick === "submit" ||
      buttonComponent.viewDetailsConfig
    ) {
      const payload = {};
      let hasMissingRequired = false;
      let validationErrorMsg = null;

      sectionFieldNames.forEach((name) => {
        const component = section.components.find((c) => c.name === name);
        let val = formValues[name];

        // Checkboxes that have never been interacted with will have
        // val === undefined. JSON.stringify silently drops undefined keys,
        // so we must substitute the configured default before building the payload.
        if (
          component?.type === "checkbox" &&
          (val === undefined || val === null)
        ) {
          val =
            component.checkboxMode === "multiple"
              ? []
              : (component.uncheckedValue ?? "N");
        }

        if (
          component?.required &&
          (val === undefined || val === null || val === "")
        ) {
          hasMissingRequired = true;
        }

        // Validate number limits
        if (
          component?.type === "field" &&
          component?.fieldType === "number" &&
          val !== undefined &&
          val !== null &&
          val !== ""
        ) {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            let effectiveMin = component.min;
            if (component.onlyPositive) {
              effectiveMin = Math.max(component.min || 0, 0);
            }

            if (
              effectiveMin !== undefined &&
              effectiveMin !== null &&
              numVal < effectiveMin
            ) {
              if (!validationErrorMsg) {
                validationErrorMsg = `${component.label || name} cannot be less than ${effectiveMin}.`;
              }
            }

            if (
              component.max !== undefined &&
              component.max !== null &&
              numVal > component.max
            ) {
              if (!validationErrorMsg) {
                validationErrorMsg = `${component.label || name} cannot be greater than ${component.max}.`;
              }
            }
          }
        }

        payload[name] = val;
      });

      if (!buttonComponent.skipValidation && hasMissingRequired) {
        messageApi.error("Please fill in all required fields in this section.");
        return;
      }

      if (!buttonComponent.skipValidation && validationErrorMsg) {
        messageApi.error(validationErrorMsg);
        return;
      }

      if (buttonComponent.api && buttonComponent.api.url) {
        executeApiCall(buttonComponent, payload);
      } else if (buttonComponent.viewDetailsConfig) {
        setDetailView({
          config: buttonComponent.viewDetailsConfig,
          formValues: { ...formValues, ...payload },
        });
      }
    }
  };

  // ── API call executor ────────────────────────────────────────────────────────
  const executeApiCall = async (buttonComponent, attributesPayload) => {
    const apiConfig = buttonComponent.api;
    const apiCommon = buttonComponent.apiCommon;

    if (!apiConfig?.url) {
      messageApi.warning("No API URL configured for this button.");
      console.log("Payload:", attributesPayload);
      return;
    }

    if (!apiCommon?.subChannelId || !apiCommon?.subServiceId) {
      messageApi.error(
        "API configuration is incomplete. Please configure all required fields.",
      );
      return;
    }

    setIsSubmitting(true);
    const hideLoading = messageApi.loading("Processing request...", 0);

    try {
      const method = (apiConfig.method || "post").toLowerCase();
      const url = apiConfig.url;
      const finalPayload = {
        subChannelId: apiCommon.subChannelId,
        subServiceId: apiCommon.subServiceId,
        attributes: attributesPayload,
      };

      let result;
      switch (method) {
        case "get":
          result = await apiHandler.get(url, finalPayload);
          break;
        case "post":
          result = await apiHandler.post(url, finalPayload);
          break;
        case "put":
          result = await apiHandler.put(url, finalPayload);
          break;
        case "patch":
          result = await apiHandler.patch(url, finalPayload);
          break;
        case "delete":
          result = await apiHandler.del(url, finalPayload);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      hideLoading();

      if (result) {
        messageApi.success(
          apiConfig.successMessage || "Action completed successfully!",
        );

        if (buttonComponent.name) {
          const tablesToRefresh = [];
          const tablesToPopulate = [];
          config?.tabs?.forEach((tab) => {
            tab.sections?.forEach((section) => {
              section.components
                ?.filter((c) => c.type === "table")
                .forEach((table) => {
                  // Mode 1: triggerButtonName — re-fetch the table's own API
                  if (table.triggerButtonName === buttonComponent.name) {
                    tablesToRefresh.push(table);
                  }
                  // Mode 2: dataSourceButtonName — push response data into table
                  if (table.dataSourceButtonName === buttonComponent.name) {
                    tablesToPopulate.push(table);
                  }
                });
            });
          });

          // Refresh self-fetching tables
          if (tablesToRefresh.length > 0) {
            tablesToRefresh.forEach((table) => {
              setTableRefreshTriggers((prev) => ({
                ...prev,
                [table.name]: Date.now(),
              }));
            });
            messageApi.info(`Refreshing ${tablesToRefresh.length} table(s)...`);
          }

          // Populate externally-bound tables with response data
          if (tablesToPopulate.length > 0) {
            tablesToPopulate.forEach((table) => {
              const path = table.dataResponsePath || "data.attributes.data";
              const extracted = resolvePath(result, path);
              setExternalTableData((prev) => ({
                ...prev,
                [table.name]: Array.isArray(extracted) ? extracted : [],
              }));
            });
          }
        }

        // ── Apply response field mappings to form inputs ──────────────────
        if (buttonComponent.fieldMappings?.length > 0) {
          let populated = 0;
          buttonComponent.fieldMappings.forEach((mapping) => {
            if (!mapping.apiResponseField || !mapping.targetFieldName) return;
            const val = searchFieldInResponse(result, mapping.apiResponseField);
            if (val !== undefined && val !== null) {
              onValueChange(mapping.targetFieldName, val);
              populated++;
            }
          });
          if (populated > 0) {
            messageApi.success(
              `${populated} field${populated > 1 ? "s" : ""} populated from response.`,
            );
          }
        }

        if (buttonComponent.viewDetailsConfig) {
          const resolvedObj = {};

          if (buttonComponent.viewDetailsConfig.headerCards) {
            buttonComponent.viewDetailsConfig.headerCards.forEach((card) => {
              if (card.fieldName) {
                const val = searchFieldInResponse(result, card.fieldName);
                if (val !== undefined && val !== null)
                  resolvedObj[card.fieldName] = val;
              }
            });
          }

          // Auto-resolve all form fields in the details view config
          if (buttonComponent.viewDetailsConfig.tabs) {
            buttonComponent.viewDetailsConfig.tabs.forEach((tab) => {
              tab.sections?.forEach((section) => {
                section.components?.forEach((comp) => {
                  if (comp.name) {
                    const val = searchFieldInResponse(result, comp.name);
                    if (val !== undefined && val !== null) {
                      resolvedObj[comp.name] = val;
                    }
                  }
                });
              });
            });
          }

          setDetailView({
            config: buttonComponent.viewDetailsConfig,
            formValues: { ...formValues, ...attributesPayload, ...resolvedObj },
          });
        }

        if (apiConfig.resetFormOnSuccess) {
          Object.keys(attributesPayload).forEach((key) =>
            onValueChange(key, undefined),
          );
        }

        if (apiConfig.onSuccess) apiConfig.onSuccess(result);
        return result;
      } else {
        messageApi.error(apiConfig.errorMessage || "Failed to execute action.");
      }
    } catch (err) {
      hideLoading();
      console.error("API call error:", err);
      messageApi.error(
        apiConfig.errorMessage || "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filter search handler (called by FilterSearchPanel) ──────────────────
  // Reuses executeApiCall with the criteria attributes from the filter panel.
  const handleFilterSearch = (section, buttonComponent, filterAttributes) => {
    if (!buttonComponent.api?.url) {
      console.warn(
        "[FilterSearch] Button has no API URL configured.",
        buttonComponent.name,
      );
      return;
    }
    // Forward to the existing API executor with the filter attributes as payload
    executeApiCall(buttonComponent, filterAttributes);
  };

  if (!config || !config.tabs || !Array.isArray(config.tabs)) {
    return <>{contextHolder}</>;
  }

  // ── Detail view (master-detail navigation) ───────────────────────────────────
  if (detailView) {
    return (
      <>
        {contextHolder}
        <style>{`
          @keyframes slideInFromRight { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
          .lp-detail-enter { animation: slideInFromRight 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        `}</style>
        <div style={{ padding: "20px" }} className="lp-detail-enter">
          <button
            onClick={() => setDetailView(null)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              // marginBottom: 18,
              padding: "7px 16px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(15,23,42,0.07)",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <LayoutPreview
            config={detailView.config}
            formValues={detailView.formValues}
            onValueChange={(name, val) =>
              setDetailView((prev) => ({
                ...prev,
                formValues: { ...prev.formValues, [name]: val },
              }))
            }
            hideBackButton
          />
        </div>
      </>
    );
  }

  // ── Section renderer ─────────────────────────────────────────────────────────
  const renderSection = (section) => (
    <div key={section.id} style={sectionCard}>
      {/* Section header */}
      <div style={sectionHeaderBar}>
        <div style={sectionAccent} />
        <h3 style={sectionTitle}>{section.name}</h3>
      </div>

      {/* Components */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${section.layout.gutter ?? 12}px`,
          padding: "12px 10px 12px 10px",
          backgroundColor: "#f7fbff",
        }}
      >
        {section.components.map((c, index) => {
          // ── Buttons — grouped and centred ──────────────────────────────────
          if (c.type === "button") {
            const prev = index > 0 ? section.components[index - 1] : null;
            if (!prev || prev.type !== "button") {
              const group = [];
              for (let i = index; i < section.components.length; i++) {
                if (section.components[i].type !== "button") break;
                group.push(section.components[i]);
              }
              if (group[0].id === c.id) {
                return (
                  <div
                    key={`btn-group-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: `${section.layout.gutter ?? 12}px`,
                      paddingTop: 8,
                    }}
                  >
                    {group.map((btnComp) => (
                      <ComponentRenderer
                        key={btnComp.id}
                        component={btnComp}
                        value={formValues[btnComp.name]}
                        onValueChange={onValueChange}
                        onBtnClick={() => handleAction(section, btnComp)}
                        onFilterSearch={(attrs) =>
                          handleFilterSearch(section, btnComp, attrs)
                        }
                        onRowAction={handleTableRowAction}
                        onViewDetails={handleViewDetails}
                        externalData={externalTableData[btnComp.name]}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                );
              }
            }
            return null;
          }

          // ── Full-width singletons ─────────────────────────────────────────
          if (
            c.type === "divider" ||
            c.type === "table" ||
            c.type === "newline"
          ) {
            return (
              <div
                key={c.id || c.name || `singleton-${c.type}-${index}`}
                style={{ width: "100%" }}
              >
                <ComponentRenderer
                  component={c}
                  value={formValues[c.name]}
                  onValueChange={onValueChange}
                  onBtnClick={() => handleAction(section, c)}
                  onFilterSearch={(attrs) =>
                    handleFilterSearch(section, c, attrs)
                  }
                  onRowAction={handleTableRowAction}
                  onViewDetails={handleViewDetails}
                  externalData={externalTableData[c.name]}
                  refreshTrigger={tableRefreshTriggers[c.name]}
                  disabled={isSubmitting}
                />
              </div>
            );
          }

          // ── Responsive grid group ─────────────────────────────────────────
          if (
            c.type !== "divider" &&
            c.type !== "table" &&
            c.type !== "newline" &&
            c.type !== "button"
          ) {
            const prev = index > 0 ? section.components[index - 1] : null;
            const isNewGroup =
              !prev ||
              prev.type === "divider" ||
              prev.type === "table" ||
              prev.type === "newline" ||
              prev.type === "button";

            if (isNewGroup) {
              const group = [];
              for (let i = index; i < section.components.length; i++) {
                const comp = section.components[i];
                if (
                  comp.type === "divider" ||
                  comp.type === "table" ||
                  comp.type === "newline" ||
                  comp.type === "button"
                )
                  break;
                group.push(comp);
              }

              if (group[0].id === c.id) {
                return (
                  <div
                    key={`grid-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: getResponsiveGridTemplate(
                        section.layout.columns,
                      ),
                      gap: `${section.layout.gutter ?? 12}px`,
                    }}
                  >
                    {group.map((gridComp) => (
                      <ComponentRenderer
                        key={gridComp.id}
                        component={gridComp}
                        value={formValues[gridComp.name]}
                        onValueChange={onValueChange}
                        onBtnClick={() => handleAction(section, gridComp)}
                        onFilterSearch={(attrs) =>
                          handleFilterSearch(section, gridComp, attrs)
                        }
                        onRowAction={handleTableRowAction}
                        onViewDetails={handleViewDetails}
                        externalData={externalTableData[gridComp.name]}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                );
              }
            }
          }

          return null;
        })}
      </div>
    </div>
  );

  // ── Tab items ────────────────────────────────────────────────────────────────
  const tabItems = config.tabs.map((tab) => ({
    key: tab.id.toString(),
    label: tab.title,
    children: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "4px 2px",
        }}
      >
        {tab.sections.map(renderSection)}
      </div>
    ),
  }));

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <>
      {contextHolder}

      {/* Scoped CSS for smooth Ant Design tab bar */}
      <style>{`
        .lp-page-header { padding: 20px 24px 0; }
        .lp-tabs .ant-tabs-nav { padding: 0 24px; background: #cae6ff30; }
        .lp-tabs .ant-tabs-tab { font-weight: 500; font-size: 13.5px; padding: 12px 4px; }
        .lp-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #0d9488 !important; }
        .lp-tabs .ant-tabs-ink-bar { background: #0d9488; border-radius: 2px; }
        .lp-tabs .ant-tabs-content-holder { padding: 16px 20px 20px; }
      `}</style>

      <div style={pageWrap}>
        {/* Back button */}
        {!hideBackButton && (
          <Button
            onClick={onBack}
            icon={<ArrowLeft size={14} />}
            disabled={isSubmitting}
            style={backBtn}
          >
            Back to Editor
          </Button>
        )}

        {/* Page title */}
        {config.title && (
          <div style={pageTitleWrap}>
            <h1 style={pageTitleStyle}>{config.title}</h1>
            {config.description && (
              <p style={pageDescStyle}>{config.description}</p>
            )}
          </div>
        )}

        {/* Header Cards (Optional) */}
        {config.headerCards && config.headerCards.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
                gap: "12px",
                width: "100%",
              }}
            >
              {config.headerCards.map((card, idx) => {
                const val = formValues[card.fieldName];
                return (
                  <div
                    key={idx}
                    className="rounded-2xl p-[2px] bg-gradient-to-br from-green-200 via-cyan-500 to-blue-500 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="rounded-[14px] bg-white p-3 h-full flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                        {card.label}
                      </div>
                      <div className="text-[15px] font-bold text-slate-800 mt-[2px] truncate">
                        {val !== undefined && val !== null && val !== ""
                          ? String(val)
                          : "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab container */}

        <div style={tabContainer}>
          {config.tabs.length === 1 && (!config.tabs[0].title || config.tabs[0].title.trim() === "") ? (
            <div style={{ padding: "16px 20px 20px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  padding: "4px 2px",
                }}
              >
                {config.tabs[0].sections.map(renderSection)}
              </div>
            </div>
          ) : (
            <Tabs
              items={tabItems}
              type="line"
              className="lp-tabs"
              disabled={isSubmitting}
              tabBarStyle={{ marginBottom: 0 }}
            />
          )}
        </div>
      </div>
    </>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const pageWrap = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minHeight: "100%",
};

const backBtn = {
  alignSelf: "flex-start",
  height: 36,
  paddingInline: 16,
  borderRadius: 8,
  borderColor: "#e2e8f0",
  color: "#64748b",
  fontWeight: 500,
};

const pageTitleWrap = {
  paddingBottom: "4px",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const pageDescStyle = {
  margin: "6px 0 0",
  fontSize: "14px",
  color: "#64748b",
  lineHeight: 1.6,
};

const tabContainer = {
  background: "#fff",
  borderRadius: "14px",
  border: "1px solid #e8edf2",
  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.06)",
  overflow: "hidden",
};

// Section
const sectionCard = {
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #eef0f6",
  boxShadow: "0 1px 6px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
  // padding: "0 0 18px",
};

const sectionHeaderBar = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 18px",
  borderBottom: "1px solid #f1f5f9",
  background:
    "linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(216 227 249) 75%)",
  // marginBottom: "12px",
};

const sectionAccent = {
  width: "3px",
  height: "18px",
  borderRadius: "3px",
  background: "linear-gradient(180deg, #6366f1, #0d9488)",
  flexShrink: 0,
};

const sectionTitle = {
  margin: 0,
  fontSize: "13.5px",
  fontWeight: 700,
  color: "#1e293b",
  letterSpacing: "0.01em",
  flex: 1,
};

export default LayoutPreview;
