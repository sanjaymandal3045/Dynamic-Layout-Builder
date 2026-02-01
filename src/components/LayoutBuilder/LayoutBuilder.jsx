import React, { useState } from "react";
import HeaderBar from "./HeaderBar";
import SectionsList from "./SectionsList";
import LayoutPreview from "./LayoutPreview";
import ComponentConfigDrawer from "./ComponentConfigDrawer";
import JSONModal from "./JSONModal";
import { Tabs, Button, Input, Space, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  addTab,
  renameTab,
  addSection,
  removeTab,
  updateSection,
  removeSection,
  addComponent,
  removeComponent,
  moveComponent,
  saveComponentConfig,
  setConfig,
} from "../../redux/slices/layoutSlice";

const LayoutBuilder = () => {
  const dispatch = useDispatch();
  const config = useSelector((state) => state.layout.config);

  const [activeTabKey, setActiveTabKey] = useState(
    config.tabs[0]?.id.toString(),
  );
  const [editingTabId, setEditingTabId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [drawerState, setDrawerState] = useState({
    open: false,
    sectionId: null,
    component: null,
  });

  // Handle Tab Name Editing
  const EditableTabLabel = ({ tab }) => {
    const isEditing = editingTabId === tab.id;
    return (
      <div
        onDoubleClick={() => setEditingTabId(tab.id)}
        style={{ minWidth: 60 }}
      >
        {isEditing ? (
          <Input
            size="small"
            autoFocus
            defaultValue={tab.title}
            onKeyDown={(e) => e.stopPropagation()}
            onBlur={(e) => {
              dispatch(renameTab({ tabId: tab.id, title: e.target.value }));
              setEditingTabId(null);
            }}
            onPressEnter={(e) => {
              dispatch(renameTab({ tabId: tab.id, title: e.target.value }));
              setEditingTabId(null);
            }}
          />
        ) : (
          <Space>
            {tab.title}
            <EditOutlined style={{ fontSize: 10, opacity: 0.5 }} />
          </Space>
        )}
      </div>
    );
  };

  // Handle Tab Add/Remove
  const onTabEdit = (targetKey, action) => {
    if (action === "add") {
      dispatch(addTab());
      // Set active to the newly created tab.
      setTimeout(() => {
        const lastTab = config.tabs[config.tabs.length - 1];
        if (lastTab) setActiveTabKey(lastTab.id.toString());
      }, 0);
    } else if (action === "remove") {
      const tabIdToRemove = Number(targetKey);
      dispatch(removeTab(tabIdToRemove));

      // If we closed the active tab, switch to the last available tab
      if (activeTabKey === targetKey) {
        const newTabs = config.tabs.filter((t) => t.id !== tabIdToRemove);
        const lastTab = newTabs[newTabs.length - 1];
        if (lastTab) setActiveTabKey(lastTab.id.toString());
      }
    }
  };

  const handleAddSectionToTab = (tabId) => {
    dispatch(addSection(tabId));
  };

  const handleUpdateSectionInTab = (tabId, sectionId, patch) => {
    dispatch(updateSection({ tabId, sectionId, patch }));
  };

  const handleRemoveSection = (tabId, sectionId) => {
    dispatch(removeSection({ tabId, sectionId }));
  };

  const handleAddComponent = (tabId, sectionId, component) => {
    dispatch(addComponent({ tabId, sectionId, component }));
  };

  const handleSaveComponentConfig = (sectionId, updatedComponent) => {
    dispatch(saveComponentConfig({ sectionId, updatedComponent }));
  };

  const handleRemoveComponent = (tabId, sectionId, componentId) => {
    dispatch(removeComponent({ tabId, sectionId, componentId }));
  };

  const handleMoveComponent = (tabId, sectionId, componentId, direction) => {
    dispatch(moveComponent({ tabId, sectionId, componentId, direction }));
  };

  const handleUpdateConfig = (newConfig) => {
    dispatch(setConfig(newConfig));
  };

  if (previewMode) {
    return (
      <LayoutPreview
        config={config}
        formValues={formValues}
        onValueChange={(name, val) =>
          setFormValues((prev) => ({ ...prev, [name]: val }))
        }
        onBack={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1280, margin: "0 auto" }}>
      <HeaderBar
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onPreview={() => setPreviewMode(true)}
        onJson={() => setJsonOpen(true)}
      />

      <div className="mt-6">
        <Tabs
          type="editable-card"
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          onEdit={onTabEdit}
          items={config.tabs.map((tab) => ({
            key: tab.id.toString(),
            label: <EditableTabLabel tab={tab} />,
            children: (
              <div
                style={{ background: "#f3f5f7", padding: 20, borderRadius: 8 }}
              >
                <SectionsList
                  sections={tab.sections}
                  tabId={tab.id}
                  onAddSection={() => handleAddSectionToTab(tab.id)}
                  onUpdateSection={(sectionId, patch) =>
                    handleUpdateSectionInTab(tab.id, sectionId, patch)
                  }
                  onRemoveSection={(sectionId) =>
                    handleRemoveSection(tab.id, sectionId)
                  }
                  onAddComponent={(sectionId, component) =>
                    handleAddComponent(tab.id, sectionId, component)
                  }
                  onRemoveComponent={(sectionId, componentId) =>
                    handleRemoveComponent(tab.id, sectionId, componentId)
                  }
                  onMoveComponent={(sectionId, componentId, direction) =>
                    handleMoveComponent(tab.id, sectionId, componentId, direction)
                  }
                  onConfigure={(sectionId, component) =>
                    setDrawerState({ open: true, sectionId, component })
                  }
                />
              </div>
            ),
          }))}
        />
      </div>

      <ComponentConfigDrawer
        {...drawerState}
        onClose={() => setDrawerState({ open: false })}
        onSave={(updated) => {
          handleSaveComponentConfig(drawerState.sectionId, updated);
          setDrawerState({ open: false });
        }}
      />

      <JSONModal
        open={jsonOpen}
        config={config}
        onClose={() => setJsonOpen(false)}
      />
    </div>
  );
};

export default LayoutBuilder;