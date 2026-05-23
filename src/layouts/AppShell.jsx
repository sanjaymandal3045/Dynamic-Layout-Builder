// Global Import
import React, { useRef, useState } from "react";
import {
  Typography,
  Button,
  Layout,
  Menu,
  Avatar,
  Space,
  Image,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

// Local Import
import { logoutUser } from "@/redux/slices/authSlice";
import { toggleTheme } from "@/redux/slices/themeSlice";
import dbblLogo from "@/assets/dbbl_logo.png";
import ConfigEditorModal from "../components/LayoutBuilder/ConfigEditorModal";

const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;

const SIDER_WIDTH = 300;
const SIDER_COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 64;

const AppShell = ({
  selectedKey,
  onSelectKey,
  menuItems = [],
  menuLoading = false,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [configEditorOpen, setConfigEditorOpen] = useState(false);

  const contentRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userName = useSelector((state) => state.auth.fullName);
  const themeMode = useSelector((state) => state.theme.mode);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const handleMenuClick = ({ key }) => {
    onSelectKey?.(key);
    // Smooth scroll content back to top on navigation
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Layout
        ref={contentRef}
        style={{ minHeight: "100vh", background: "var(--bg-app)" }}
      >
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme={themeMode === "dark" ? "dark" : "light"}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
            background: "var(--bg-sidebar)",
            zIndex: 100,
          }}
          breakpoint="lg"
          className="modern-sidebar"
          trigger={null}
        >
          {/* Logo area */}
          <div
            style={{
              height: HEADER_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid var(--border-color)",
              background: "var(--bg-sidebar)",
              overflow: "hidden",
              transition: "all 0.3s",
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
                <Title
                  level={5}
                  style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}
                >
                  RBS Portal
                </Title>
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

          {/* Menu or skeleton */}
          {menuLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "80%",
                width: "80%",
                textAlign: "center",
                padding: "20px 0",
                marginLeft: "10%",
              }}
            >
              <Skeleton
                active
                title={{ width: 100 }}
                paragraph={{ rows: 6, width: [180, 200, 180, 180, 200, 180] }}
              />
            </div>
          ) : (
            <Menu
              theme={themeMode === "dark" ? "dark" : "light"}
              selectedKeys={[selectedKey]}
              mode="inline"
              items={menuItems}
              onClick={handleMenuClick}
              style={{
                borderRight: 0,
                fontSize: 13.5,
                padding: "8px 0",
                background: "var(--bg-sidebar)",
              }}
              className="modern-menu"
            />
          )}
        </Sider>

        {/* ── Main Column ─────────────────────────────────────── */}
        <Layout
          style={{
            marginLeft: collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH,
            transition: "margin-left 0.2s",
          }}
        >
          {/* Header */}
          <Header
            style={{
              padding: "0 24px",
              background: "var(--bg-header)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "var(--shadow-sm)",
              height: HEADER_HEIGHT,
              position: "sticky",
              top: 0,
              zIndex: 99,
            }}
          >
            {/* Collapse toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((c) => !c)}
              style={{
                fontSize: 18,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
              }}
            />

            {/* Theme Toggle Button */}
            <Button
              type="text"
              onClick={handleToggleTheme}
              style={{
                marginLeft: "auto",
                marginRight: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--bg-hover)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                color: themeMode === "dark" ? "#fbbf24" : "#475569",
              }}
              className="theme-toggle-btn"
              icon={themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            />

            {/* Edit config shortcut */}
            <Button
              type="primary"
              onClick={() => setConfigEditorOpen(true)}
              style={{ marginRight: 16 }}
            >
              Edit Page Config
            </Button>

            {/* User info + logout */}
            <Space size={20}>
              <Space size={10}>
                <Avatar size={36} icon={<UserOutlined />} />
                <Text strong style={{ fontSize: 14, color: "var(--text-primary)" }}>
                  {userName || ""}
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

          {/* Content */}
          <Content
            style={{ margin: "0px 10px 10px 10px" }}
            className="content-wrapper"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedKey}
                variants={{
                  initial: { opacity: 0, x: -40 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: 40 },
                }}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{
                  marginTop: 10,
                  background: "var(--bg-card)",
                  borderRadius: 8,
                  boxShadow: "var(--shadow-sm)",
                  minHeight: 280,
                  border: "1px solid var(--border-color)",
                }}
                className="content-inner"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Content>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "var(--bg-footer)",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              DBBL Common Data Repository © {new Date().getFullYear()} • IT Development
              Division
            </Text>
          </div>
        </Layout>
      </Layout>

      <ConfigEditorModal
        open={configEditorOpen}
        onClose={() => setConfigEditorOpen(false)}
      />
    </>
  );
};

export default AppShell;
