import { BankOutlined, MenuOutlined } from "@ant-design/icons";
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
  // Transform the already-structured menu tree from API
  const transformMenu = (menus) => {
    return menus
      .sort((a, b) => a.priorityId - b.priorityId)
      .map((menu) => {
        const item = {
          key: menu.menuAlias,
          label: menu.menuName,
          icon: menu.parentId === 0 ? <BankOutlined /> : <MenuOutlined size={16} />,
        };
        
        // If menu has children, recursively transform them
        if (menu.children && menu.children.length > 0) {
          item.children = transformMenu(menu.children);
        }
        
        return item;
      });
  };

  return transformMenu(menuList);

  // Sort by priorityId and clean up structure
  const sortMenu = (menus) => {
    return menus
      .sort((a, b) => a.priorityId - b.priorityId)
      .map((menu) => {
        const item = {
          key: menu.key,
          label: menu.label,
          icon: menu.icon,
        };
        
        // Only add children if it has children
        if (menu.children && menu.children.length > 0) {
          item.children = sortMenu(menu.children);
        }
        
        return item;
      });
  };

  return sortMenu(rootMenus);
};