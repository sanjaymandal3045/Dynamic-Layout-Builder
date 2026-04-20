import React from "react";
import { Typography, Tag } from "antd";
import {
  AppstoreOutlined,
  SearchOutlined,
  LayoutOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  BankOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// ── Quick action tiles ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    key: "layout-builder",
    icon: <LayoutOutlined style={{ fontSize: 26 }} />,
    title: "Layout Builder",
    description: "Design and configure dynamic screen layouts visually.",
    color: "#6366f1",
    bg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    tag: "Builder",
    tagColor: "purple",
  },
  {
    key: "contract-search",
    icon: <SearchOutlined style={{ fontSize: 26 }} />,
    title: "Contract Search",
    description: "Search and manage loan contracts and account records.",
    color: "#0891b2",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    tag: "Contracts",
    tagColor: "cyan",
  },
  {
    key: "reports",
    icon: <FileTextOutlined style={{ fontSize: 26 }} />,
    title: "Reports",
    description: "Generate and review CL, BB Sector, and provision reports.",
    color: "#059669",
    bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    tag: "Analytics",
    tagColor: "green",
  },
  {
    key: "admin",
    icon: <SafetyCertificateOutlined style={{ fontSize: 26 }} />,
    title: "Administration",
    description: "Manage users, roles, permissions and system configuration.",
    color: "#d97706",
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    tag: "Admin",
    tagColor: "gold",
  },
];

// ── Stats bar ──────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Contacts", value: "—", icon: <FileTextOutlined /> },
  { label: "Reports", value: "—", icon: <ClockCircleOutlined /> },
  { label: "Total Branches", value: "—", icon: <BankOutlined /> },
  { label: "Menu Modules", value: "—", icon: <AppstoreOutlined /> },
];

const HomePage = ({ userName, onNavigate }) => {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div style={pageWrap}>
      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div style={bannerStyle}>
        <div style={bannerLeft}>
          <Text style={greetingText}>
            {greeting},{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>
              {userName || "User"}
            </span>{" "}
            👋
          </Text>
          <Title level={2} style={bannerTitle}>
            Welcome to RBS Portal
          </Title>
          <Text style={bannerSub}>
            Dutch-Bangla Bank Limited ·
          </Text>
        </div>
        <div style={bannerRight}>
          <div style={orbOuter} />
          <div style={orbInner} />
          <BankOutlined style={bankIcon} />
        </div>

        <style>{`
          @keyframes floatOrb {
            0%   { transform: scale(1) translate(0, 0); }
            50%  { transform: scale(1.06) translate(-6px, -8px); }
            100% { transform: scale(1) translate(0, 0); }
          }
          @keyframes pulseIcon {
            0%, 100% { opacity: 0.18; }
            50%       { opacity: 0.28; }
          }
          .quick-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
          }
          .quick-card:hover .arrow-icon {
            transform: translateX(4px);
            opacity: 1 !important;
          }
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
          }
        `}</style>
      </div>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <div style={statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} style={statCard} className="stat-card">
            <span style={statIcon}>{s.icon}</span>
            <div>
              <div style={statValue}>{s.value}</div>
              <div style={statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div style={sectionHeader}>
        <Title level={4} style={{ margin: 0, color: "#1e293b" }}>
          Quick Access
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Jump straight into the module you need
        </Text>
      </div>

      <div style={actionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.key}
            style={{ ...actionCard, background: action.bg }}
            className="quick-card"
            onClick={() => onNavigate?.(action.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onNavigate?.(action.key)}
          >
            {/* Icon */}
            <div style={{ ...actionIconWrap, color: action.color }}>
              {action.icon}
            </div>

            {/* Text */}
            <div style={actionText}>
              <div style={actionTitleRow}>
                <span style={{ ...actionTitle, color: action.color }}>
                  {action.title}
                </span>
                <Tag color={action.tagColor} style={{ margin: 0, fontSize: 11 }}>
                  {action.tag}
                </Tag>
              </div>
              <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                {action.description}
              </Text>
            </div>

            {/* Arrow */}
            <ArrowRightOutlined
              className="arrow-icon"
              style={{
                color: action.color,
                fontSize: 16,
                opacity: 0.4,
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Footer note ─────────────────────────────────────── */}
      <div style={footerNote}>
        <SafetyCertificateOutlined style={{ color: "#94a3b8", fontSize: 14 }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          All activity is logged and monitored.
        </Text>
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const pageWrap = {
  padding: "24px 28px 32px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  minHeight: "100%",
};

// Banner
const bannerStyle = {
  borderRadius: "16px",
  background: "linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)",
  padding: "36px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(13, 148, 136, 0.25)",
};

const bannerLeft = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  zIndex: 1,
};

const greetingText = {
  color: "rgba(255,255,255,0.75)",
  fontSize: "15px",
  fontWeight: 500,
};

const bannerTitle = {
  margin: 0,
  color: "#fff",
  fontSize: "28px",
  fontWeight: 800,
  lineHeight: 1.2,
};

const bannerSub = {
  color: "rgba(255,255,255,0.6)",
  fontSize: "13px",
  marginTop: "4px",
};

const bannerRight = {
  position: "relative",
  width: 120,
  height: 120,
  flexShrink: 0,
};

const orbOuter = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.06)",
  animation: "floatOrb 6s ease-in-out infinite",
};

const orbInner = {
  position: "absolute",
  inset: 20,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.06)",
  animation: "floatOrb 6s ease-in-out infinite 1s",
};

const bankIcon = {
  position: "absolute",
  inset: 0,
  margin: "auto",
  fontSize: 52,
  color: "#fff",
  animation: "pulseIcon 4s ease-in-out infinite",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// Stats
const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
};

const statCard = {
  background: "#fff",
  borderRadius: "12px",
  padding: "18px 20px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
  transition: "all 0.2s ease",
  cursor: "default",
};

const statIcon = {
  fontSize: 22,
  color: "#0d9488",
  background: "rgba(13, 148, 136, 0.08)",
  borderRadius: "10px",
  padding: "10px",
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const statValue = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#1e293b",
  lineHeight: 1.2,
};

const statLabel = {
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: 500,
  marginTop: 2,
};

// Section header
const sectionHeader = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  paddingBottom: "4px",
  borderBottom: "1px solid #f1f5f9",
};

// Quick action cards
const actionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "14px",
};

const actionCard = {
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  cursor: "pointer",
  transition: "all 0.22s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid rgba(255,255,255,0.8)",
  userSelect: "none",
  outline: "none",
};

const actionIconWrap = {
  flexShrink: 0,
  width: 52,
  height: 52,
  borderRadius: "12px",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const actionText = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  minWidth: 0,
};

const actionTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const actionTitle = {
  fontSize: "15px",
  fontWeight: 700,
};

// Footer note
const footerNote = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  paddingTop: "8px",
  marginTop: "auto",
};

export default HomePage;
