import { Card, Input, InputNumber, Button } from "antd";
import {
  DeleteOutlined,
  LayoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import ComponentsList from "./ComponentsList";

const SectionCard = ({
  section,
  tabId,
  onUpdateSection,
  onRemoveSection,
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
      className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl"
      styles={{ body: { padding: 0 } }}
      style={{ marginBottom: "32px" }}
    >
      <div className="flex flex-col">
        {/* Colorful Header Strip */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-4">
          {/* Header Area */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <LayoutOutlined style={{ fontSize: "20px" }} />
              </div>
              <Input
                placeholder="Section Name (e.g., User Profile)"
                value={section.name}
                onChange={(e) => updateSection({ name: e.target.value })}
                className="text-xl font-bold p-0 border-none hover:bg-slate-50 transition-colors focus:bg-transparent shadow-none"
                style={{ background: "transparent" }}
              />
            </div>

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={onRemoveSection}
              className="hover:bg-red-50 rounded-full w-10 h-10 flex items-center justify-center"
            />
          </div>

          {/* Layout Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100/50">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">
                Grid Columns
              </span>
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-indigo-100">
                <AppstoreOutlined className="text-indigo-300" />
                <InputNumber
                  min={1}
                  max={6}
                  value={section.layout.columns}
                  onChange={(v) => updateSectionLayout("columns", v)}
                  className="w-full border-none shadow-none"
                  controls={true}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">
                Padding Spacing (Gutter)
              </span>
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-indigo-100">
                <div className="w-4 h-4 border-2 border-dashed border-indigo-200 rounded" />
                <InputNumber
                  min={0}
                  max={32}
                  value={section.layout.gutter}
                  onChange={(v) => updateSectionLayout("gutter", v)}
                  className="w-full border-none shadow-none"
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