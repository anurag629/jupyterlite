import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { JupyterLiteConfig } from '../components/JupyterLiteComponent';

// Dynamically import JupyterLiteComponent to avoid SSR issues
const JupyterLiteComponent = dynamic(
  () => import('../components/JupyterLiteComponent'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Initializing JupyterLite...
      </div>
    )
  }
);

const JupyterLabPage: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // JupyterLite configuration
  const jupyterConfig: JupyterLiteConfig = {
    // Basic app configuration
    appName: 'DataWars JupyterLite',
    appVersion: '0.7.0-alpha.1',
    defaultKernelName: 'python',
    
    // Storage configuration - unique per user/session
    settingsStorageName: `DataWars-JupyterLite-${Date.now()}`,
    
    // Theme configuration
    theme: 'auto', // Will detect system preference or stored preference
    showLoadingIndicator: true,
    
    // Enable kernel bridge for console access
    enableKernelBridge: true,
    kernelBridgeConfig: {
      exposeToConsole: true,
      enableFileExecution: true,
    },
    
    // Extension configuration
    federatedExtensions: [
      // Add any custom extensions here
    ],
    
    // Custom plugin settings
    litePluginSettings: {
      // Configure specific plugins if needed
      '@jupyterlab/apputils-extension:themes': {
        theme: 'JupyterLab Light'
      }
    },
    
    // Settings overrides
    settingsOverrides: {
      '@jupyterlab/notebook-extension:tracker': {
        kernelPreference: {
          name: 'python',
          language: 'python'
        }
      }
    }
  };

  const handleJupyterReady = () => {
    console.log('🚀 JupyterLite is ready!');
    console.log('You can now use the kernel bridge from the browser console:');
    console.log('- jupyter.exec("print(\'Hello from console!\')")');
    console.log('- jupyter.listOpenFiles()');
    console.log('- jupyter.install("pandas")');
    
    setIsReady(true);
  };

  const handleJupyterError = (error: Error) => {
    console.error('❌ JupyterLite failed to load:', error);
    setError(error.message);
  };

  return (
    <>
      <Head>
        <title>DataWars JupyterLite - Lab Interface</title>
        <meta name="description" content="JupyterLite Lab interface integrated with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* JupyterLite styles will be included via component */}
        
        {/* Additional JupyterLab theme styles if available */}
        <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          
          #__next {
            height: 100%;
          }
          
          .page-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          /* JupyterLite Component Styles */
          .jupyterlite-container {
            position: relative;
            overflow: hidden;
            background-color: #fff;
            color: #000;
            transition: background-color 0.3s ease;
          }

          .jupyterlite-container.jp-mod-dark {
            background-color: #111;
            color: #fff;
          }

          .jupyterlite-loading-indicator-spinner {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border: 6px solid rgba(0, 0, 0, 0.1);
            border-top: 6px solid #FFDC00;
            border-radius: 50%;
            animation: jupyter-spin 1s linear infinite;
          }

          .jupyterlite-loading-indicator-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            font-size: 16px;
            color: #000000;
          }

          @keyframes jupyter-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .jupyter-header {
            background: #fff;
            border-bottom: 1px solid #e0e0e0;
            padding: 8px 16px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 40px;
            z-index: 1001;
          }
          
          .jupyter-header.dark {
            background: #1a1a1a;
            border-bottom-color: #333;
            color: #fff;
          }
          
          .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4caf50;
          }
          
          .status-dot.loading {
            background: #ff9800;
            animation: pulse 1.5s infinite;
          }
          
          .status-dot.error {
            background: #f44336;
          }
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </Head>

      <div className="page-container">
        {/* Optional: Add a header with status information */}
        <header className="jupyter-header">
          <div>
            <strong>DataWars JupyterLite</strong>
            <span style={{ marginLeft: '12px', opacity: 0.7 }}>
              Jupyter Lab Interface
            </span>
          </div>
          
          <div className="status-indicator">
            <div 
              className={`status-dot ${error ? 'error' : isReady ? '' : 'loading'}`}
              title={
                error 
                  ? 'Error loading JupyterLite' 
                  : isReady 
                    ? 'JupyterLite ready' 
                    : 'Loading JupyterLite...'
              }
            />
            <span>
              {error ? 'Error' : isReady ? 'Ready' : 'Loading...'}
            </span>
          </div>
        </header>

        {/* JupyterLite Component */}
        <JupyterLiteComponent
          config={jupyterConfig}
          height="calc(100vh - 40px)" // Account for header height
          width="100%"
          onReady={handleJupyterReady}
          onError={handleJupyterError}
          style={{ flex: 1 }}
        />
      </div>
    </>
  );
};

export default JupyterLabPage;