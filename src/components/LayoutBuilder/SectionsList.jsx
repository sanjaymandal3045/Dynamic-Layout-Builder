import { Button } from "antd";
import SectionCard from "./SectionCard";

const SectionsList = ({
  sections = [],
  tabId,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onAddComponent,
  onRemoveComponent,
  onMoveComponent,
  onConfigure,
}) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
          alignItems: "center",
        }}
      >
        <h2 className="text-lg font-semibold text-slate-700">Sections</h2>
        <Button type="dashed" onClick={onAddSection}>
          Add Section
        </Button>
      </div>

      {Array.isArray(sections) &&
        sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            tabId={tabId}
            onUpdateSection={(patch) =>
              onUpdateSection(section.id, patch)
            }
            onRemoveSection={() => onRemoveSection(section.id)}
            onAddComponent={(component) =>
              onAddComponent(section.id, component)
            }
            onRemoveComponent={(componentId) =>
              onRemoveComponent(section.id, componentId)
            }
            onMoveComponent={(componentId, direction) =>
              onMoveComponent(section.id, componentId, direction)
            }
            onConfigure={onConfigure}
          />
        ))}
    </>
  );
};

export default SectionsList;