# JupyterLite Next.js Integration - Complete Development Environment

This is a **complete, standalone JupyterLite development environment** integrated with Next.js. All JupyterLite source code, packages, and dependencies are included - no parent directory dependencies.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Yarn (recommended) or npm

### One-Time Setup
```bash
# 1. Install all dependencies (Next.js + JupyterLite)
yarn install

# 2. Bootstrap JupyterLite packages
yarn install:jupyter

# 3. Install Python dependencies
yarn install:py

# 4. Build JupyterLite packages
yarn build:jupyter

# 5. Start Next.js development server
yarn dev

# 6. Visit http://localhost:3000/lab
```

## 📁 Project Structure

```
nextjs-integration/                    # ← Complete standalone environment
├── components/
│   └── JupyterLiteComponent.tsx       # React component for JupyterLite
├── pages/
│   └── lab.tsx                        # Example usage page
├── utils/
│   └── jupyterlite-loader.ts          # Dynamic loading logic
├── styles/
│   └── jupyterlite.css                # Component styles
│
├── packages/                          # ← JupyterLite TypeScript packages
│   ├── kernel/                        # Kernel bridge functionality  
│   ├── application/
│   ├── contents/
│   ├── server/
│   └── ...                            # All other packages
│
├── app/                               # ← JupyterLite applications
│   ├── lab/                           # Lab interface
│   ├── notebooks/                     # Notebook interface
│   ├── repl/                          # REPL interface
│   └── ...
│
├── py/                                # ← Python components
│   ├── jupyterlite-core/
│   └── jupyterlite/
│
└── [Next.js config files]
```

## 🔧 Development Commands

### Core Development
```bash
# Start integrated development (JupyterLite + Next.js)
yarn dev:jupyter          # Watch JupyterLite + Next.js dev server

# Standard Next.js development
yarn dev                  # Next.js only (requires JupyterLite pre-built)
```

### JupyterLite Development
```bash
# Build JupyterLite packages
yarn build:jupyter        # Build all packages and applications

# Watch mode for JupyterLite
yarn watch:jupyter        # Auto-rebuild on source changes

# Clean builds
yarn clean:jupyter        # Clean JupyterLite builds
yarn clean                # Clean everything (.next + JupyterLite)
```

### Linting and Formatting
```bash
yarn lint:jupyter         # Lint JupyterLite TypeScript
yarn prettier:fix         # Format all code
yarn eslint:fix           # Fix ESLint issues
```

## 🎯 Development Workflow

### 1. Modify JupyterLite Source
Edit TypeScript files in `packages/` or `app/`:
```bash
# Example: Modify kernel bridge
code packages/kernel/src/bridge.ts

# Example: Modify React component integration  
code components/JupyterLiteComponent.tsx
```

### 2. Watch Mode Development
```bash
# Start watch mode for instant rebuilds
yarn dev:jupyter
```

### 3. Test Changes
- Visit `http://localhost:3000/lab`
- Open browser console to test kernel bridge
- Changes auto-rebuild and reload

## 🧪 Testing the Integration

### Browser Console API
```javascript
// Test kernel bridge functionality
jupyter.exec("print('Hello from integrated JupyterLite!')")
jupyter.listOpenFiles()
jupyter.install("pandas")
```

### React Component Usage
```tsx
// In your Next.js pages
import JupyterLiteComponent from '@/components/JupyterLiteComponent';

<JupyterLiteComponent
  config={{
    theme: 'dark',
    enableKernelBridge: true,
    settingsStorageName: 'my-integrated-app'
  }}
  height="600px"
  onReady={() => console.log('Ready!')}
/>
```

## 🏗️ Build Process

The integrated environment uses **Lerna workspaces** and **Yarn workspaces**:

1. **Packages**: TypeScript packages in `packages/` build to `packages/*/lib/`
2. **Applications**: App bundles in `app/*/build/` 
3. **Next.js**: Serves everything through its dev server
4. **Integration**: React component loads built JupyterLite assets

## 🔄 Key Benefits

### ✅ **Complete Development Environment**
- Edit JupyterLite source code directly
- Instant rebuilds with watch mode
- Full debugging capabilities
- No external dependencies

### ✅ **Hot Reload Development**
- TypeScript changes rebuild automatically
- Next.js hot reload for React components
- Integrated development experience

### ✅ **Kernel Bridge Integration**
- Browser console access to Python kernels
- File-based execution across notebooks
- Custom kernel bridge enhancements

### ✅ **Production Ready**
- Built assets optimized for production
- Self-contained deployment
- All dependencies included

## 🚨 Troubleshooting

### **Packages not building**
```bash
yarn clean:jupyter && yarn install:jupyter && yarn build:jupyter
```

### **Next.js not finding assets**
```bash
yarn build:jupyter  # Ensure JupyterLite is built first
```

### **Python kernel issues**
```bash
yarn install:py    # Reinstall Python dependencies
```

### **Dependency issues**
```bash
yarn clean && yarn install && yarn setup
```

## 📚 Advanced Usage

### Custom Extensions
Add custom JupyterLite extensions in `packages/`:
```bash
mkdir packages/my-extension
# Develop your extension
yarn build:jupyter
```

### Python Kernels
Install additional Python packages:
```bash
pip install matplotlib pandas numpy
# They'll be available in your JupyterLite kernels
```

### Multiple Environments
Run different configurations:
```tsx
<JupyterLiteComponent 
  config={{ settingsStorageName: 'env-production' }} 
/>
<JupyterLiteComponent 
  config={{ settingsStorageName: 'env-testing' }} 
/>
```

This is now a **complete, standalone JupyterLite development environment** with Next.js integration!