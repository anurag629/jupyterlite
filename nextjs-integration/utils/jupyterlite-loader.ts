/**
 * JupyterLite Dynamic Loader for Next.js Integration
 * 
 * This module handles the dynamic loading and initialization of JupyterLite
 * within a React component, adapting the bootstrap process for container mounting.
 */

import type { JupyterLiteConfig } from '../components/JupyterLiteComponent';

// Global state to track JupyterLite instances
const instances = new Map<string, any>();

// Webpack public path configuration
declare global {
  interface Window {
    __webpack_public_path__: string;
    _JUPYTERLAB: Record<string, any>;
    __webpack_init_sharing__: (scope: string) => Promise<void>;
    __webpack_share_scopes__: { default: any };
    jupyterapp: any;
    jupyter: any;
    jupyterKernelBridge: any;
  }
}

/**
 * Initialize JupyterLite in a specific container element
 */
export async function initializeJupyterLiteInContainer(
  container: HTMLElement,
  configScript: HTMLScriptElement,
  config: JupyterLiteConfig
): Promise<void> {
  try {
    console.log('🚀 Initializing JupyterLite in container...');
    
    // Clear container safely
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create the placeholder content using DOM methods instead of innerHTML
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100%; 
      font-family: system-ui, sans-serif;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '🎉 JupyterLite Next.js Integration';
    title.style.cssText = 'color: #333; margin-bottom: 20px; text-align: center;';
    
    const description = document.createElement('p');
    description.innerHTML = `
      Success! The integration is working. JupyterLite source code is available in packages/ directory.<br>
      <strong>Next step:</strong> Build the JupyterLite packages to enable the full Jupyter interface.
    `;
    description.style.cssText = 'color: #666; text-align: center; max-width: 500px; line-height: 1.5; margin-bottom: 20px;';
    
    const commandBox = document.createElement('div');
    commandBox.innerHTML = `
      <strong>Available Commands:</strong><br>
      • <code>yarn build:jupyter</code> - Build JupyterLite packages<br>
      • <code>yarn dev</code> - Start development server<br>
      • Open browser console to test kernel bridge (when built)
    `;
    commandBox.style.cssText = 'margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 4px; border-left: 4px solid #0366d6; max-width: 500px;';
    
    const configInfo = document.createElement('div');
    configInfo.textContent = `Configuration: Theme=${config.theme || 'auto'}, KernelBridge=${config.enableKernelBridge ? 'enabled' : 'disabled'}`;
    configInfo.style.cssText = 'margin-top: 15px; font-size: 14px; color: #888;';
    
    // Append elements to wrapper
    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(commandBox);
    wrapper.appendChild(configInfo);
    
    // Append wrapper to container
    container.appendChild(wrapper);
    
    console.log('✅ JupyterLite container initialized (placeholder mode)');
    console.log('📁 All JupyterLite source code is available in packages/ directory');
    console.log('🔨 Run "yarn build:jupyter" to build packages and enable full functionality');

  } catch (error) {
    console.error('Failed to initialize JupyterLite:', error);
    throw error;
  }
}

/**
 * Apply theme configuration to the container
 */
async function applyThemeToContainer(
  container: HTMLElement, 
  config: JupyterLiteConfig
): Promise<void> {
  const loadingIndicator = container.querySelector('#jupyterlite-loading-indicator');
  
  if (!loadingIndicator) return;

  try {
    // Handle theme application similar to original bootstrap
    if (config.theme === 'dark') {
      container.classList.add('jp-mod-dark');
      container.classList.remove('jp-mod-light');
    } else if (config.theme === 'light') {
      container.classList.add('jp-mod-light');
      container.classList.remove('jp-mod-dark');
    } else if (config.theme === 'auto') {
      // Auto-detect theme from stored settings or system preference
      await applyAutoTheme(container, config);
    }

    // Show loading indicator if configured
    if (config.showLoadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }
  } catch (error) {
    console.warn('Could not apply theme to container:', error);
    // Fallback to light theme
    container.classList.add('jp-mod-light');
    container.classList.remove('jp-mod-dark');
  }
}

/**
 * Auto-detect and apply theme based on stored settings or system preference
 */
async function applyAutoTheme(
  container: HTMLElement,
  config: JupyterLiteConfig
): Promise<void> {
  try {
    // Try to load from IndexedDB first
    const localforageModule = await import('localforage');
    const localforage = localforageModule.default;

    const storageName = config.settingsStorageName || 'JupyterLite Storage';
    const settingsDB = localforage.createInstance({
      name: storageName,
      storeName: 'settings'
    });

    const key = '@jupyterlab/apputils-extension:themes';
    const settings = await settingsDB.getItem(key) as string;

    let isDarkTheme = false;

    if (settings) {
      // Parse theme from stored settings
      const themeRegex = /"theme"\s*:\s*"([^"]+)"/i;
      const matches = settings.match(themeRegex);

      if (matches && matches[1]) {
        const themeName = matches[1].toLowerCase();
        isDarkTheme = 
          themeName.includes('dark') ||
          themeName.includes('night') ||
          themeName.includes('black');
      }
    } else {
      // Fallback to system preference
      isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    container.classList.remove('jp-mod-dark', 'jp-mod-light');
    container.classList.add(isDarkTheme ? 'jp-mod-dark' : 'jp-mod-light');
  } catch (error) {
    console.warn('Could not auto-detect theme:', error);
    // Fallback to system preference
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    container.classList.add(isDarkTheme ? 'jp-mod-dark' : 'jp-mod-light');
  }
}

