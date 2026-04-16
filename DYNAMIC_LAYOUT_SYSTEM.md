# Dynamic Layout Builder & Renderer - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [JSON Layout Template Structure](#json-layout-template-structure)
4. [Component Types](#component-types)
5. [Rendering Process](#rendering-process)
6. [Building/Editing Process](#buildingediting-process)
7. [State Management (Redux)](#state-management-redux)
8. [Data Flow](#data-flow)
9. [Permission System](#permission-system)
10. [API Integration](#api-integration)

---

## System Overview

The Dynamic Layout Builder is a comprehensive system for creating, configuring, and rendering dynamic page layouts without hardcoding UI. It consists of two main parts:

1. **Layout Builder (Editor)**: Allows users to visually design page layouts by creating sections, adding components, and configuring their properties through a UI.
2. **Layout Renderer**: Converts the JSON configuration into actual rendered UI components and handles user interactions.

The system works with a hierarchical structure:
```
Page
├── Tabs
│   └── Tab
│       └── Sections
│           └── Section
│               └── Components
│                   ├── Field
│                   ├── Button
│                   ├── Text
│                   ├── Table
│                   └── ... (other component types)
```

---

## Architecture

### High-Level Component Hierarchy

```
LayoutBuilder (Editor View)
│
├── HeaderBar (Page metadata: title, description, pageKey)
├── Tabs (Editable card tabs)
│   └── SectionsList
│       └── SectionCard (per section)
│           └── ComponentsList
│               └── ComponentItem (per component)
│                   └── ComponentConfigDrawer (edit modal)
└── LayoutPreview (Preview mode)

DynamicPageLoader (Runtime View)
│
└── LayoutPreview (same component as editor preview)
    └── Sections/Tabs
        └── ComponentRenderer (displays each component)
```

### Key Files

| File | Purpose |
|------|---------|
| `layoutSlice.js` | Redux store for page configuration |
| `LayoutBuilder.jsx` | Editor UI for building layouts |
| `LayoutPreview.jsx` | Renders the layout and handles interactions |
| `ComponentRenderer.jsx` | Renders individual component types |
| `DynamicPageLoader.jsx` | Loads page config from API and displays |

---

## JSON Layout Template Structure

### Root Structure

```json
{
  "pageKey": "unique-page-identifier",
  "title": "Page Title",
  "description": "Page description text",
  "tabs": [...]
}
```

### Complete Example

```json
{
  "pageKey": "cbs-report",
  "title": "CBS Report",
  "description": "CBS Report Details",
  "tabs": [
    {
      "id": 1768815659064,
      "title": "Tab 1",
      "sections": [
        {
          "id": 1768815659064,
          "type": "section",
          "name": "Search Section",
          "layout": {
            "columns": 2,
            "gutter": 16
          },
          "components": [
            {
              "id": 1768815660952,
              "type": "field",
              "name": "accountNumber",
              "label": "Account Number",
              "fieldType": "text",
              "placeholder": "Enter account number",
              "required": true,
              "layout": {
                "offset": 0,
                "colSpan": 1
              },
              "permissionString": "11",
              "onBlurApi": {
                "enabled": true,
                "url": "/api/account/validate",
                "apiCommon": {
                  "subChannelId": "2",
                  "subServiceId": "9",
                  "traceNo": ""
                },
                "fieldMappings": [
                  {
                    "apiResponseField": "customerName",
                    "targetFieldName": "customerName"
                  }
                ]
              }
            },
            {
              "id": 1768815662264,
              "type": "button",
              "name": "searchBtn",
              "label": "Search",
              "variant": "primary",
              "onClick": "submit",
              "permissionString": "11",
              "api": {
                "method": "post",
                "url": "/transaction/search",
                "successMessage": "Data fetched successfully",
                "errorMessage": "Failed to fetch data",
                "resetFormOnSuccess": false
              },
              "apiCommon": {
                "subChannelId": "2",
                "subServiceId": "9",
                "traceNo": ""
              }
            }
          ]
        },
        {
          "id": 1768815659424,
          "type": "section",
          "name": "Results",
          "layout": {
            "columns": 1,
            "gutter": 16
          },
          "components": [
            {
              "id": 1768815667793,
              "type": "table",
              "name": "resultsTable",
              "label": "Search Results",
              "dataUrl": "/transaction/list",
              "permissionString": "11",
              "triggerButtonName": "searchBtn",
              "tableApiCommon": {
                "subChannelId": "2",
                "subServiceId": "9",
                "traceNo": ""
              },
              "columns": [
                {
                  "label": "Account ID",
                  "dataIndex": "accountId",
                  "name": "accountId"
                },
                {
                  "label": "Customer Name",
                  "dataIndex": "customerName",
                  "name": "customerName"
                }
              ],
              "rowActions": {
                "showSelect": true,
                "selectLabel": "Select",
                "showDelete": false
              },
              "pagination": true
            }
          ]
        }
      ]
    }
  ]
}
```

### Section Object Structure

```javascript
{
  id: number,              // Unique timestamp-based ID
  type: "section",        // Always "section"
  name: string,           // Display name
  layout: {
    columns: number,      // Grid columns (1, 2, 3, etc.)
    gutter: number        // Spacing between items in pixels
  },
  components: []          // Array of component objects
}
```

---

## Component Types

### 1. **Field Component**

Input field for collecting user data.

```json
{
  "id": 1768815660952,
  "type": "field",
  "name": "fieldName",                 // For data binding
  "label": "Display Label",            // What users see
  "fieldType": "text",                 // text, email, password, number, date, etc.
  "placeholder": "Enter value",
  "required": true,
  "permissionString": "11",            // See Permission System section
  "layout": {
    "offset": 0,                       // Column offset (0-based)
    "colSpan": 1                       // How many columns to span
  },
  "onBlurApi": {
    "enabled": true,
    "url": "/api/endpoint",
    "apiCommon": { ... },
    "fieldMappings": [
      {
        "apiResponseField": "field_from_api",
        "targetFieldName": "field_to_populate"
      }
    ]
  }
}
```

**Rendering**: Renders as an Ant Design `<Input>` component with label, required indicator, and lock icon (if read-only).

**Capabilities**:
- One Blur API: Calls API when user leaves the field, populates other fields from response
- Permissions-based visibility and editability
- Required field validation

---

### 2. **Button Component**

Action buttons for form submission or reset.

```json
{
  "id": 1768815662264,
  "type": "button",
  "name": "buttonName",                // For binding (used by triggerButtonName)
  "label": "Click Me",
  "variant": "primary",                // primary, default, dashed, text, link
  "onClick": "submit",                 // submit or reset
  "permissionString": "11",
  "api": {
    "method": "post",                  // get, post, put, patch, delete
    "url": "/api/endpoint",
    "successMessage": "Success!",
    "errorMessage": "Failed!",
    "resetFormOnSuccess": false
  },
  "apiCommon": {
    "subChannelId": "2",
    "subServiceId": "9",
    "traceNo": ""
  }
}
```

**Rendering**: 
- Multiple buttons render in a horizontal flex group
- Styled with variants (primary = blue, default = outlined)
- Disabled during API calls

**Actions**:
- `"submit"`: Collects form data from section, validates required fields, calls API
- `"reset"`: Clears all field values in the section

**Features**:
- Validates required fields before submission
- Shows loading state during API call
- Can trigger table refresh via `triggerButtonName`

---

### 3. **Table Component**

Displays tabular data fetched from API.

```json
{
  "id": 1768815667793,
  "type": "table",
  "name": "tableName",                 // For binding
  "label": "Table Title",
  "dataUrl": "/api/table-data",
  "permissionString": "11",
  "triggerButtonName": "searchBtn",    // Auto-refreshes when this button succeeds
  "tableApiCommon": {
    "subChannelId": "2",
    "subServiceId": "9",
    "traceNo": ""
  },
  "columns": [
    {
      "label": "Column Header",
      "dataIndex": "apiFieldName",     // Maps to API response
      "name": "formFieldName"          // Maps to form field
    }
  ],
  "rowActions": {
    "showSelect": true,
    "selectLabel": "Select",
    "showDelete": false
  },
  "pagination": true
}
```

**Rendering**: 
- Ant Design `<Table>` component
- Rows with actions column (Select button, Delete icon)
- Pagination with configurable page size

**Auto-Refresh**: When button with `triggerButtonName="thisTableName"` is clicked, table automatically reloads data.

**Row Selection**: Maps clicked row data to form fields using `columns[].name` mapping.

---

### 4. **Text Component**

Static text display.

```json
{
  "id": 1768815668599,
  "type": "text",
  "content": "Display this text",
  "fontSize": 16,
  "fontWeight": 400,                   // 400 = normal, 600 = bold, 700 = bold
  "color": "#1a1a1a",
  "permissionString": "11"
}
```

**Rendering**: Centered text with configurable typography.

---

### 5. **Spacer Component**

Vertical spacing between components.

```json
{
  "id": 1768815667792,
  "type": "spacer",
  "height": 16                         // Height in pixels
}
```

**Rendering**: Empty `<div>` with specified height.

---

### 6. **Divider Component**

Horizontal separator line.

```json
{
  "id": 1768815664040,
  "type": "divider"
}
```

**Rendering**: Full-width `<Divider>` component. Always spans all columns.

---

### 7. **Card Component**

Container for content with header.

```json
{
  "id": 1768815669303,
  "type": "card",
  "title": "Card Title",
  "bordered": true,
  "children": []                       // Can contain nested components (future feature)
}
```

**Rendering**: Ant Design `<Card>` with title and border.

---

### 8. **Select Component**

Dropdown selection field.

```json
{
  "id": 1768815670000,
  "type": "select",
  "name": "selectField",
  "label": "Choose Option",
  "placeholder": "Select one",
  "required": false,
  "permissionString": "11",
  "dataSource": "static",              // "static" or "api"
  "options": [
    { "label": "Option 1", "value": "opt1" },
    { "label": "Option 2", "value": "opt2" }
  ],
  "dataUrl": "/api/dropdown-options",  // If dataSource is "api"
  "layout": {
    "offset": 0,
    "colSpan": 1
  }
}
```

**Rendering**: Ant Design `<Select>` component.

**Data Sources**:
- `"static"`: Uses `options` array
- `"api"`: Fetches options from `dataUrl` on component mount

---

## Rendering Process

### Step 1: Load Configuration

The system starts with `DynamicPageLoader`:

```
DynamicPageLoader (component)
  ├─ Receives pageKey prop
  ├─ Calls API: /transaction/execute with { attributes: { pageKey } }
  ├─ Parses response.attributes.pageConfig
  ├─ Handles both JSON strings and objects
  └─ Passes config to LayoutPreview
```

### Step 2: Organize Components into Groups

`LayoutPreview` processes components into logical groups:

1. **Grid Groups**: Regular fields and selects form grid layouts
   - Uses CSS Grid with `gridTemplateColumns: repeat(columns, 1fr)`
   - Apply `gridColumn` offsets and spans
   - Gap = section.layout.gutter

2. **Button Groups**: Consecutive buttons are grouped horizontally
   - Centered with flex layout
   - Gap = section.layout.gutter

3. **Full-Width Components**: Dividers, tables, text on separate lines
   - Always span all columns (gridColumn: "1 / -1")

```javascript
// How it detects groups (from LayoutPreview.jsx)
if (c.type === "button") {
  // Group all consecutive buttons together
}
if (c.type === "divider" || c.type === "table" || c.type === "newline") {
  // Full width, separate
}
// Other components go into grid groups
```

### Step 3: Render Each Component

`ComponentRenderer` handles individual component rendering:

```
ComponentRenderer (component, formValues, callbacks)
  ├─ Check permissions (can render? can edit?)
  ├─ Fetch API data (for dropdowns, tables)
  ├─ Apply layout styling (gridColumn)
  ├─ Render based on type
  │   ├─ field → Input + label
  │   ├─ button → Button
  │   ├─ table → Table with columns
  │   ├─ select → Select dropdown
  │   └─ ... etc
  └─ Return JSX
```

### Step 4: Handle Permissions

Permission string format: `"canReadcanWritecanMask"` (each is 0 or 1)

```javascript
const permissions = parsePermissions("11"); // { canRead: true, canWrite: true, canMask: false }

if (!permissions.canRead) {
  // Component is hidden (return null)
}

if (!permissions.canWrite) {
  // Component is disabled (lock icon shown, input disabled)
}
```

### Step 5: User Interactions

**Field Value Changes**:
```
User types in field
  → onValueChange(fieldName, value)
  → Updates formValues state
  → ComponentRenderer receives new value prop
  → Input updates
```

**Button Clicks** (from LayoutPreview):
```
User clicks button
  → handleAction(section, buttonComponent)
  ├─ If onClick === "reset"
  │   └─ Clear all fields in section
  ├─ If onClick === "submit"
  │   ├─ Validate required fields
  │   └─ executeApiCall(buttonComponent, payload)
  │       ├─ Build payload from form values
  │       ├─ Make HTTP request
  │       ├─ Trigger table refresh if configured
  │       └─ Show success/error message
```

**Table Row Selection** (from LayoutPreview):
```
User clicks "Select" on table row
  → handleTableRowAction(tableComponent, rowData)
  ├─ For each column with name mapping
  │   ├─ Get rowData[column.dataIndex]
  │   └─ onValueChange(column.name, value)
  └─ Populate form fields with row data
```

**On-Blur Field API**:
```
User leaves field
  → handleFieldBlur
  ├─ If component.onBlurApi.enabled
  │   ├─ Call API with field value
  │   ├─ For each fieldMapping
  │   │   ├─ Search response for apiResponseField
  │   │   └─ onValueChange(targetFieldName, apiValue)
  │   └─ Show message (X fields populated)
```

---

## Building/Editing Process

### Creating a Layout (LayoutBuilder.jsx)

1. **Add Tab**
   - Clicks "+" icon on Tabs
   - Redux: `addTab()` → Create new tab with empty sections array

2. **Add Section**
   - Clicks "Add Section" button
   - Redux: `addSection(tabId)` → Create section with empty components

3. **Add Component**
   - Clicks component type from ComponentsList
   - Redux: `addComponent(tabId, sectionId, component)` 
   - Component comes with default config

4. **Configure Component**
   - Clicks edit icon on component
   - Opens `ComponentConfigDrawer` modal
   - User fills in:
     - Basic: label, placeholder, required, etc.
     - Layout: offset, colSpan
     - API: url, method, common params
     - Field mappings, table columns, etc.
   - Validates required fields
   - Redux: `saveComponentConfig(sectionId, updatedComponent)`

5. **Manage Components**
   - Move up/down: `moveComponent(tabId, sectionId, componentId, direction)`
   - Delete: `removeComponent(tabId, sectionId, componentId)`

6. **Preview/Edit JSON**
   - Preview Mode: Shows LayoutPreview
   - JSON Modal: View and edit raw JSON config

---

## State Management (Redux)

### Store Structure

```javascript
{
  layout: {
    config: {
      pageKey: "...",
      title: "...",
      description: "...",
      tabs: [
        {
          id: number,
          title: string,
          sections: [
            {
              id: number,
              type: "section",
              name: string,
              layout: { columns: number, gutter: number },
              components: [ { ... }, { ... } ]
            }
          ]
        }
      ]
    }
  }
}
```

### Redux Slices (layoutSlice.js)

| Action | Effect |
|--------|--------|
| `setConfig(newConfig)` | Replace entire config |
| `addTab()` | Add new tab with empty sections |
| `removeTab(tabId)` | Remove tab |
| `renameTab({ tabId, title })` | Update tab title |
| `addSection(tabId)` | Add section to tab |
| `updateSection({ tabId, sectionId, patch })` | Update section properties |
| `removeSection({ tabId, sectionId })` | Remove section |
| `addComponent({ tabId, sectionId, component })` | Add component to section |
| `removeComponent({ tabId, sectionId, componentId })` | Remove component |
| `moveComponent({ tabId, sectionId, componentId, direction })` | Swap component positions |
| `saveComponentConfig({ sectionId, updatedComponent })` | Update component config |

---

## Data Flow

### Complete User Journey: Search & Display Results

```
1. USER OPENS PAGE
   DynamicPageLoader
   └─ Fetch config from API
   └─ Pass to LayoutPreview

2. LayoutPreview RENDERS SECTIONS
   Tab 1 → Section 1 (Search)
   │       ├─ Field: accountNumber
   │       ├─ Field: dateRange
   │       └─ Button: Search (primary, submit action)
   │
   └─ Section 2 (Results)
       ├─ Divider
       └─ Table: resultsTable

3. USER ENTERS SEARCH CRITERIA
   Field: accountNumber
   └─ onChange event
   └─ onValueChange("accountNumber", "AC123456")
   └─ formValues={ accountNumber: "AC123456", ... }

4. USER CLICKS SEARCH BUTTON
   Button: Search
   └─ handleAction(section1, searchButton)
   └─ Validates required fields ✓
   └─ Collects payload: { accountNumber: "AC123456", dateRange: "..." }
   └─ executeApiCall(searchButton, payload)
   │   ├─ POST /transaction/search
   │   ├─ Request body:
   │   │   {
   │   │     subChannelId: "2",
   │   │     subServiceId: "9",
   │   │     traceNo: "",
   │   │     attributes: { accountNumber: "AC123456", ... }
   │   │   }
   │   └─ Receives response
   │
   └─ Check triggerButtonName
   │   └─ Find all tables with triggerButtonName === "Search"
   │   └─ setTableRefreshTriggers({ resultsTable: Date.now() })
   │
   └─ Show success message

5. TABLE AUTO-REFRESHES
   Table: resultsTable
   └─ Detects refreshTrigger changed
   └─ fetchTableData()
   │   ├─ POST /transaction/list
   │   ├─ Receives: { data: { attributes: { menuTree: [ { id, name }, ... ] } } }
   │   └─ setTableData(menuTree)
   │
   └─ Table re-renders with new data

6. USER CLICKS SELECT ON ROW
   Table row action
   └─ handleTableRowAction(resultsTable, rowData)
   └─ For each column with name:
   │   ├─ accountId column → onValueChange("inputAccountId", "AC123456")
   │   ├─ customerName column → onValueChange("inputCustomerName", "John")
   │
   └─ Form fields populate with row data
```

---

## Permission System

### Permission String Format

- **Length 3**: `"RWM"` where each character is 0 or 1
  - Position 0: **canRead** (1) or hidden (0)
  - Position 1: **canWrite** (1) or read-only (0)
  - Position 2: **canMask** (1) or visible (0) [for masking sensitive data]

### Examples

| String | Read | Write | Mask | Behavior |
|--------|------|-------|------|----------|
| `"11"` (or default) | Yes | Yes | No | Fully editable, visible |
| `"10"` | Yes | No | No | Read-only (lock icon shown) |
| `"00"` | No | No | No | Hidden (not rendered) |
| `"110"` | Yes | Yes | No | Editable |
| `"111"` | Yes | Yes | Yes | Editable + maskable |

### Usage in ComponentRenderer

```javascript
const getComponentState = (component) => {
  const permissions = parsePermissions(component.permissionString);
  return {
    isVisible: permissions.canRead,      // Hide if no read
    isDisabled: !permissions.canWrite,   // Disable if no write
    permissions
  };
};

// In rendering:
if (!componentState.isVisible) {
  return null;  // Don't render at all
}

<Input disabled={componentState.isDisabled} />  // Read-only if no write
```

---

## API Integration

### 1. Field with On-Blur API

**Use Case**: When user enters account number, fetch customer details automatically.

**Configuration**:
```json
{
  "type": "field",
  "name": "accountNumber",
  "onBlurApi": {
    "enabled": true,
    "url": "/api/account/details",
    "apiCommon": {
      "subChannelId": "2",
      "subServiceId": "9",
      "traceNo": ""
    },
    "fieldMappings": [
      {
        "apiResponseField": "customerName",
        "targetFieldName": "customerName"
      },
      {
        "apiResponseField": "accountBalance",
        "targetFieldName": "balance"
      }
    ]
  }
}
```

**Flow**:
```
User leaves field (onBlur)
  → API call with field value
  → Search response object for mapped fields
  → Populate target fields
  → Show "X fields populated" message
```

### 2. Button with Submit Action

**Configuration**:
```json
{
  "type": "button",
  "name": "submitBtn",
  "onClick": "submit",
  "api": {
    "method": "post",
    "url": "/transaction/submit",
    "successMessage": "Submitted successfully",
    "errorMessage": "Submission failed",
    "resetFormOnSuccess": false
  },
  "apiCommon": {
    "subChannelId": "2",
    "subServiceId": "9",
    "traceNo": ""
  }
}
```

**Request Format**:
```json
POST /transaction/submit
{
  "subChannelId": "2",
  "subServiceId": "9",
  "traceNo": "",
  "attributes": {
    "fieldName1": "value1",
    "fieldName2": "value2"
  }
}
```

### 3. Table Data Fetching

**Configuration**:
```json
{
  "type": "table",
  "name": "searchResults",
  "dataUrl": "/api/search-results",
  "triggerButtonName": "searchBtn",
  "tableApiCommon": { ... },
  "columns": [ ... ]
}
```

**Flow**:
```
Component mounts
  → useEffect checks dataUrl exists
  → Calls fetchTableData()
  → POST to dataUrl
  → Extracts response.data.attributes.menuTree
  → Renders table

Button clicked with triggerButtonName="searchResults"
  → Button API succeeds
  → setTableRefreshTriggers({ searchResults: Date.now() })
  → Table's useEffect detects refreshTrigger change
  → Re-fetches table data
```

### 4. API Response Field Searching

The system uses **recursive field search** to find data in nested API responses:

```javascript
const searchFieldInResponse = (obj, fieldName) => {
  // Check if current level has the field
  if (obj.hasOwnProperty(fieldName)) {
    return obj[fieldName];
  }
  
  // Recursively search in arrays and nested objects
  if (Array.isArray(obj)) {
    for (let item of obj) {
      const result = searchFieldInResponse(item, fieldName);
      if (result !== undefined) return result;
    }
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      const result = searchFieldInResponse(obj[key], fieldName);
      if (result !== undefined) return result;
    }
  }
  
  return undefined;
};
```

This allows field mappings to work even if the API response has nested structure:
```json
// API Response (deeply nested)
{
  "data": {
    "account": {
      "details": {
        "customerName": "John Doe"
      }
    }
  }
}

// Field mapping still works:
{
  "apiResponseField": "customerName",
  "targetFieldName": "customerName"
}
// → Finds "John Doe" anywhere in the response
```

---

## Component Layout System

### Grid Layout

Sections use CSS Grid for component layout:

```css
display: grid;
gridTemplateColumns: repeat(columns, 1fr);
gap: gutter px;
```

### Grid Positioning

Each component can specify:
- `offset`: Starting column (0-based, adds gap before component)
- `colSpan`: How many columns to span

**Calculation**:
```javascript
if (offset > 0) {
  gridColumn: `${offset + 1} / span ${colSpan}`;  // Skip offset columns
} else {
  gridColumn: `span ${colSpan}`;  // No offset
}
```

### Full-Width Components

Divider, table, and newline always span full width:
```javascript
gridColumn: "1 / -1";  // From first to last column
```

### Grouping Logic

Components are grouped for smart rendering:

```
Section Components Array
├─ Grid Group 1: fields + selects
├─ Button Group: consecutive buttons
├─ Full-Width: divider
├─ Grid Group 2: more fields
├─ Full-Width: table
└─ Full-Width: divider
```

Each grid group renders as separate `<div style={{ display: 'grid', ... }}>`.

---

## Example: Complete Page Configuration

```json
{
  "pageKey": "contract-search",
  "title": "Contract Search & Details",
  "description": "Search for contracts and view details",
  "tabs": [
    {
      "id": 1,
      "title": "Search",
      "sections": [
        {
          "id": 100,
          "type": "section",
          "name": "Contract Search",
          "layout": { "columns": 2, "gutter": 16 },
          "components": [
            {
              "id": 101,
              "type": "field",
              "name": "contractNumber",
              "label": "Contract #",
              "fieldType": "text",
              "required": true,
              "permissionString": "11",
              "layout": { "offset": 0, "colSpan": 1 }
            },
            {
              "id": 102,
              "type": "field",
              "name": "customerName",
              "label": "Customer",
              "fieldType": "text",
              "required": false,
              "permissionString": "11",
              "layout": { "offset": 0, "colSpan": 1 }
            },
            {
              "id": 103,
              "type": "button",
              "name": "searchBtn",
              "label": "Search",
              "variant": "primary",
              "onClick": "submit",
              "api": {
                "method": "post",
                "url": "/contract/search",
                "successMessage": "Search completed",
                "resetFormOnSuccess": false
              },
              "apiCommon": { "subChannelId": "2", "subServiceId": "1", "traceNo": "" }
            },
            {
              "id": 104,
              "type": "button",
              "name": "resetBtn",
              "label": "Clear",
              "variant": "default",
              "onClick": "reset"
            }
          ]
        },
        {
          "id": 101,
          "type": "section",
          "name": "Results",
          "layout": { "columns": 1, "gutter": 16 },
          "components": [
            {
              "id": 201,
              "type": "table",
              "name": "contractsTable",
              "label": "Contracts",
              "dataUrl": "/contract/list",
              "triggerButtonName": "searchBtn",
              "tableApiCommon": { "subChannelId": "2", "subServiceId": "1", "traceNo": "" },
              "columns": [
                { "label": "Contract #", "dataIndex": "contractNumber", "name": "selectedContractNumber" },
                { "label": "Customer", "dataIndex": "customerName", "name": "selectedCustomer" },
                { "label": "Amount", "dataIndex": "amount", "name": "selectedAmount" }
              ],
              "rowActions": {
                "showSelect": true,
                "selectLabel": "View Details",
                "showDelete": false
              }
            }
          ]
        }
      ]
    },
    {
      "id": 2,
      "title": "Details",
      "sections": [
        {
          "id": 200,
          "type": "section",
          "name": "Selected Contract",
          "layout": { "columns": 2, "gutter": 16 },
          "components": [
            {
              "id": 301,
              "type": "field",
              "name": "selectedContractNumber",
              "label": "Contract #",
              "fieldType": "text",
              "permissionString": "10",  // Read-only
              "layout": { "offset": 0, "colSpan": 1 }
            },
            {
              "id": 302,
              "type": "field",
              "name": "selectedCustomer",
              "label": "Customer",
              "fieldType": "text",
              "permissionString": "10",
              "layout": { "offset": 0, "colSpan": 1 }
            },
            {
              "id": 303,
              "type": "field",
              "name": "selectedAmount",
              "label": "Amount",
              "fieldType": "number",
              "permissionString": "10",
              "layout": { "offset": 0, "colSpan": 1 }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Workflow Summary

### Building a Layout (Editor)
```
1. Create new page (set title, key, description)
2. Add tab
3. Add section to tab (set name, columns, gutter)
4. Add component to section (choose type)
5. Configure component (fill in all details, API endpoints, mappings)
6. Preview
7. Export JSON or Save to backend
8. Publish
```

### Rendering a Layout (Runtime)
```
1. Load JSON config
2. Render tabs
3. For each tab's sections:
   - Organize components into grid/button/full-width groups
   - Render each group
   - Apply permissions (hide/disable)
4. Listen for form changes
5. On button click:
   - Validate
   - Call API
   - Update form/table based on response
6. On table row select:
   - Map row data to form fields
7. On field blur:
   - Call onBlur API if configured
   - Populate related fields
```

---

## Key Features

✅ **Declarative UI**: Define layout entirely in JSON  
✅ **No Hardcoding**: Build complex forms without code  
✅ **Reusable**: Same JSON renders across different environments  
✅ **Permission-Based**: Field-level access control  
✅ **Smart API Integration**: Auto-populate fields, refresh tables, validate on blur  
✅ **Responsive Layout**: CSS Grid based, configurable columns  
✅ **Extensible**: Easy to add new component types  
✅ **Redux Managed**: Centralized state for consistency  
✅ **Rich Components**: Fields, buttons, tables, dropdowns, text, dividers, cards, spacers  

---

## Conclusion

This system separates **layout definition** (JSON) from **layout rendering** (React components), allowing non-developers to create complex UI without touching code. The hierarchical structure (Page → Tabs → Sections → Components) provides flexibility for organizing content, while the permission and API integration systems handle real-world data flow requirements.
