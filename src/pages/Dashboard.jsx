// Global Import
import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useSelector } from "react-redux";

// Local Import
import AppShell from "../layouts/AppShell";
import { useApi } from "../services/axiosClient";
import { buildMenuTree } from "../utils/common";
import LayoutBuilder from "../components/LayoutBuilder/LayoutBuilder";
import DynamicPageLoader from "../components/DynamicPageLoader";
import ContractSearch from "./ContractSearch";
import HomePage from "./HomePage";
import ModelRun from "./ModelRun";

const Dashboard = () => {
  const [selectedKey, setSelectedKey] = useState("model-run");
  const [menuItems, setMenuItems] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const getMenuListApi = useApi();

  const userName = useSelector((state) => state.auth.fullName);

  // ── Fetch dynamic menu ─────────────────────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getMenuListApi.post("/transaction/execute", {
          subChannelId: "2",
          subServiceId: "7",
          attributes: {},
        });

        if (res?.data) {
          const dynamicMenu = buildMenuTree(res.data.attributes.menuTree);
          setMenuItems(dynamicMenu);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        messageApi.error("Failed to load menu");
      }
    };

    fetchMenu();
  }, []);

  // ── Page content resolver ──────────────────────────────────
  const renderContent = () => {
    if (selectedKey === "home") {
      return <HomePage userName={userName} onNavigate={setSelectedKey} />;
    }
    if (selectedKey === "layout-builder") {
      return <LayoutBuilder />;
    }
    if (selectedKey === "contract-search") {
      return <ContractSearch />;
    }
    if (selectedKey === "model-run") {
      return <ModelRun />;
    }
    return <DynamicPageLoader pageKey={selectedKey} />;
  };

  return (
    <>
      {contextHolder}
      <AppShell
        selectedKey={selectedKey}
        onSelectKey={setSelectedKey}
        menuItems={menuItems}
        menuLoading={getMenuListApi.loading}
      >
        {renderContent()}
      </AppShell>
    </>
  );
};

export default Dashboard;
