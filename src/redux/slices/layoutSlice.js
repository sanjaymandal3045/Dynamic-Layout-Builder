import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: {
    pageKey: "",
    title: "",
    description: "",
    tabs: [
      {
        id: Date.now(),
        title: "Tab 1",
        sections: [],
      },
    ],
  }
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    addTab: (state) => {
      state.config.tabs.push({
        id: Date.now(),
        title: "New Tab",
        sections: [],
      });
    },
    removeTab: (state, action) => {
      const tabId = action.payload;
      state.config.tabs = state.config.tabs.filter(t => t.id !== tabId);
    },
    renameTab: (state, action) => {
      const { tabId, title } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      if (tab) tab.title = title;
    },
    addSection: (state, action) => {
      const tabId = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      if (tab) {
        tab.sections.push({
          id: Date.now(),
          type: "section",
          name: "New Section",
          layout: { columns: 2, gutter: 16 },
          components: [],
        });
      }
    },
    updateSection: (state, action) => {
      const { tabId, sectionId, patch } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      const section = tab?.sections.find(s => s.id === sectionId);
      if (section) Object.assign(section, patch);
    },
    removeSection: (state, action) => {
      const { tabId, sectionId } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      if (tab) {
        tab.sections = tab.sections.filter(s => s.id !== sectionId);
      }
    },
    addComponent: (state, action) => {
      const { tabId, sectionId, component } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      const section = tab?.sections.find(s => s.id === sectionId);
      if (section) section.components.push(component);
    },
    removeComponent: (state, action) => {
      const { tabId, sectionId, componentId } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      const section = tab?.sections.find(s => s.id === sectionId);
      if (section) {
        section.components = section.components.filter(c => c.id !== componentId);
      }
    },
    moveComponent: (state, action) => {
      const { tabId, sectionId, componentId, direction } = action.payload;
      const tab = state.config.tabs.find(t => t.id === tabId);
      const section = tab?.sections.find(s => s.id === sectionId);
      if (section) {
        const index = section.components.findIndex(c => c.id === componentId);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= section.components.length) return;

        // Swap components
        [section.components[index], section.components[targetIndex]] = 
        [section.components[targetIndex], section.components[index]];
      }
    },
    saveComponentConfig: (state, action) => {
      const { sectionId, updatedComponent } = action.payload;
      // We search all tabs to find the section and component
      state.config.tabs.forEach(tab => {
        const section = tab.sections.find(s => s.id === sectionId);
        if (section) {
          const idx = section.components.findIndex(c => c.id === updatedComponent.id);
          if (idx !== -1) section.components[idx] = updatedComponent;
        }
      });
    }
  }
});

export const { 
  addTab, removeTab, renameTab, addSection, 
  updateSection, removeSection, addComponent, 
  removeComponent, moveComponent, saveComponentConfig, 
  setConfig 
} = layoutSlice.actions;

export default layoutSlice.reducer;