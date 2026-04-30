# Developer Onboarding: Dynamic Layout Builder

Welcome to the **Dynamic Layout Builder** project! If you are new to this codebase, this guide will help you understand the core mechanisms, how the pieces fit together, and how to start making changes.

---

## 1. What is this project?

Instead of hardcoding every single form, page, and table in React, this project uses a **Configuration-Driven UI** approach. 

Pages are defined entirely by **JSON configurations**. The JSON dictates what tabs exist, what sections are in those tabs, and what components (fields, buttons, tables) are in those sections. 

The application has two main responsibilities:
1. **The Builder (Editor)**: A visual interface where admins can build and configure these JSON layouts.
2. **The Renderer (Engine)**: The runtime engine that takes a JSON layout, renders the Ant Design React components, handles form state, and makes API calls based on the configuration.

---

## 2. Tech Stack

- **Framework**: React 19 + Vite
- **UI Library**: Ant Design (antd) + TailwindCSS
- **State Management**: Redux Toolkit (stores the layout configuration)
- **Routing**: React Router v7
- **API Requests**: Axios (with centralized handler in `src/utilities/axiosApiCall.js`)

---

## 3. Core Architecture (How it Works)

The core logic lives in `src/components/LayoutBuilder/`. 

### The Data Structure
A layout is a hierarchical JSON object:
`Page -> Tabs -> Sections -> Components`

### The Big Three Files
If you understand these three files, you understand the project:

1. **`LayoutBuilder.jsx` (The Editor)**
   This is the drag-and-drop / visual editor. It allows users to add tabs, sections, and components. When a user edits a component, it opens the `ComponentConfigDrawer.jsx` which updates the JSON config in Redux (`layoutSlice.js`).

2. **`LayoutPreview.jsx` (The Engine / Container)**
   This is the heavy lifter. It takes the JSON config and:
   - Sets up the CSS Grid layouts for sections.
   - Maintains the `formValues` state (what the user has typed into the fields).
   - Handles button clicks (`handleAction`) and executes API calls (`executeApiCall`).
   - Manages cross-component communication (e.g., clicking a button refreshes a table, or clicking a table row populates form fields).

3. **`ComponentRenderer.jsx` (The UI Drawer)**
   This component is a giant `switch` statement. It takes a single component configuration (e.g., `type: "field"`) and renders the actual Ant Design `<Input>`, `<Select>`, `<Button>`, or `<CustomTable>`. It also handles component-level API calls like fetching dropdown options or on-blur field validations.

---

## 4. The Data Flow (A Real-world Scenario)

Let's trace what happens when a user types an Account Number and clicks "Search" to view a table of results.

1. **User types in "Account Number" field**
   - `ComponentRenderer` detects the `onChange`.
   - It calls `onValueChange("accountNumber", "12345")` which updates the `formValues` state inside `LayoutPreview.jsx`.

2. **User clicks "Search" button**
   - The button config has `onClick: "submit"` and an API URL configured.
   - `LayoutPreview` intercepts the click. It gathers all `formValues` from that section, checks for required fields, and builds an API payload.
   - `executeApiCall` runs, sending a `POST` request to the backend.

3. **Updating the Table**
   - The API returns success. `LayoutPreview` looks for any tables that have `triggerButtonName: "searchBtn"`.
   - It updates a `refreshTrigger` state for that table.
   - `ComponentRenderer` (which is rendering the Table) sees `refreshTrigger` change and automatically fires its own API call to fetch the new table data.

---

## 5. File Structure Cheat Sheet

```text
src/
├── components/
│   ├── LayoutBuilder/          # Core layout engine (Builder & Renderer)
│   │   ├── ComponentRenderer.jsx    # Renders individual components
│   │   ├── LayoutPreview.jsx        # Manages form state & API calls
│   │   ├── ConfigDrawerComponents.jsx # The forms used to edit components
│   │   └── layoutSlice.js           # Redux state for the builder
│   └── UI/                     # Custom wrapper components (e.g., CustomTable)
├── pages/                      # Page containers (e.g., HomePage, ContractSearch)
├── redux/                      # Global Redux store
└── utilities/                  # Axios helpers, auth, formatters
```

---

## 6. How-To: Add a New Component Type

If you are asked to add a new component type (e.g., a "Switch" toggle or a "Date Range Picker"), follow these 3 exact steps:

### Step 1: Add it to the Editor Menu
Open `src/components/LayoutBuilder/ComponentsList.jsx` and add your new component to the list of available draggable/clickable components. Provide default JSON configuration values for it.

```javascript
{
  type: "switch",
  label: "New Switch",
  name: `switch_${Date.now()}`,
  layout: { offset: 0, colSpan: 1 }
}
```

### Step 2: Render the actual UI
Open `src/components/LayoutBuilder/ComponentRenderer.jsx`. Find the `switch (component.type)` block inside `renderComponentContent` and add your new case:

```javascript
case "switch": {
  const state = getComponentState(component);
  if (!state.isVisible) return null;
  return (
    <FieldWrap gridColumn={gc}>
      <FieldLabel label={component.label} required={component.required} />
      <Switch 
        checked={value} 
        onChange={(checked) => onValueChange(component.name, checked)} 
        disabled={disabled || state.isDisabled} 
      />
    </FieldWrap>
  );
}
```

### Step 3: Add the Configuration Form
When a user clicks the "Edit" pencil icon on your new component in the Layout Builder, they need a form to configure it (e.g., change its label, span, etc.). 
Open `src/components/LayoutBuilder/ConfigDrawerComponents.jsx` and define the fields the user can edit.

```javascript
{
  type: "switch",
  fields: [
    { name: "name", label: "Field Name (Binding)", type: "text", required: true },
    { name: "label", label: "Display Label", type: "text" },
    // Add layout/offset config if it's a grid item
  ]
}
```

---

## 7. Permissions & Visibility

Every component config has a `permissionString` (e.g., `"11"` or `"100"`).
- **Position 0**: `canRead` (1 = visible, 0 = hidden)
- **Position 1**: `canWrite` (1 = editable, 0 = disabled/locked)
- **Position 2**: `canMask` (1 = masked, 0 = unmasked)

`ComponentRenderer.jsx` automatically parses this string using `getComponentState(component)` and passes the appropriate disabled/hidden props to the UI components.
