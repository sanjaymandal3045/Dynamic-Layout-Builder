// Application-wide constants

import {
  ProjectOutlined,
  BankOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Menu } from "lucide-react";


// Date Format Constants
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_DISPLAY_FORMAT = "MMM DD, YYYY";
export const DATE_RANGE_FORMAT = "YYYY-MM-DD";

// Date Range Defaults
export const DEFAULT_DATE_RANGE_SINGLE = -1; // days from today
export const DEFAULT_DATE_RANGE_START = -7; // days from today
export const DEFAULT_DATE_RANGE_END = 0; // today

// Color Palette
export const COLORS = {
  // CBS Deposit Colors
  CASA: "#1976d2",      // Blue
  TD: "#f57c00",        // Orange
  RD: "#14b8a6",        // Teal
  SND: "#8b5cf6",       // Purple

  // Status Colors
  UP: "#10b981",        // Green (positive trend)
  DOWN: "#ef4444",      // Red (negative trend)
  NEUTRAL: "#6b7280",   // Gray (no change)

  // UI Colors
  PRIMARY: "#2563eb",
  SECONDARY: "#64748b",
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
};


// Chart Configuration
export const CHART_CONFIG = {
  PIE_CHART: {
    INNER_RADIUS: 40,
    OUTER_RADIUS: 80,
    PADDING_ANGLE: 2,
  },
  LINE_CHART: {
    STROKE_WIDTH: 2,
    DOT_RADIUS: 4,
    ACTIVE_DOT_RADIUS: 6,
    HISTORICAL_DAYS_RANGE: 30,
  },
};

// API Endpoints (if needed)
export const API_ENDPOINTS = {
  // Add your API endpoints here
  // e.g., LOGIN: "/api/auth/login",
  // e.g., CBS_DEPOSIT: "/api/cbs/deposit",
};

// Menu Items Configuration
export const MENU_KEYS = {
  OVERVIEW: "overview",
  CBS: "cbs",
  CBS_REPORT: "cbs-report",
  COD_REPORT: "cod-report",
};

// Pagination & Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ["10", "20", "50", "100"],
};

// Currency & Number Formatting
export const CURRENCY_CONFIG = {
  CURRENCY: "BDT",
  CURRENCY_SYMBOL: "৳",
  DECIMAL_PLACES: 1,
  UNIT: "mBDT", // Million BDT
};

// User Role Constants
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

// Notification Messages
export const MESSAGES = {
  SUCCESS: "Operation completed successfully",
  ERROR: "An error occurred. Please try again.",
  WARNING: "Please be careful with this action.",
  INFO: "Information message",
  NO_DATA: "No data available",
  LOADING: "Loading...",
};

export const menuConfig = [
  {
    key: "layout-builder",
    icon: <ProjectOutlined />,
    label: "Layout Builder",
  },
  {
    key: "cbs",
    icon: <BankOutlined />,
    label: "CBS",
    children: [
      {
        key: "menu-creation",
        icon: <Menu size={16}/>,
        label: "menu Creation",
      },
      {
        key: "cbs-report",
        icon: <WalletOutlined />,
        label: "CRM Report",
      },
      {
        key: "cod-report",
        icon: <WalletOutlined />,
        label: "COD Report",
      },
    ],
  },
];



// -------------- Dynamic Layout Constants ----------------

export const COMPONENT_TYPES = {
  SECTION: "section",
  FIELD: "field",
  TEXT: "text",
  BUTTON: "button",
  DIVIDER: "divider",
  SPACER: "spacer",
  // CARD: "card",
  NEWLINE: "newline",
  SELECT: "select",
  TABLE: "table",
};

export const FIELD_TYPES = [
  "text",
  "number",
  "date",
  "checkbox",
  "textarea",
  "email",
  "password",
];

export const BUTTON_VARIANTS = [
  "primary",
  "default",
  "dashed",
  "text",
  "link",
];