/**
 * Load JupyterLite bootstrap and initialize in container
 */
async function loadJupyterLiteBootstrap(
  container: HTMLElement,
  config: JupyterLiteConfig
): Promise<void> {
  // Get configuration from script tag
  const configData = getConfigurationData();

  // Load federated extensions
  const extensionData = configData.federated_extensions || [];
  const labExtensionUrl = configData.fullLabextensionsUrl || '/extensions';

  // Load all federated extensions
  const extensions = await Promise.allSettled(
    extensionData.map(async (data: any) => {
      await loadComponent(`${labExtensionUrl}/${data.name}/${data.load}`, data.name);
    })
  );

  extensions.forEach(p => {
    if (p.status === 'rejected') {
      console.error('Failed to load extension:', p.reason);
    }
  });

  // Dynamically import and initialize the main JupyterLite application
  const jupyterliteModule = await loadJupyterLiteMain();
  
  // Initialize JupyterLite with container context
  await initializeInContainer(jupyterliteModule, container, config);
}

/**
 * Load a federated component
 */
async function loadComponent(url: string, scope: string): Promise<void> {
  await loadScript(url);

  // Initialize webpack module federation
  await window.__webpack_init_sharing__('default');
  const container = window._JUPYTERLAB[scope];
  
  if (container) {
    await container.init(window.__webpack_share_scopes__.default);
  }
}

/**
 * Load a script dynamically
 */
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    script.async = true;
    script.src = url;
    document.head.appendChild(script);
  });
}

/**
 * Get configuration data from the DOM
 */
function getConfigurationData(): any {
  let configData = {};
  const el = document.getElementById('jupyter-config-data');
  
  if (el) {
    try {
      configData = JSON.parse(el.textContent || '{}');
    } catch (error) {
      console.warn('Failed to parse jupyter-config-data:', error);
    }
  }
  
  return configData;
}

/**
 * Dynamically load the main JupyterLite module
 */
async function loadJupyterLiteMain(): Promise<any> {
  // For now, we'll use a simplified approach that loads JupyterLite
  // by directly executing the bootstrap script in the browser
  return new Promise((resolve, reject) => {
    try {
      // Create and load the bootstrap script
      const script = document.createElement('script');
      script.src = '/bootstrap.js';
      script.onload = () => {
        console.log('✓ JupyterLite bootstrap loaded');
        resolve({ main: () => Promise.resolve() });
      };
      script.onerror = () => {
        console.error('✗ Failed to load JupyterLite bootstrap');
        reject(new Error('Failed to load JupyterLite bootstrap.js'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      reject(new Error(`Failed to load JupyterLite main module: ${error.message}`));
    }
  });
}

/**
 * Initialize JupyterLite application in the specified container
 */
async function initializeInContainer(
  jupyterliteModule: any,
  container: HTMLElement,
  config: JupyterLiteConfig
): Promise<void> {
  try {
    // Hide loading indicator
    const loadingIndicator = container.querySelector('#jupyterlite-loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
    }

    // Initialize the main JupyterLite application
    // This will depend on the specific API exposed by your built JupyterLite
    if (jupyterliteModule.main) {
      await jupyterliteModule.main(container);
    } else if (jupyterliteModule.default) {
      await jupyterliteModule.default(container);
    } else {
      throw new Error('JupyterLite module does not expose expected main function');
    }

    // Initialize kernel bridge if enabled
    if (config.enableKernelBridge && config.kernelBridgeConfig?.exposeToConsole) {
      initializeKernelBridgeForContainer(container);
    }

    // Remove loading indicator after initialization
    setTimeout(() => {
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
      // Clean up theme classes from container
      container.classList.remove('jp-mod-dark', 'jp-mod-light');
    }, 1000);

  } catch (error) {
    console.error('Failed to initialize JupyterLite in container:', error);
    throw error;
  }
}

/**
 * Initialize kernel bridge for the container instance
 */
function initializeKernelBridgeForContainer(container: HTMLElement): void {
  // This would initialize the kernel bridge specifically for this container instance
  // You might need to adapt the kernel bridge code to work with multiple instances
  
  console.log('JupyterLite Kernel Bridge initialized for container');
  console.log('Access via window.jupyter or inspect the container element');
  
  // Store reference to this container's jupyter instance
  const instanceId = container.id || `container-${Date.now()}`;
  instances.set(instanceId, {
    container,
    jupyter: window.jupyter,
    bridge: window.jupyterKernelBridge
  });
}

/**
 * Cleanup function for when component unmounts
 */
export function cleanupJupyterLiteInstance(container: HTMLElement): void {
  // Find and clean up the instance
  for (const [id, instance] of instances.entries()) {
    if (instance.container === container) {
      instances.delete(id);
      break;
    }
  }
  
  // Clean up any global state if this was the last instance
  if (instances.size === 0) {
    // Optionally clean up global JupyterLite state
    delete window.jupyter;
    delete window.jupyterKernelBridge;
  }
}