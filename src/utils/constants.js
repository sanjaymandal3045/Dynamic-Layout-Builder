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

// Pagination & Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ["10", "20", "50", "100"],
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
  CHECKBOX: "checkbox",
  UPLOAD: "upload",
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

export const BUTTON_VARIANTS = ["primary", "default", "dashed", "text", "link"];
