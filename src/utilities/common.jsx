import { BankOutlined } from "@ant-design/icons";
import { Menu } from "lucide-react";

export const nullChecker = (val) => {
    return (
      val == null || 
      (typeof val === 'string' && val.trim().length === 0) ||
      (Array.isArray(val) && val.length === 0) ||
      (val.constructor === Object && Object.keys(val).length === 0)
    );
  };

  export const buildRules = (field) => {
    const rules = [];
  
    if (field.required) {
      rules.push({
        required: true,
        message: field.validation?.message || `${field.label} is required`
      });
    }
  
    if (field.validation) {
      const v = field.validation;
  
      if (v.min !== undefined) {
        rules.push({
          min: v.min,
          message: `${field.label} must be at least ${v.min}`
        });
      }
  
      if (v.max !== undefined) {
        rules.push({
          max: v.max,
          message: `${field.label} must be at most ${v.max}`
        });
      }
  
      if (v.pattern) {
        rules.push({
          pattern: new RegExp(v.pattern),
          message: v.message || `${field.label} is invalid`
        });
      }
    }
  
    return rules;
  };

  export const downloadJSON = (config) => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${config.pageKey || "layout"}.json`;
    link.click();
  };
  

// Helper function to build menu tree from flat menu list
export const buildMenuTree = (menuList) => {
  // Create a map for quick lookup
  const menuMap = {};
  const rootMenus = [];

  // First pass: create all menu items
  menuList.forEach((menu) => {
    menuMap[menu.id] = {
      key: menu.menuAlias,
      label: menu.menuName,
      icon: menu.parentId === 0 ? <BankOutlined /> : <Menu size={16} />,
      children: [],
    };
  });

  // Second pass: build parent-child relationships
  menuList.forEach((menu) => {
    if (menu.parentId === 0) {
      // Root level menu
      rootMenus.push(menuMap[menu.id]);
    } else {
      // Child menu - add to parent's children array
      if (menuMap[menu.parentId]) {
        menuMap[menu.parentId].children.push(menuMap[menu.id]);
      }
    }
  });

  // Sort by priorityId and remove empty children arrays
  const sortMenu = (menus) => {
    return menus
      .sort((a, b) => a.priorityId - b.priorityId)
      .map((menu) => ({
        key: menu.key,
        label: menu.label,
        icon: menu.icon,
        children:
          menu.children.length > 0 ? sortMenu(menu.children) : undefined,
      }))
      .filter((menu) => menu.children || !menu.children); // Remove undefined children
  };

  return sortMenu(rootMenus);
};