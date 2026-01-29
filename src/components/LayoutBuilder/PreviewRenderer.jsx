import { Row, Col, Button, Input, Divider, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const PreviewRenderer = ({
  component,
  section,
  formValues,
  onValueChange,
  onTriggerApi,
}) => {
  switch (component.type) {
    case "field":
      return (
        <Input
          value={formValues[component.name] || ""}
          onChange={(e) => onValueChange(component.name, e.target.value)}
          placeholder={component.placeholder}
        />
      );
    case "button":
      return (
        <Button
          type={component.variant === "primary" ? "primary" : "default"}
          onClick={() => onTriggerApi(section, component)}
        >
          {component.label}
        </Button>
      );
    case "text":
      return (
        <p
          style={{
            fontSize: component.fontSize,
            fontWeight: component.fontWeight,
          }}
        >
          {component.content}
        </p>
      );
    case "spacer":
      return <div style={{ height: component.height }} />;
    case "divider":
      return <Divider />;
    case "card":
      return (
        <Card title={component.title} bordered={component.bordered}>
          {/* Recursion could go here if cards held components */}
          <p className="text-slate-400 italic text-xs">Card content area</p>
        </Card>
      );
    default:
      return null;
  }
};

const LayoutPreview = ({ config, onBack }) => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 20 }}
      >
        Back to Editor
      </Button>

      {config.sections.map((section) => (
        <div key={section.id} style={{ marginBottom: 40 }}>
          <h2 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: 8 }}>
            {section.name}
          </h2>
          <Row gutter={[section.layout.gutter, section.layout.gutter]}>
            {section.components.map((comp) => (
              <Col key={comp.id} span={24 / (section.layout.columns || 1)}>
                <PreviewRenderer component={comp} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default LayoutPreview;
