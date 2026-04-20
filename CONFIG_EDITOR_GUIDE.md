# Config Editor - User Guide

## Overview

The **Config Editor** allows you to fetch an existing page configuration from the backend, edit it using the visual Layout Builder, and save the updated configuration back to the API.

## Features

✅ **Load Any Page Config** - Enter a page key to load its configuration  
✅ **Visual Editing** - Use the full LayoutBuilder to make changes  
✅ **View JSON** - Preview the raw JSON configuration  
✅ **Save Changes** - Post updated config back to `/transaction/execute` API  

---

## How to Use

### Step 1: Open Config Editor

1. Click the **"Edit Page Config"** button in the dashboard header (top-right area)
2. A modal will open with a page key input field

### Step 2: Load Configuration

1. Enter a **Page Key** in the input field (e.g., `branch-info`, `cbs-report`, `contract-search`)
2. Click the **"Load"** button or press Enter
3. The system will:
   - Call API: `POST /transaction/execute`
   - With payload:
     ```json
     {
       "subChannelId": "2",
       "subServiceId": "9",
       "traceNo": "",
       "attributes": { "pageKey": "branch-info" }
     }
     ```
   - Parse the response and load config into Redux state
   - Display the LayoutBuilder editor

### Step 3: Edit Configuration

Once loaded, use the LayoutBuilder to:

- **Add/Remove Tabs** - Click `+` to add, `x` to remove tabs
- **Rename Tabs** - Double-click tab name to edit
- **Add/Remove Sections** - Each tab can have multiple sections
- **Configure Components** - Click component edit icon to open configuration drawer
- **Reorder Components** - Move components up/down within sections
- **Preview** - Click "Preview" button to see how it looks

**Common Tasks:**

| Task | Steps |
|------|-------|
| Add new field | Section → Add Component → Select "field" → Configure name, label, type |
| Add button with API | Add Component → Select "button" → Set name, label, API URL, method, apiCommon |
| Add table | Add Component → Select "table" → Set dataUrl, columns, row actions |
| Change field permissions | Edit component → Change permissionString (e.g., "11" = full access, "10" = read-only) |

### Step 4: View JSON (Optional)

Click **"View JSON"** to see the raw JSON configuration. You can:
- Copy the JSON for backup
- Paste updated JSON
- Verify structure before saving

### Step 5: Save Configuration

1. Click **"Save Configuration"** button
2. The system will:
   - Collect the updated config from Redux state
   - Send to API: `POST /transaction/execute`
   - With payload:
     ```json
     {
       "subChannelId": "2",
       "subServiceId": "9",
       "traceNo": "",
       "attributes": {
         "pageKey": "branch-info",
         "pageConfig": { ...your updated config... }
       }
     }
     ```
   - Show success/error message
   - Close modal on success

3. The configuration is now saved in the backend and will be loaded when users access that page

---

## API Integration Details

### Fetch Config Request

```
POST /transaction/execute

Body:
{
  "subChannelId": "2",
  "subServiceId": "9",
  "traceNo": "",
  "attributes": {
    "pageKey": "branch-info"
  }
}
```

### Fetch Config Response

```
{
  "success": true,
  "message": "Transaction successful",
  "data": {
    "txnStatus": 0,
    "errorCode": "RBS-000",
    "errorMessage": "Page retrieved successfully.",
    "attributes": {
      "pageConfig": {
        "pageKey": "branch-info",
        "title": "Branch Information",
        "description": "...",
        "tabs": [ ... ]
      }
    }
  }
}
```

### Save Config Request

```
POST /transaction/execute

Body:
{
  "subChannelId": "2",
  "subServiceId": "9",
  "traceNo": "",
  "attributes": {
    "pageKey": "branch-info",
    "pageConfig": {
      "pageKey": "branch-info",
      "title": "Branch Information",
      "tabs": [ ... (updated config) ... ]
    }
  }
}
```

### Expected Save Response

```
{
  "success": true,
  "message": "Transaction successful",
  "data": {
    "txnStatus": 0,
    "errorCode": "RBS-000",
    "errorMessage": "Configuration saved successfully."
  }
}
```

---

## Workflow Example: Edit Branch Info Page

### Scenario
You want to add a new field to the "Branch Info" page.

### Steps

1. **Open Config Editor**
   - Click "Edit Page Config" button

2. **Load Configuration**
   - Enter: `branch-info`
   - Click "Load"
   - Wait for config to load

