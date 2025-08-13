import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// JupyterLite configuration interface
export interface JupyterLiteConfig {
  // Core app settings
  appName?: string;
  appVersion?: string;
  baseUrl?: string;
  defaultKernelName?: string;
  
  // Database and storage
  settingsStorageName?: string;
  storageProvider?: 'localforage' | 'memory';
  
  // Theme settings
  theme?: 'light' | 'dark' | 'auto';
  showLoadingIndicator?: boolean;
  
  // Extensions and plugins
  federatedExtensions?: Array<{
    name: string;
    load: string;
    extension?: string;
  }>;
  disabledExtensions?: string[];
  
  // Custom settings
  litePluginSettings?: Record<string, any>;
  settingsOverrides?: Record<string, any>;
  
  // URLs and paths
  faviconUrl?: string;
  licensesUrl?: string;
  
  // Kernel bridge settings
  enableKernelBridge?: boolean;
  kernelBridgeConfig?: {
    exposeToConsole?: boolean;
    enableFileExecution?: boolean;
  };
}

export interface JupyterLiteProps {
  config?: JupyterLiteConfig;
  height?: string | number;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Internal component that handles JupyterLite mounting
const JupyterLiteInternal: React.FC<JupyterLiteProps> = ({
  config = {},
  height = '100vh',
  width = '100%',
  className = '',
  style = {},
  onReady,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeJupyterLite = async () => {
      try {
        // Merge default config with provided config
        const fullConfig: JupyterLiteConfig = {
          appName: 'JupyterLite',
          appVersion: '0.7.0-alpha.1',
          baseUrl: './',
          defaultKernelName: 'python',
          theme: 'light',
          showLoadingIndicator: true,
          enableKernelBridge: true,
          settingsStorageName: `JupyterLite Storage - ${Date.now()}`,
          federatedExtensions: [],
          disabledExtensions: [],
          kernelBridgeConfig: {
            exposeToConsole: true,
            enableFileExecution: true,
          },
          ...config
        };

        console.log('🚀 Initializing JupyterLite with config:', fullConfig);

        if (mounted) {
          setIsLoading(false);
          setInitialized(true);
          onReady?.();
        }
      } catch (err) {
        console.error('Failed to initialize JupyterLite:', err);
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (mounted) {
          setError(error.message);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    initializeJupyterLite();

    return () => {
      mounted = false;
    };
  }, [config, onReady, onError]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  if (error) {
    return (
      <div 
        className={`jupyterlite-error ${className}`}
        style={containerStyle}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '10px' }}>
            Failed to load JupyterLite
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className={`jupyterlite-container ${className}`}
        style={containerStyle}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column'
        }}>
          <div className="jupyterlite-loading-indicator-spinner" />
          <div className="jupyterlite-loading-indicator-text">
            Initializing JupyterLite...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`jupyterlite-container ${className}`}
      style={containerStyle}
      data-notebook="lab"
    >
      <iframe
        src="/lab/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="JupyterLab"
      />
    </div>
  );
};

// Use dynamic import to avoid SSR issues
const JupyterLiteComponent = dynamic(
  () => Promise.resolve(JupyterLiteInternal),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        fontSize: '16px' 
      }}>
        Loading JupyterLite...
      </div>
    )
  }
);

export default JupyterLiteComponent;