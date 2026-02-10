import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  employeeId: null,
  fullName: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  isAuthenticated: false,
  initializing: true, // Track if auth state is being restored from localStorage
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set initializing state
    setInitializing: (state, action) => {
      state.initializing = action.payload;
    },

    loginUser: (state, action) => {
      const {
        employeeId,
        fullName,
        accessToken,
        refreshToken,
        roles,
        tokenType,
      } = action.payload;

      state.employeeId = employeeId;
      state.fullName = fullName;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.roles = roles || [];
      state.tokenType = tokenType || "Bearer";
      state.user = {
        employeeId,
        fullName,
        roles,
      };
      state.isAuthenticated = true;
      state.initializing = false;
    },

    logoutUser: (state) => {
      state.user = null;
      state.employeeId = null;
      state.fullName = null;
      state.roles = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.isAuthenticated = false;
      state.initializing = false;

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("roles");
    },

    // Action to restore auth state from localStorage on app startup
    restoreAuthState: (state) => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const employeeId = localStorage.getItem("employeeId");
      const fullName = localStorage.getItem("fullName");
      const rolesStr = localStorage.getItem("roles");
      const roles = rolesStr ? JSON.parse(rolesStr) : [];

      if (accessToken && employeeId) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.employeeId = employeeId;
        state.fullName = fullName;
        state.roles = roles;
        state.tokenType = "Bearer";
        state.user = {
          employeeId,
          fullName,
          roles,
        };
        state.isAuthenticated = true;
      }

      // Mark initialization as complete
      state.initializing = false;
    },

    // Action to update token after refresh
    refreshTokenSuccess: (state, action) => {
      const { accessToken, refreshToken } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      // Update localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
  },
});

export const {
  loginUser,
  logoutUser,
  restoreAuthState,
  refreshTokenSuccess,
  setInitializing,
} = authSlice.actions;
export default authSlice.reducer;