3. **Edit**
   - Tab: "Tab 1" is already open
   - Section: "Branch Info" exists
   - Click "Add Component"
   - Select "field"
   - Click edit icon
   - Configure:
     - name: `BranchStatus`
     - label: `Branch Status`
     - fieldType: `text`
     - permissionString: `111`
   - Save component

4. **Preview** (Optional)
   - Click "Preview" button to see changes
   - Click "Back to Editor" to continue editing

5. **Save**
   - Click "Save Configuration"
   - Confirm success message
   - Modal closes

6. **Result**
   - New field now available on Branch Info page
   - Users see new field when page loads

---

## Permission String Reference

When editing components, you can set `permissionString` to control visibility and editability:

| Value | Read | Write | Mask | Behavior |
|-------|------|-------|------|----------|
| `11` | ✓ | ✓ | ✗ | Fully editable, visible |
| `10` | ✓ | ✗ | ✗ | Read-only (lock icon shown) |
| `00` | ✗ | ✗ | ✗ | Hidden (not rendered) |
| `111` | ✓ | ✓ | ✓ | Editable + can be masked |

---

## Troubleshooting

### Issue: "Invalid configuration format received"

**Cause**: API response doesn't contain `pageConfig` in `attributes`

**Solution**: 
- Verify page key exists
- Check API is returning correct response format
- Ensure `subChannelId`, `subServiceId` are correct

### Issue: "Failed to save configuration"

**Cause**: Backend rejected the config or validation failed

**Solution**:
- Check all required fields are filled (button name, API URL, table columns)
- Verify API endpoints are correct
- Check field mappings are valid (for buttons and tables)
- Review error message for specific issue

### Issue: Changes not appearing in page

**Cause**: Page might be cached by browser or API

**Solution**:
- Refresh page (F5 or Ctrl+R)
- Clear browser cache
- Try accessing page in incognito/private mode
- Verify save was successful (check message)

---

## Best Practices

1. **Test Before Saving** - Use Preview mode to test changes
2. **Backup JSON** - Click "View JSON" and save a copy before making major changes
3. **Validate Fields** - Ensure all component names are unique within a section
4. **Check Permissions** - Verify permission strings are set correctly
5. **API URLs** - Double-check API endpoints before saving
6. **Required Fields** - Mark important fields as required in configuration

---

## Code Implementation Details

### File Structure

```
src/components/LayoutBuilder/
├── ConfigEditorModal.jsx     ← Main modal component
├── LayoutBuilder.jsx         ← Editor (loaded inside modal)
├── LayoutPreview.jsx         ← Preview renderer
├── ComponentRenderer.jsx      ← Individual component rendering
├── ComponentConfigDrawer.jsx  ← Component settings modal
└── ...
```

### How It Works (Behind the Scenes)

```
User clicks "Edit Page Config"
    ↓
ConfigEditorModal opens
    ↓
User enters pageKey & clicks Load
    ↓
ConfigEditorModal calls API (/transaction/execute)
    ↓
Parse response, extract pageConfig
    ↓
dispatch(setConfig(pageConfig)) → Redux
    ↓
LayoutBuilder renders with loaded config
    ↓
User makes edits (dispatches Redux actions: addComponent, saveComponentConfig, etc.)
    ↓
Redux state updates
    ↓
User clicks "Save Configuration"
    ↓
ConfigEditorModal sends API request with updated config
    ↓
API saves config to backend
    ↓
Success message, modal closes
```

---

## API Endpoint Configuration

The Config Editor uses these hardcoded values:

```javascript
subChannelId: "2"
subServiceId: "9"
traceNo: ""
```

**To change these values**, edit `ConfigEditorModal.jsx`:

```javascript
const saveParams = {
  subChannelId: "2",        // ← Change here
  subServiceId: "9",        // ← Change here
  traceNo: "",              // ← Change here
  attributes: { ... }
};
```

---

## Limitations & Future Improvements

**Current Limitations:**
- No draft/version history
- No rollback if save fails
- Cannot compare old vs new config
- No field validation rules editor
- No conditional rendering editor

**Future Enhancements:**
- Version history with rollback
- Config diff viewer
- Drag-drop field reordering
- Advanced validation UI
- Export/import configs
- Config templates

---

## Quick Reference

| Action | Keyboard | Button |
|--------|----------|--------|
| Load config | Enter | Load |
| Save config | - | Save Configuration |
| Close modal | Esc | Close |
| Preview | - | Preview |
| View JSON | - | View JSON |
| Edit component | - | Click component edit icon |

