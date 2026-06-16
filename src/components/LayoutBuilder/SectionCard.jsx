import { Card, Input, InputNumber, Button, Tooltip } from "antd";
import {
  DeleteOutlined,
  LayoutOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import ComponentsList from "./ComponentsList";

const SectionCard = ({
  section,
  index,
  total,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onAddComponent,
  onRemoveComponent,
  onMoveComponent,
  onConfigure,
}) => {
  const updateSection = (patch) => {
    onUpdateSection(patch);
  };

  const updateSectionLayout = (layoutKey, value) => {
    onUpdateSection({
      layout: { ...section.layout, [layoutKey]: value },
    });
  };

  return (
    <Card
      className="border-none shadow-lg transition-all duration-300 overflow-hidden rounded-2xl"
      styles={{ body: { padding: 0 } }}
      style={{
        marginBottom: "32px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="flex flex-col">
        {/* Colorful Header Strip */}
        <div className="h-2 bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]" />

        <div className="p-4">
          {/* Header Area */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: "var(--bg-hover)",
                  color: "var(--accent-gradient-end)",
                }}
              >
                <LayoutOutlined style={{ fontSize: "20px" }} />
              </div>
              <Input
                placeholder="Section Name (e.g., User Profile)"
                value={section.name}
                onChange={(e) => updateSection({ name: e.target.value })}
                className="text-xl font-bold p-0 border-none transition-colors focus:bg-transparent shadow-none"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <Tooltip title="Move Up">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => onMoveSection("up")}
                  className="rounded-lg w-8 h-8 flex items-center justify-center"
                />
              </Tooltip>
              <Tooltip title="Move Down">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === total - 1}
                  onClick={() => onMoveSection("down")}
                  className="rounded-lg w-8 h-8 flex items-center justify-center"
                />
              </Tooltip>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={onRemoveSection}
                className="rounded-full w-10 h-10 flex items-center justify-center"
              />
            </div>
          </div>

          {/* Layout Configuration Section */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-3 rounded-2xl border"
            style={{
              background: "var(--bg-app)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest ml-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Grid Columns
              </span>
              <div
                className="flex items-center gap-3 p-2 rounded-xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <AppstoreOutlined style={{ color: "var(--text-muted)" }} />
                <InputNumber
                  min={1}
                  max={6}
                  value={section.layout.columns}
                  onChange={(v) => updateSectionLayout("columns", v)}
                  className="w-full border-none shadow-none"
                  style={{
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                  controls={true}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest ml-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Padding Spacing (Gutter)
              </span>
              <div
                className="flex items-center gap-3 p-2 rounded-xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div
                  className="w-4 h-4 border-2 border-dashed rounded"
                  style={{ borderColor: "var(--border-color)" }}
                />
                <InputNumber
                  min={0}
                  max={32}
                  value={section.layout.gutter}
                  onChange={(v) => updateSectionLayout("gutter", v)}
                  className="w-full border-none shadow-none"
                  style={{
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Components Area */}
          <div>
            <ComponentsList
              section={section}
              onAddComponent={onAddComponent}
              onRemoveComponent={onRemoveComponent}
              onMoveComponent={onMoveComponent}
              onConfigure={onConfigure}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SectionCard;
