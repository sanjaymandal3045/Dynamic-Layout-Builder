// GLOBAL IMPORT
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Typography, message, Checkbox, Spin } from "antd";
import {
  LockOutlined,
  UserOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const { Title, Text } = Typography;

// LOCAL IMPORT
import { loginUser } from "@/redux/slices/authSlice";
import { useApi } from "@/services/axiosClient";
import dbblLogo from "@/assets/dbbl_logo.png";

const Login = () => {
  // const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [connectionMessage, setConnectionMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const api = useApi();
  const connectionTestApi = useApi();

  useEffect(() => {
    setMounted(true);
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/rbs");
    }
  }, [isAuthenticated, navigate]);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    try {
      const response = await connectionTestApi.get("/admin/status");

      if (response && response.success && response.data?.statusCode === 200) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("error");
        const errorMsg = response?.message || "Server connection failed.";
        setConnectionMessage(errorMsg);
        // messageApi.error(errorMsg);
      }
    } catch (error) {
      setConnectionStatus("error");
      setConnectionMessage("Connection failed");
      // useApi already handles generic error notification
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // --- REAL API LOGIN LOGIC ---
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate form fields
      const values = await form.validateFields();
      console.log("Form values:", {
        employeeId: values.username,
        password: values.password,
      });

      // Make API call to login endpoint using useApi hook
      const response = await api.post("auth/login", {
        employeeId: values.username,
        password: values.password,
      });

      if (!response || !response.data) {
        messageApi.error("Error occurred while logging in.");
        setIsSubmitting(false);
        return;
      }

      // Extract data from response
      const {
        accessToken,
        refreshToken,
        employeeId,
        fullName,
        roles,
        tokenType,
      } = response.data;

      console.log("Login response data:", {
        accessToken: accessToken?.substring(0, 20) + "...",
        refreshToken: refreshToken?.substring(0, 20) + "...",
        employeeId,
        fullName,
        roles,
      });

      // Store tokens in localStorage BEFORE dispatching to Redux
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("employeeId", employeeId);
      localStorage.setItem("fullName", fullName || "");
      localStorage.setItem("roles", JSON.stringify(roles));

      // Verify tokens were stored
      const storedToken = localStorage.getItem("accessToken");
      console.log("Token stored in localStorage:", !!storedToken);

      // Dispatch login action to Redux with all user data
      dispatch(
        loginUser({
          employeeId,
          fullName,
          accessToken,
          refreshToken,
          roles,
          tokenType,
        }),
      );

      messageApi.success("Login successful! Redirecting...");

      // Navigate after a brief delay for smooth transition
      setTimeout(() => {
        navigate("/rbs");
        setIsSubmitting(false);
      }, 800);
    } catch (error) {
      // Error handling is done in the useApi hook
      console.error("Login error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen flex" style={{ background: "var(--bg-app)", transition: "background-color 0.3s ease" }}>
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-slate-900 to-slate-800 relative">
          {/* Subtle divider line */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-700/50"></div>

          <div className="relative z-10 flex flex-col justify-between p-12 py-16 w-full">
            <div className="flex-auto">
              {/* Logo and Title Section */}
              <div className="inline-flex items-center gap-3 mb-12">
                <img
                  src={dbblLogo}
                  alt="DBBL Logo"
                  className="h-14 w-auto bank-logo filter brightness-110"
                />
                <div>
                  <Title
                    level={3}
                    className="!mb-0 !text-white !text-xl font-bold"
                  >
                    Dutch Bangla Bank PLC.
                  </Title>
                </div>
              </div>

              <div className="mt-16">
                <Title
                  level={2}
                  className="!text-4xl !text-white !mb-4 !leading-tight font-bold"
                >
                  Common Data Repository
                </Title>
                <Text className="!text-slate-300 text-base block mb-8 leading-relaxed max-w-sm">
                  for ECL & RBS.
                </Text>
              </div>
            </div>

            {/* Footer/Copyright */}
            <div className="text-slate-500 text-xs pt-8 border-t border-slate-700/50">
              © {new Date().getFullYear()} Dutch-Bangla Bank PLC. All Rights
              Reserved.
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
          {/* Connection Status Indicator - Top Right */}
          <div
            className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {connectionTestApi.loading ? (
              <>
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 14, color: "#64748b" }}
                      spin
                    />
                  }
                />
                <Text className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Checking system...
                </Text>
              </>
            ) : connectionStatus === "connected" ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <Text className="text-xs text-emerald-600 font-semibold">
                  System Online
                </Text>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,111,0.5)]"></div>
                <Text className="text-xs text-rose-600 font-semibold">
                  {connectionMessage || "System Offline"}
                </Text>
              </>
            )}
          </div>

          <div className="w-full max-w-sm mt-8 lg:mt-0">
            {/* Mobile Logo & Title */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">DB</span>
                </div>
                <Title level={4} className="!mb-0 font-bold" style={{ color: "var(--text-primary)" }}>
                  RBS Portal
                </Title>
              </div>
            </div>

            {/* Login Card */}
            <div
              className="rounded-2xl shadow-lg p-8 lg:p-10 border"
              style={{
                background: "var(--bg-container)",
                borderColor: "var(--border-color)",
                boxShadow: "var(--shadow-lg)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="text-center mb-8">
                <div className="inline-block mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(13, 148, 136, 0.12)",
                      color: "#0d9488",
                    }}
                  >
                    <LockOutlined className="text-xl" />
                  </div>
                </div>
                <Title level={4} className="!mb-1 font-bold" style={{ color: "var(--text-primary)" }}>
                  Sign In
                </Title>
                <Text style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                  Enter your credentials to continue
                </Text>
              </div>

              <Form
                form={form}
                name="login"
                layout="vertical"
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  label={
                    <span className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>
                      Employee ID
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please enter your employee ID",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="Enter your employee ID"
                    className="rounded-lg h-11 text-base"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    onPressEnter={handleSubmit}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <span className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>
                      Password
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Enter your password"
                    className="rounded-lg h-11 text-base"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    onPressEnter={handleSubmit}
                  />
                </Form.Item>

                <div className="flex items-center justify-between mb-7">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Remember me
                    </Checkbox>
                  </Form.Item>
                  <a
                    href="#"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>

                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    block
                    icon={!isSubmitting && <ArrowRightOutlined />}
                    className="rounded-lg font-semibold h-11 text-base bg-teal-600 border-none hover:bg-teal-700 hover:shadow-lg transition-all duration-200"
                    iconPosition="end"
                    // disabled={
                    //   isSubmitting ||
                    //   connectionTestApi.loading ||
                    //   connectionStatus === "error"
                    // }
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </Form.Item>
              </Form>

              {/* Security Footer */}
              <div
                className="mt-7 pt-6 border-t"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div
                  className="flex items-center justify-center gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <SafetyOutlined className="text-teal-600 text-sm" />
                  <span>Your connection is secure and encrypted</span>
                </div>
              </div>
            </div>

            {/* Support Link */}
            <div className="text-center mt-6">
              <Text className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Having trouble?{" "}
                <a
                  href="#"
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact IT Support
                </a>
              </Text>
            </div>
          </div>
        </div>

        <style>{`
        .ant-input-affix-wrapper:hover, 
        .ant-input:hover, 
        .ant-input-password:hover {
          border-color: #14b8a6 !important;
        }

        .ant-input-affix-wrapper-focused, 
        .ant-input-focused,
        .ant-input-password-focused {
          border-color: #14b8a6 !important;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1) !important;
        }

        .ant-btn-primary {
          background: #0d9488 !important;
        }

        .ant-btn-primary:not(:disabled):hover {
          background: #0f766e !important;
        }

        .ant-checkbox-wrapper {
          color: var(--text-secondary) !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #14b8a6;
          border-color: #14b8a6;
        }

        .ant-input::placeholder {
          color: var(--text-muted) !important;
        }

        .ant-input:disabled {
          background-color: var(--bg-app) !important;
          color: var(--text-muted) !important;
          cursor: not-allowed;
        }

        .ant-input-password-input:disabled {
          background-color: var(--bg-app) !important;
          color: var(--text-muted) !important;
          cursor: not-allowed;
        }
        
        [data-theme='dark'] .ant-input-affix-wrapper {
          background-color: var(--bg-card) !important;
          border-color: var(--border-color) !important;
        }
        [data-theme='dark'] .ant-input {
          // background-color: transparent !important;
          color: var(--text-primary) !important;
        }
        [data-theme='dark'] .ant-input-password {
          background-color: var(--bg-card) !important;
          border-color: var(--border-color) !important;
        }
        [data-theme='dark'] .ant-input-password-input {
          // background-color: transparent !important;
        }
      `}</style>
      </div>
    </>
  );
};

export default Login;
