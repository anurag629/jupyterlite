# JupyterLite Next.js Integration

This project demonstrates how to integrate JupyterLite as a React component within a Next.js application, providing a powerful way to embed Jupyter notebooks and Python execution capabilities directly in your web application.

## Features

- 🚀 **React Component**: JupyterLite as a configurable React component
- ⚡ **Next.js Integration**: Full Next.js support with SSR/SSG compatibility  
- 🎨 **Configurable**: Theme, storage, extensions via props
- 🌉 **Kernel Bridge**: Browser console access to Python kernels
- 📱 **Responsive**: Mobile-friendly design
- 🔧 **TypeScript**: Full type safety and IntelliSense

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.12+
- JupyterLite built in parent directory

### Installation

```bash
# Install Next.js dependencies
npm install

# Build JupyterLite and copy assets locally
npm run build:jupyter

# Start development server  
npm run dev
```

Visit `http://localhost:3000/lab` to see JupyterLite running in Next.js!

## Usage

### Basic Component Usage

```tsx
import JupyterLiteComponent from '@/components/JupyterLiteComponent';

function MyPage() {
  return (
    <JupyterLiteComponent
      config={{
        theme: 'dark',
        defaultKernelName: 'python',
        settingsStorageName: 'my-app-jupyter',
        enableKernelBridge: true
      }}
      height="600px"
      onReady={() => console.log('Jupyter is ready!')}
    />
  );
}
```

### Configuration Options

The `JupyterLiteConfig` interface provides extensive customization:

```tsx
interface JupyterLiteConfig {
  // Basic app settings
  appName?: string;
  defaultKernelName?: string;
  theme?: 'light' | 'dark' | 'auto';
  
  // Storage configuration
  settingsStorageName?: string;
  storageProvider?: 'localforage' | 'memory';
  
  // Extensions
  federatedExtensions?: Array<{name: string; load: string}>;
  disabledExtensions?: string[];
  
  // Kernel bridge
  enableKernelBridge?: boolean;
  kernelBridgeConfig?: {
    exposeToConsole?: boolean;
    enableFileExecution?: boolean;
  };
}
```

### Browser Console API

When `enableKernelBridge` is true, you can interact with Python kernels from the browser console:

```javascript
// Execute Python code
await jupyter.exec("print('Hello from console!')")

// Execute in specific notebook file  
await jupyter.execInFile("analysis.ipynb", "import pandas as pd")

// Install packages
await jupyter.install("matplotlib")

// List open files
jupyter.listOpenFiles()
```

## Project Structure

```
nextjs-integration/
├── components/
│   └── JupyterLiteComponent.tsx    # Main React component
├── utils/
│   └── jupyterlite-loader.ts       # Dynamic loading logic
├── styles/
│   └── jupyterlite.css             # Component styles  
├── pages/
│   └── lab.tsx                     # Example lab page
├── package.json
├── next.config.js                  # Next.js configuration
└── tsconfig.json                   # TypeScript configuration
```

## Development Workflow

### 1. Modify JupyterLite Source
Make changes to the main JupyterLite codebase in the parent directory.

### 2. Rebuild and Copy Assets
```bash
npm run build:jupyter  # Builds JupyterLite and copies assets locally
```

### 3. Update Next.js Integration
Modify the React component or configuration as needed.

### 4. Test Integration
```bash
npm run dev
```

### Available Commands
- `npm run copy-assets` - Copy assets from parent directory (without building)
- `npm run build:jupyter` - Build JupyterLite in parent directory and copy assets
- `npm run clean` - Remove all copied assets and Next.js build files

## Configuration Deep Dive

### Theme Configuration
```tsx
<JupyterLiteComponent
  config={{
    theme: 'auto',  // Respects system preference
    // OR
    theme: 'dark',  // Force dark mode
    // OR  
    theme: 'light', // Force light mode
  }}
/>
```

### Storage Configuration
```tsx
<JupyterLiteComponent
  config={{
    // Unique storage per user/session
    settingsStorageName: `jupyter-${userId}`,
    // Choose storage provider
    storageProvider: 'localforage', // or 'memory'
  }}
/>
```

### Extension Configuration
```tsx
<JupyterLiteComponent
  config={{
    federatedExtensions: [
      { name: '@my/extension', load: 'remoteEntry.js' }
    ],
    disabledExtensions: ['@jupyterlab/some-extension'],
  }}
/>
```

## Production Deployment

### 1. Build Process
```bash
npm run build:jupyter  # Build JupyterLite assets
npm run build          # Build Next.js app
npm start              # Start production server
```

### 2. Static Asset Serving
Ensure JupyterLite assets are served correctly:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      { source: '/build/:path*', destination: '/jupyterlite/build/:path*' },
      { source: '/extensions/:path*', destination: '/jupyterlite/extensions/:path*' },
    ];
  },
};
```

### 3. Environment Configuration
```bash
# .env.local
JUPYTER_LITE_BASE_URL=https://your-domain.com
JUPYTER_LITE_WS_URL=wss://your-domain.com
```

## Troubleshooting

### Common Issues

**JupyterLite not loading:**
- Ensure JupyterLite assets are built: `npm run build:jupyter`
- Check browser console for module loading errors
- Verify asset paths in `next.config.js`

**Kernel bridge not working:**
- Confirm `enableKernelBridge: true` in config
- Check that JupyterLab application is fully loaded
- Open browser console to see initialization messages

**Theme not applying:**
- Ensure CSS is properly imported
- Check that container has correct theme classes
- Verify IndexedDB storage permissions

**Mobile/responsive issues:**
- JupyterLite is desktop-focused; consider mobile alternatives
- Use responsive breakpoints for different layouts
- Test on various screen sizes

### Performance Optimization

**Lazy Loading:**
```tsx
const JupyterLiteComponent = dynamic(
  () => import('@/components/JupyterLiteComponent'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);
```

**Code Splitting:**
Use dynamic imports for large JupyterLite modules to improve initial load times.

**Caching:**
Configure appropriate cache headers for JupyterLite assets in production.

## Examples

### Multiple Instances
```tsx
function MultipleNotebooks() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <JupyterLiteComponent 
        config={{ settingsStorageName: 'notebook-1' }}
        height="400px"
      />
      <JupyterLiteComponent 
        config={{ settingsStorageName: 'notebook-2' }}
        height="400px"
      />
    </div>
  );
}
```

### Custom Loading State
```tsx
function CustomJupyter() {
  const [status, setStatus] = useState('loading');
  
  return (
    <div>
      {status === 'loading' && <CustomLoadingSpinner />}
      <JupyterLiteComponent
        onReady={() => setStatus('ready')}
        onError={() => setStatus('error')}
        style={{ display: status === 'loading' ? 'none' : 'block' }}
      />
    </div>
  );
}
```

## Contributing

1. Make changes to JupyterLite source in parent directory
2. Update React integration code as needed
3. Test thoroughly with `npm run dev`
4. Submit PR with clear description of changes

## License

BSD-3-Clause (same as JupyterLite)