import React, { useState, useCallback } from "react";
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
  const [tableRefreshTriggers, setTableRefreshTriggers] = useState({});

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

    if (
      !apiCommon?.subChannelId ||
      !apiCommon?.subServiceId ||
      !apiCommon?.traceNo
    ) {
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
          apiConfig.successMessage || "Action completed successfully!",
        );
        
        // ✅ Trigger table refresh using triggerButtonName
        if (buttonComponent.name) {
          const tablesToRefresh = [];
          config?.tabs?.forEach((tab) => {
            tab.sections?.forEach((section) => {
              section.components
                ?.filter(
                  (c) =>
                    c.type === "table" &&
                    c.triggerButtonName === buttonComponent.name,
                )
                .forEach((table) => {
                  tablesToRefresh.push(table);
                });
            });
          });

          if (tablesToRefresh.length > 0) {
            tablesToRefresh.forEach((table) => {
              setTableRefreshTriggers((prev) => ({
                ...prev,
                [table.name]: Date.now(),
              }));
            });

            messageApi.info(`Refreshing ${tablesToRefresh.length} table(s)...`);
          }
        }

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
        const errorMsg = apiConfig.errorMessage || "Failed to execute action.";
        messageApi.error(errorMsg);
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

  if (!config || !config.tabs || !Array.isArray(config.tabs)) {
    return (
      <>
        {contextHolder}
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No Configuration Found
            </h2>
            <p className="text-slate-500">
              Please check back later or contact support.
            </p>
          </div>
        </div>
      </>
    );
  }

  const tabItems = config.tabs.map((tab) => ({
    key: tab.id.toString(),
    label: tab.title,
    children: (
      <div className="p-2">
        {tab.sections.map((section) => (
          <div
            key={section.id}
            className="mb-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
              {section.name}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${section.layout.gutter}px`,
              }}
            >
              {section.components.map((c, index) => {
                if (c.type === "button") {
                  const prevComponent =
                    index > 0 ? section.components[index - 1] : null;
                  const isNewButtonGroup =
                    !prevComponent || prevComponent.type !== "button";

                  if (isNewButtonGroup) {
                    const buttonComponents = [];
                    for (let i = index; i < section.components.length; i++) {
                      const comp = section.components[i];
                      if (comp.type !== "button") {
                        break;
                      }
                      buttonComponents.push(comp);
                    }

                    if (buttonComponents[0].id === c.id) {
                      return (
                        <div
                          key={`button-group-${index}`}
                          className="w-full flex justify-center"
                          style={{ gap: `${section.layout.gutter}px` }}
                        >
                          {buttonComponents.map((btnComp) => (
                            <ComponentRenderer
                              key={btnComp.id}
                              component={btnComp}
                              value={formValues[btnComp.name]}
                              onValueChange={onValueChange}
                              onBtnClick={() => handleAction(section, btnComp)}
                              onRowAction={(tableComp, rowData) =>
                                handleTableRowAction(tableComp, rowData)
                              }
                              disabled={isSubmitting}
                            />
                          ))}
                        </div>
                      );
                    }
                  }

                  return null;
                }

                if (
                  c.type === "divider" ||
                  c.type === "table" ||
                  c.type === "newline"
                ) {
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
                        refreshTrigger={tableRefreshTriggers[c.name]}
                        disabled={isSubmitting}
                      />
                    </div>
                  );
                }

                if (
                  c.type !== "divider" &&
                  c.type !== "table" &&
                  c.type !== "newline" &&
                  c.type !== "button"
                ) {
                  const prevComponent =
                    index > 0 ? section.components[index - 1] : null;
                  const isNewGridGroup =
                    !prevComponent ||
                    prevComponent.type === "divider" ||
                    prevComponent.type === "table" ||
                    prevComponent.type === "newline" ||
                    prevComponent.type === "button";

                  if (isNewGridGroup) {
                    const gridComponents = [];
                    for (let i = index; i < section.components.length; i++) {
                      const comp = section.components[i];
                      if (
                        comp.type === "divider" ||
                        comp.type === "table" ||
                        comp.type === "newline" ||
                        comp.type === "button"
                      ) {
                        break;
                      }
                      gridComponents.push(comp);
                    }

                    if (gridComponents[0].id === c.id) {
                      return (
                        <div
                          key={`grid-${index}`}
                          style={{
                            display: "grid",
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
                                onBtnClick={() =>
                                  handleAction(section, gridComp)
                                }
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
      <div>
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

        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
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
            className=""
            disabled={isSubmitting}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
      </div>
    </>
  );
};

export default LayoutPreview;