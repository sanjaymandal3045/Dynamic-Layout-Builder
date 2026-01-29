// Global Import
import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  Button,
  Layout,
  Menu,
  Avatar,
  Space,
  Image,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  BankOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;

// Local Import
import { logoutUser } from "@/redux/slices/authSlice";
import dbblLogo from "@/assets/dbbl_logo.png";
import LayoutBuilder from "../components/LayoutBuilder/LayoutBuilder";
import DynamicPageLoader from "../components/DynamicPageLoader";
import { useApi } from "../utilities/axiosApiCall";
import { buildMenuTree } from "../utilities/common";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("layout-builder");
  const [menuItems, setMenuItems] = useState([]);

  const contentRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const getMenuListApi = useApi();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const renderContent = () => {
    if (selectedKey === "layout-builder") {
      return <LayoutBuilder />;
    }

    return <DynamicPageLoader pageKey={selectedKey} />;
  };

  const menuParams = {
    subChannelId: "2",
    subServiceId: "7",
    traceNo: "1234567890",
    attributes: {},
  };
  const getMenuList = async () => {
    try {
      const res = await getMenuListApi.post("/transaction/execute", menuParams);
      console.log("res",res);
      if (res?.data){
        const dynamicMenu = buildMenuTree(res.data.attributes.menuTree);
        setMenuItems(dynamicMenu);
      }
      
    } catch (error) {
      console.error("Error fetching menu:", error);
      messageApi.error("Failed to load menu", error);
    }
  };

  useEffect(() => {
    getMenuList();
  }, []);

  return (
    <>
      {contextHolder}
      <style>{`
        .modern-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .modern-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modern-sidebar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .modern-sidebar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .modern-menu .ant-menu-item {
          border-radius: 6px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }
        .modern-menu .ant-menu-item:hover {
          background-color: #f3f4f6;
        }
        .modern-menu .ant-menu-item-selected {
          background-color: #eff6ff !important;
          color: #2563eb;
          font-weight: 500;
        }
        .modern-menu .ant-menu-submenu-title {
          border-radius: 6px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }
        .modern-menu .ant-menu-submenu-title:hover {
          background-color: #f3f4f6;
        }
      `}</style>

      <Layout
        ref={contentRef}
        style={{ minHeight: "100vh", background: "#f8f9fa" }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={260}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
            background: "#fff",
          }}
          breakpoint="lg"
          className="modern-sidebar"
          trigger={null}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            {!collapsed ? (
              <Space size={10}>
                <Image
                  className="bank-logo"
                  src={dbblLogo}
                  alt="DBBL Logo"
                  width={32}
                  height={32}
                  preview={false}
                />
                <div>
                  <Title
                    level={5}
                    style={{ margin: 0, fontSize: 15, fontWeight: 600 }}
                  >
                    RBS Portal
                  </Title>
                </div>
              </Space>
            ) : (
              <Image
                className="bank-logo"
                src={dbblLogo}
                alt="DBBL Logo"
                width={32}
                height={32}
                preview={false}
              />
            )}
          </div>
          <Menu
            theme="light"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => {
              setSelectedKey(key);
              if (contentRef.current) {
                contentRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
            style={{
              borderRight: 0,
              fontSize: 13.5,
              padding: "8px 0",
            }}
            className="modern-menu"
          />
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 80 : 260 }}>
          <Header
            style={{
              padding: "0 24px",
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              height: 64,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />

            <Space size={20}>
              <Space size={10}>
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  // src={profileImage}
                  // preview={false}
                />
                <Text strong style={{ fontSize: 14 }}>
                  User
                </Text>
              </Space>
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  fontSize: 14,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Logout
              </Button>
            </Space>
          </Header>

          <Content style={{ margin: "10px", minHeight: 280 }}>
            <div
              style={{
                padding: 4,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {renderContent()}
            </div>
          </Content>

          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#fff",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              DBBL RBS Portal © {new Date().getFullYear()} • IT Development
              Division
            </Text>
          </div>
        </Layout>
      </Layout>
    </>
  );
};

export default Dashboard;
