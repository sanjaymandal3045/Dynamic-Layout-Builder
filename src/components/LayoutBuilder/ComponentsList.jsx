import { Button, Tooltip, Divider, Tag } from "antd";
import {
  PlusOutlined,
  FontSizeOutlined,
  FormOutlined,
  MinusOutlined,
  VerticalAlignMiddleOutlined,
  CreditCardOutlined,
  SendOutlined,
  EnterOutlined,
  TableOutlined,
  CheckSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { COMPONENT_TYPES } from "../../utilities/constants";
import ComponentItem from "./ComponentItem";
import { MenuIcon } from "lucide-react";
import { v7 as uuidv7 } from "uuid";

const TYPE_ICONS = {
  field: <FormOutlined />,
  text: <FontSizeOutlined />,
  button: <SendOutlined />,
  spacer: <VerticalAlignMiddleOutlined />,
  divider: <MinusOutlined />,
  newline: <EnterOutlined />,
  select: <MenuIcon />,
  table: <TableOutlined />,
  checkbox: <CheckSquareOutlined />,
  upload: <UploadOutlined />,
};

const ComponentsList = ({
  section,
  onAddComponent,
  onRemoveComponent,
  onMoveComponent,
  onConfigure,
}) => {
  const addComponent = (type) => {
    // const id = Date.now() + Math.random();
    const id = uuidv7();

    const componentTemplates = {
      field: {
        id,
        type,
        name: `field_${id}`,
        label: "New Field",
        fieldType: "text",
        required: false,
        controlString: "111",
      },
      text: {
        id,
        type,
        content: "Sample Text",
        fontSize: 16,
        fontWeight: "normal",
        controlString: "111",
      },
      // ✅ UPDATED: Button now has name field
      button: {
        id,
        type,
        name: `button_${id}`, // ← Auto-generated button name
        label: "Button",
        variant: "primary",
        onClick: "submit",
        api: {
          method: "post",
          url: "",
        },
        apiCommon: {
          subChannelId: null,
          subServiceId: null,
        },
        controlString: "111",
      },
      spacer: { id, type, height: 16 },
      divider: { id, type },
      card: { id, type, title: "Card Title", bordered: true, components: [] },
      newline: { id, type },
      select: {
        id,
        type,
        name: `select_${Math.random().toString(36).substr(2, 5)}`,
        label: "Dropdown Select",
        placeholder: "Select an option",
        dataSource: "manual",
        dataUrl: "",
        options: [
          { label: "Option 1", value: "val1" },
          { label: "Option 2", value: "val2" },
        ],
        controlString: "111",
      },
      // ✅ UPDATED: Table now has name field
      table: {
        id,
        type,
        name: `table_${id}`, // ← Auto-generated table name
        label: "Data Table",
        dataUrl: "",
        pagination: true,
        controlString: "111",
        columns: [
          {
            id: Date.now(),
            label: "ID",
            dataIndex: "id",
            name: "",
          },
          {
            id: Date.now() + 1,
            label: "Name",
            dataIndex: "name",
            name: "",
          },
        ],
        rowActions: {
          showSelect: true,
          selectLabel: "Select",
        },
        tableApi: {
          method: "get",
          url: "",
        },
        tableApiCommon: {
          subChannelId: null,
          subServiceId: null,
        },
        triggerButtonName: [], // ← New: Store button names that trigger this table
      },
      checkbox: {
        id,
        type,
        name: `checkbox_${id}`,
        label: "Checkbox",
        checkboxMode: "single",     // "single" | "multiple"
        checkedValue: "Y",
        uncheckedValue: "N",
        options: [],               // used in multiple mode
        required: false,
        controlString: "111",
      },
      upload: {
        id,
        type,
        name: `upload_${id}`,
        label: "File Upload",
        uploadFormat: "BLOB", // "BLOB" or "Base64"
        maxCount: 1,
        accept: "",
        required: false,
        controlString: "111",
      },
    };

    onAddComponent(componentTemplates[type]);
  };

  // Apply gutter spacing from section layout
  const gutter = section?.layout?.gutter || 8;
  const gutterStyle = {
    gap: `${gutter}px`,
  };

  return (
    <div 
      className="rounded-xl border shadow-sm overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Component List */}
      <div 
        className="p-4"
        style={{ background: "var(--bg-app)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            Section Content
          </span>
          <Tag color="blue" className="mr-0 rounded-full px-2 text-[10px]">
            {section.components.length} Items
          </Tag>
        </div>

        <div style={gutterStyle} className="flex flex-col">
          {section.components.length > 0 ? (
            section.components.map((component, index) => (
              <ComponentItem
                key={component.id}
                component={component}
                index={index}
                section={section}
                onConfigure={onConfigure}
                onRemoveComponent={onRemoveComponent}
                onMoveComponent={onMoveComponent}
              />
            ))
          ) : (
            <div 
              className="py-2 text-center border-2 border-dashed rounded-lg"
              style={{ borderColor: "var(--border-color)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No components yet. Add one below.
              </p>
            </div>
          )}
        </div>
      </div>

      <Divider style={{ margin: "6px", borderColor: "var(--border-color)" }} />

      {/* Action Area */}
      <div className="p-2" style={{ background: "var(--bg-card)" }}>
        <p className="text-[11px] font-medium mb-3 uppercase tracking-tight" style={{ color: "var(--text-muted)" }}>
          Add Components
        </p>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(COMPONENT_TYPES)
            .filter((t) => t !== "section")
            .map((type) => (
              <Tooltip title={`Add ${type}`} key={type} mouseEnterDelay={0.5}>
                <button
                  type="button"
                  onClick={() => addComponent(type)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all group"
                  style={{
                    background: "var(--bg-app)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-gradient-end)";
                    e.currentTarget.style.color = "var(--accent-gradient-end)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  <span className="text-lg transition-colors" style={{ color: "inherit" }}>
                    {TYPE_ICONS[type] || <PlusOutlined />}
                  </span>
                  <span className="capitalize text-[10px] font-medium" style={{ color: "inherit" }}>
                    {type}
                  </span>
                </button>
              </Tooltip>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ComponentsList;
