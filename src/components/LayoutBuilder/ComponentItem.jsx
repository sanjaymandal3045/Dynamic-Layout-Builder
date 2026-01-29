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
    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-indigo-400 hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-4">
        {/* Dynamic Color Indicator */}
        <div
          className={`w-1.5 h-8 rounded-full ${
            TYPE_COLORS[component.type] || "bg-slate-300"
          }`}
        />

        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
            {component.type}
          </span>
          <span className="font-semibold text-slate-700 text-sm">
            {component.label || component.content?.substring(0, 20) || "Element"}
          </span>
        </div>
      </div>

      <Space className="bg-slate-50 p-1 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          size="small"
          type="text"
          className="hover:text-indigo-600"
          icon={<SettingOutlined />}
          onClick={() => onConfigure(section.id, component)}
        />
        <Divider type="vertical" />
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