# RBS Portal

A modern, responsive React-based application for managing report operations.

---

## 📦 Dependency Breakdown by Category

### Core Dependencies

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| react | ^19.2.1 | React library for building UI | `npm i react` |
| react-dom | ^19.2.1 | React DOM rendering | `npm i react-dom` |
| react-router-dom | ^7.9.5 | Client-side routing | `npm i react-router-dom` |
| react-redux | ^9.2.0 | Redux state management bindings | `npm i react-redux` |

### UI & Styling

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| antd | ^5.28.1 | Ant Design component library | `npm i antd` |
| @ant-design/icons | ^6.1.0 | Ant Design icons | `npm i @ant-design/icons` |
| tailwindcss | ^4.1.17 | Utility-first CSS framework | `npm i tailwindcss` |
| @tailwindcss/vite | ^4.1.17 | Tailwind CSS Vite plugin | `npm i @tailwindcss/vite` |
| @emotion/react | ^11.14.0 | CSS-in-JS styling | `npm i @emotion/react` |
| @emotion/styled | ^11.14.1 | Styled components | `npm i @emotion/styled` |
| lucide-react | ^0.554.0 | Modern icon library | `npm i lucide-react` |
| @mui/material | ^7.3.5 | Material Design components | `npm i @mui/material` |
| @mui/icons-material | ^7.3.5 | Material Design icons | `npm i @mui/icons-material` |
| react-icons | ^5.5.0 | Icon library collection | `npm i react-icons` |
| clsx | ^2.1.1 | Conditional className builder | `npm i clsx` |

### State Management

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| @reduxjs/toolkit | ^2.10.1 | Redux toolkit | `npm i @reduxjs/toolkit` |

### API & HTTP

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| axios | ^1.13.2 | HTTP client for API requests | `npm i axios` |
| axios-retry | ^4.5.0 | Automatic retry logic | `npm i axios-retry` |
| jwt-decode | ^4.0.0 | JWT token decoding | `npm i jwt-decode` |

### Utilities

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| lodash | ^4.17.21 | Utility functions | `npm i lodash` |
| dayjs | ^1.11.19 | Date manipulation | `npm i dayjs` |
| moment | ^2.30.1 | Date library | `npm i moment` |
| uuid | ^13.0.0 | UUID generation | `npm i uuid` |

### Features

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| recharts | ^3.4.1 | Data visualization charts | `npm i recharts` |
| react-pdf | ^10.2.0 | PDF viewer component | `npm i react-pdf` |
| react-dropzone | ^14.3.8 | File upload handler | `npm i react-dropzone` |
| framer-motion | ^12.23.24 | Animation framework | `npm i framer-motion` |

### Development Dependencies

| Package | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| vite | ^7.2.2 | Build tool | `npm i -D vite` |
| @vitejs/plugin-react | ^5.1.0 | React plugin for Vite | `npm i -D @vitejs/plugin-react` |
| eslint | ^9.39.1 | JavaScript linter | `npm i -D eslint` |
| @eslint/js | ^9.39.1 | ESLint configuration | `npm i -D @eslint/js` |
| eslint-plugin-react-hooks | ^5.2.0 | React Hooks ESLint rules | `npm i -D eslint-plugin-react-hooks` |
| eslint-plugin-react-refresh | ^0.4.24 | React Refresh ESLint plugin | `npm i -D eslint-plugin-react-refresh` |
| globals | ^16.5.0 | Global variables | `npm i -D globals` |
| @types/react | ^19.2.2 | React TypeScript types | `npm i -D @types/react` |
| @types/react-dom | ^19.2.2 | React DOM TypeScript types | `npm i -D @types/react-dom` |

---

## 🎯 Quick Start

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port).

**Features:**
- Hot Module Replacement (HMR) - Changes reflect instantly
- Fast refresh - Preserve component state during edits
- Automatic rebuild on file changes

### Production Build

Create an optimized production build:

```bash
npm run build
```

This generates:
- Minified JavaScript bundles
- Optimized CSS files
- Static assets

Output directory: `dist/`

### Preview Build

Preview the production build locally:

```bash
npm run preview
```

This allows you to test the production build before deployment.

### Code Quality

Run ESLint to check code quality:

```bash
npm run lint
```

Checks for:
- Code style violations
- Potential bugs
- React best practices
- Hook dependency issues

---



---

## 🚨 Common Issues & Solutions

### Issue 1: Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 2: Port already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Issue 3: Module not found errors
```bash
# Ensure you're in the project root directory
cd rbs-portal

# Reinstall node_modules
npm install
```

### Issue 4: Build fails
```bash
# Check for ESLint errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

---

## 📚 Key Features Explained

### 1. Dynamic Layout Builder
- Create custom form layouts visually
- Configure fields, buttons, tables, and more
- Bind buttons to tables for data refresh
- No coding required

### 2. State Management
- Redux for global state
- Redux Toolkit for simplified actions and reducers
- Integration with React components via react-redux

### 3. API Integration
- Axios instance with interceptors
- Automatic request/response handling
- JWT token management
- Retry mechanism for failed requests

### 4. Responsive Design
- Tailwind CSS for utility-first styling
- Ant Design for consistent components

---

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `npm run lint` to check code quality
4. Commit with descriptive messages
5. Push and create a Pull Request

---

### Build Errors
- Check Node.js version compatibility
- Review eslint errors with `npm run lint`
- Check vite configuration

---