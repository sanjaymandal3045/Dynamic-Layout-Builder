// GLOBAL IMPORT
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  message,
  Checkbox,
  Divider,
} from "antd";
import {
  LockOutlined,
  UserOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const { Title, Text } = Typography;

// LOCAL IMPORT
import { loginUser } from "../redux/slices/authSlice";
import dbblLogo from "@/assets/dbbl_logo.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- CORE LOGIN LOGIC (UNCHANGED FUNCTIONALITY) ---
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log("Form values:", values);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success("Login successful! Redirecting...");
      dispatch(loginUser({ username: "admin", token: "fake-jwt-token" }));
      navigate("/rbs");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.errorFields) {
        message.error("Please fill in all required fields");
      } else {
        message.error("Invalid credentials or network error");
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        {/* Subtle divider line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-700/50"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 py-16 w-full">
          <div className="flex-auto">
            {/* Logo and Title Section */}
            <div className="inline-flex items-center gap-3 mb-12">
              {/* <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0"> */}
              <img
                src={dbblLogo}
                alt="DBBL Logo"
                className="h-14 w-auto bank-logo filter brightness-110"
              />
              {/* </div> */}
              <div>
                <Title
                  level={3}
                  className="!mb-0 !text-white !text-xl font-bold"
                >
                  RBS Portal
                </Title>
              </div>
            </div>

            <div className="mt-16">
              <Title
                level={2}
                className="!text-4xl !text-white !mb-4 !leading-tight font-bold"
              >
                Banking Reports
              </Title>
              <Text className="!text-slate-300 text-base block mb-8 leading-relaxed max-w-sm">
                Secure access to financial reports and management tools for
                Bangladesh Bank operations.
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
        <div className="w-full max-w-sm">
          {/* Mobile Logo & Title */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">DB</span>
              </div>
              <Title level={4} className="!mb-0 !text-slate-900 font-bold">
                RBS Portal
              </Title>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-slate-200">
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <LockOutlined className="text-xl" />
                </div>
              </div>
              <Title level={4} className="!mb-1 !text-slate-900 font-bold">
                Sign In
              </Title>
              <Text className="!text-slate-600 text-sm">
                Enter your credentials to continue
              </Text>
            </div>

            <Form form={form} name="login" layout="vertical" autoComplete="off">
              <Form.Item
                name="username"
                label={
                  <span className="font-medium text-slate-700 text-sm">
                    Employee ID
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter your employee ID" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Enter your employee ID"
                  className="rounded-lg h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-base"
                  onPressEnter={handleSubmit}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="font-medium text-slate-700 text-sm">
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
                  className="rounded-lg h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-base"
                  onPressEnter={handleSubmit}
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-7">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-slate-600 text-sm font-medium">
                    Remember me
                  </Checkbox>
                </Form.Item>
                <a
                  href="#"
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  block
                  icon={<ArrowRightOutlined />}
                  className="rounded-lg font-semibold h-11 text-base bg-teal-600 border-none hover:bg-teal-700 hover:shadow-lg transition-all duration-200"
                  iconPosition="end"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Form.Item>
            </Form>

            {/* Security Footer */}
            <div className="mt-7 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                <SafetyOutlined className="text-teal-600 text-sm" />
                <span>Your connection is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Support Link */}
          <div className="text-center mt-6">
            <Text className="text-slate-600 text-sm">
              Having trouble?{" "}
              <a
                href="#"
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
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
          color: #64748b;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #14b8a6;
          border-color: #14b8a6;
        }

        .ant-input::placeholder {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Login;
