import React, { useState } from "react";
import { Button, message, Tabs } from "antd";
import { ArrowLeft } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";
import { useApi } from "../../utilities/axiosApiCall";

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

  /**
   * Handles row selection from a table component
   * Maps table row data to form fields based on column configuration
   */
  const handleTableRowAction = (tableComponent, rowData) => {
    if (tableComponent.rowActions?.showSelect) {
      // Map each column's dataIndex to the form field name
      const mappedValues = {};
      let hasMapping = false;

      (tableComponent.columns || []).forEach((column) => {
        // Only map if the column has a linked form field name
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
          "No field mappings configured for this table. Please configure column mappings in the table settings."
        );
        return;
      }

      // Update form values with row data
      Object.entries(mappedValues).forEach(([fieldName, fieldValue]) => {
        onValueChange(fieldName, fieldValue);
      });

      // messageApi.success(
      //   `Populated ${Object.keys(mappedValues).length} field(s) with selected row data`
      // );
    }
  };

  const handleAction = (section, buttonComponent) => {
    const sectionFieldNames = section.components
      .filter((comp) => comp.type === "field" || comp.type === "select")
      .map((comp) => comp.name);

    if (buttonComponent.onClick === "reset") {
      sectionFieldNames.forEach((name) => {
        onValueChange(name, undefined);
      });
      messageApi.success(`Cleared fields in ${section.name || "section"}`);
      return;
    }

    if (buttonComponent.onClick === "submit") {
      const payload = {};
      let hasMissingRequired = false;

      sectionFieldNames.forEach((name) => {
        const component = section.components.find((c) => c.name === name);
        const val = formValues[name];

        if (
          component?.required &&
          (val === undefined || val === null || val === "")
        ) {
          hasMissingRequired = true;
        }
        payload[name] = val;
      });

      if (hasMissingRequired) {
        messageApi.error("Please fill in all required fields in this section.");
        return;
      }

      executeApiCall(buttonComponent, payload);
    }
  };

  const executeApiCall = async (buttonComponent, attributesPayload) => {
    const apiConfig = buttonComponent.api;
    const apiCommon = buttonComponent.apiCommon;

    if (!apiConfig?.url) {
      messageApi.warning("No API URL configured for this button.");
      console.log("Payload:", attributesPayload);
      return;
    }

    if (!apiCommon?.subChannelId || !apiCommon?.subServiceId || !apiCommon?.traceNo) {
      messageApi.error("API configuration is incomplete. Please configure all required fields.");
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
        traceNo: apiCommon.traceNo,
        attributes: attributesPayload,
      };

      console.log(`Calling ${method.toUpperCase()} ${url}`, finalPayload);

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
          apiConfig.successMessage || "Action completed successfully!"
        );

        if (apiConfig.resetFormOnSuccess) {
          Object.keys(attributesPayload).forEach((key) => {
            onValueChange(key, undefined);
          });
        }

        if (apiConfig.onSuccess) {
          apiConfig.onSuccess(result);
        }

        return result;
      } else {
        const errorMsg =
          apiConfig.errorMessage || "Failed to execute action.";
        messageApi.error(errorMsg);
      }
    } catch (err) {
      hideLoading();
      console.error("API call error:", err);
      messageApi.error(
        apiConfig.errorMessage || "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config || !config.tabs || !Array.isArray(config.tabs)) {
    return (
      <>
        {contextHolder}
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Configuration Found</h2>
            <p className="text-slate-500">Please check back later or contact support.</p>
          </div>
        </div>
      </>
    );
  }

  const tabItems = config.tabs.map((tab) => ({
    key: tab.id.toString(),
    label: tab.title,
    children: (
      <div className="p-6">
        {tab.sections.map((section) => (
          <div
            key={section.id}
            className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
              {section.name}
            </h3>

            <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: `${section.layout.gutter}px` }}>
              {section.components.map((c, index) => {
                // Render divider, table, and newline full-width
                if (c.type === "divider" || c.type === "table" || c.type === "newline") {
                  return (
                    <div key={c.id} className="w-full">
                      <ComponentRenderer
                        component={c}
                        value={formValues[c.name]}
                        onValueChange={onValueChange}
                        onBtnClick={() => handleAction(section, c)}
                        onRowAction={(tableComp, rowData) =>
                          handleTableRowAction(tableComp, rowData)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  );
                }
                
                // Group consecutive non-full-width components
                if (c.type !== "divider" && c.type !== "table" && c.type !== "newline") {
                  // Check if this is the start of a new grid group
                  const prevComponent = index > 0 ? section.components[index - 1] : null;
                  const isNewGridGroup = !prevComponent || prevComponent.type === "divider" || prevComponent.type === "table" || prevComponent.type === "newline";
                  
                  if (isNewGridGroup) {
                    // Collect all consecutive non-full-width components from this point
                    const gridComponents = [];
                    for (let i = index; i < section.components.length; i++) {
                      const comp = section.components[i];
                      if (comp.type === "divider" || comp.type === "table" || comp.type === "newline") {
                        break;
                      }
                      gridComponents.push(comp);
                    }
                    
                    // Only render on the first component of the group
                    if (gridComponents[0].id === c.id) {
                      return (
                        <div
                          key={`grid-${index}`}
                          className="grid w-full"
                          style={{
                            gridTemplateColumns: `repeat(${section.layout.columns}, 1fr)`,
                            gap: `${section.layout.gutter}px`,
                          }}
                        >
                          {gridComponents.map((gridComp) => (
                            <div key={gridComp.id}>
                              <ComponentRenderer
                                component={gridComp}
                                value={formValues[gridComp.name]}
                                onValueChange={onValueChange}
                                onBtnClick={() => handleAction(section, gridComp)}
                                onRowAction={(tableComp, rowData) =>
                                  handleTableRowAction(tableComp, rowData)
                                }
                                disabled={isSubmitting}
                              />
                            </div>
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
        ))}
      </div>
    ),
  }));

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
        {!hideBackButton && (
          <Button
            onClick={onBack}
            icon={<ArrowLeft size={14} />}
            disabled={isSubmitting}
            className="mb-6 h-10 px-5 shadow-sm border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-500"
          >
            Back to Editor
          </Button>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            {config.title}
          </h1>
          {config.description && (
            <p className="text-slate-500 text-lg">{config.description}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden px-4">
          <Tabs
            items={tabItems}
            type="line"
            className="px-6 py-6 pt-4"
            disabled={isSubmitting}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
      </div>
    </>
  );
};

export default LayoutPreview;