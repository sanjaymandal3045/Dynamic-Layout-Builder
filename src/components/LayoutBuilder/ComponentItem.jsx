import { Button, Divider, Space } from "antd";
import {
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const TYPE_COLORS = {
  field: "bg-blue-500",
  button: "bg-emerald-500",
  text: "bg-amber-500",
  divider: "bg-slate-400",
  spacer: "bg-purple-400",
  newline: "bg-rose-400",
  card: "bg-indigo-500",
  select: "bg-red-500",
  table: "bg-cyan-500",
  checkbox: "bg-yellow-500",
  upload: "bg-violet-500",
};

const ComponentItem = ({
  component,
  index,
  section,
  onConfigure,
  onRemoveComponent,
  onMoveComponent,
}) => {
  const move = (direction) => {
    onMoveComponent(component.id, direction);
  };

  const remove = () => {
    onRemoveComponent(component.id);
  };

  return (
    <div 
      className="p-3 rounded-xl border flex justify-between items-center group transition-all duration-200"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-gradient-end)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
      }}
    >
      <div className="flex items-center space-x-4">
        {/* Dynamic Color Indicator */}
        <div
          className={`w-1.5 h-8 rounded-full ${
            TYPE_COLORS[component.type] || "bg-slate-300"
          }`}
        />

        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "var(--text-muted)" }}>
            {component.type}
          </span>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {component.label ||
              component.content?.substring(0, 20) ||
              "Element"}
          </span>
        </div>
      </div>

      <Space 
        className="p-1 rounded-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: "var(--bg-app)",
          borderColor: "var(--border-color)",
        }}
      >
        <Button
          size="small"
          type="text"
          className="hover:text-indigo-600"
          icon={<SettingOutlined />}
          onClick={() => onConfigure(section.id, component)}
        />
        <Divider type="vertical" style={{ borderColor: "var(--border-color)" }} />
        <Button
          size="small"
          type="text"
          disabled={index === 0}
          icon={<ArrowUpOutlined />}
          onClick={() => move("up")}
        />
        <Button
          size="small"
          type="text"
          disabled={index === section.components.length - 1}
          icon={<ArrowDownOutlined />}
          onClick={() => move("down")}
        />
        <Button
          size="small"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={remove}
        />
      </Space>
    </div>
  );
};

export default ComponentItem;
