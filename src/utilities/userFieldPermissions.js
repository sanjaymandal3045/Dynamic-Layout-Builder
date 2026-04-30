/**
 * Permission Structure:
 * Three-digit code (e.g., "110")
 * - First digit: Read permission (1 = allowed, 0 = denied)
 * - Second digit: Write permission (1 = allowed, 0 = denied)
 * - Third digit: Masking (1 = mask/hide value, 0 = show normally)
 */

export const useFieldPermissions = (permissions = {}) => {
  /**
   * Get permission status for a specific field
   * @param {string} fieldId - The field identifier
   * @returns {Object} - { canRead, canWrite, shouldMask, hasPermission }
   */
  const getFieldPermission = (fieldId) => {
    const permissionCode = permissions[fieldId];

    // If no permission found, return default (full access)
    if (!permissionCode) {
      return {
        canRead: true,
        canWrite: true,
        shouldMask: false,
        hasPermission: false,
      };
    }

    const code = String(permissionCode).padStart(3, "0");
    const [read, write, mask] = code.split("").map(Number);

    return {
      canRead: read === 1,
      canWrite: write === 1,
      shouldMask: mask === 1,
      hasPermission: true,
    };
  };

  /**
   * Determine if a field should be visible
   * @param {string} fieldId - The field identifier
   * @returns {boolean} - True if field should be visible
   */
  const isFieldVisible = (fieldId) => {
    const { canRead } = getFieldPermission(fieldId);
    return canRead;
  };

  /**
   * Determine if a field should be editable
   * @param {string} fieldId - The field identifier
   * @returns {boolean} - True if field should be editable
   */
  const isFieldEditable = (fieldId) => {
    const { canWrite } = getFieldPermission(fieldId);
    return canWrite;
  };

  /**
   * Mask/obfuscate a value if required by permissions
   * @param {*} value - The value to potentially mask
   * @param {string} fieldId - The field identifier
   * @returns {string|*} - Masked value or original value
   */
  const getMaskedValue = (value, fieldId) => {
    const { shouldMask } = getFieldPermission(fieldId);
    if (shouldMask && value) {
      return "***";
    }
    return value;
  };

  /**
   * Render a field with permission-based restrictions
   * Applies disabled state and masking automatically
   * @param {*} children - React children (form field, input, etc.)
   * @param {string} fieldId - The field identifier
   * @param {Object} options - Additional options
   * @returns {React.ReactElement} - Rendered field or null
   */
  const renderWithPermission = (children, fieldId, options = {}) => {
    const { fallback = null, hiddenIfUnreadable = true } = options;
    const { canRead, canWrite } = getFieldPermission(fieldId);

    // If unreadable and should be hidden
    if (!canRead && hiddenIfUnreadable) {
      return fallback;
    }

    // Clone the children and apply disabled state if not writable
    if (!canWrite && children?.props) {
      return React.cloneElement(children, { disabled: true }, children.props.children);
    }

    return children;
  };

  return {
    getFieldPermission,
    isFieldVisible,
    isFieldEditable,
    getMaskedValue,
    renderWithPermission,
  };
};

export default useFieldPermissions;