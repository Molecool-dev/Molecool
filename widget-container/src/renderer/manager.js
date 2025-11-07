/**
 * Widget Manager UI Script
 * Handles the user interface for managing widgets
 */

// This will be populated in later tasks when widget management is implemented
document.addEventListener('DOMContentLoaded', () => {
  console.log('Widget Manager loaded');
  console.log('window.managerAPI available:', !!window.managerAPI);
  
  // Load installed widgets
  loadWidgets();
  
  // Listen for widget state changes
  if (window.managerAPI) {
    window.managerAPI.onWidgetStateChange((state) => {
      console.log('Widget state changed:', state);
      loadWidgets();
    });
  }
  
  // Set up event delegation for widget buttons
  const widgetList = document.getElementById('widget-list');
  widgetList.addEventListener('click', async (event) => {
    const button = event.target.closest('.btn');
    if (!button) return;
    
    const widgetId = button.dataset.widgetId;
    const isRunning = button.dataset.isRunning === 'true';
    
    console.log('[Event Delegation] Button clicked:', { widgetId, isRunning });
    
    if (widgetId) {
      await toggleWidget(widgetId, isRunning, button);
    }
  });
});

/**
 * Load and display installed widgets
 */
async function loadWidgets() {
  const widgetList = document.getElementById('widget-list');
  
  if (!window.managerAPI) {
    console.error('Manager API not available');
    return;
  }
  
  try {
    console.log('[loadWidgets] Fetching installed widgets...');
    const installedWidgets = await window.managerAPI.widgets.getInstalled();
    console.log('[loadWidgets] Installed widgets:', installedWidgets);
    
    console.log('[loadWidgets] Fetching running widgets...');
    const runningWidgets = await window.managerAPI.widgets.getRunning();
    console.log('[loadWidgets] Running widgets:', runningWidgets);
    
    if (installedWidgets.length === 0) {
      widgetList.innerHTML = `
        <div class="empty-state">
          <h2>No Widgets Installed</h2>
          <p>Install widgets from the Marketplace to get started</p>
        </div>
      `;
      return;
    }
    
    // Create widget cards
    widgetList.innerHTML = installedWidgets.map(widget => 
      createWidgetCard(widget, runningWidgets)
    ).join('');
    
  } catch (error) {
    console.error('[loadWidgets] Failed to load widgets:', error);
    widgetList.innerHTML = `
      <div class="empty-state">
        <h2>Error Loading Widgets</h2>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

/**
 * Create HTML for a widget card
 * @param {Object} widget - Widget configuration
 * @param {Array} runningWidgets - List of running widgets
 * @returns {string} HTML string
 */
function createWidgetCard(widget, runningWidgets) {
  const isRunning = runningWidgets.some(w => w.widgetId === widget.id);
  const runningInstance = runningWidgets.find(w => w.widgetId === widget.id);
  
  // Format author info
  const authorInfo = widget.author 
    ? (typeof widget.author === 'string' ? widget.author : widget.author.name)
    : 'Unknown';
  
  // Escape values to prevent XSS
  const displayName = escapeHtml(widget.displayName || widget.name);
  const description = escapeHtml(widget.description || 'No description');
  const version = escapeHtml(widget.version);
  const author = escapeHtml(authorInfo);
  const widgetId = escapeHtml(widget.id);
  
  return `
    <div class="widget-card">
      <span class="status ${isRunning ? 'running' : 'stopped'}">
        ${isRunning ? '● Running' : '○ Stopped'}
      </span>
      <h3>${displayName}</h3>
      <p>${description}</p>
      
      <div class="widget-info">
        <div><strong>Version:</strong> ${version}</div>
        <div><strong>Author:</strong> ${author}</div>
        <div><strong>Size:</strong> ${widget.sizes?.default?.width || 'N/A'}x${widget.sizes?.default?.height || 'N/A'}</div>
        ${runningInstance ? `<div><strong>Instance:</strong> ${escapeHtml(runningInstance.instanceId.substring(0, 8))}...</div>` : ''}
      </div>
      
      <div class="widget-card-actions">
        <button 
          class="btn" 
          data-widget-id="${widgetId}"
          data-is-running="${isRunning}"
        >
          ${isRunning ? '✕ Close' : '▶ Launch'}
        </button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Toggle widget (launch or close)
 * @param {string} widgetId - The widget ID to toggle
 * @param {boolean} isRunning - Whether the widget is currently running
 * @param {HTMLElement} button - The button element that was clicked
 */
async function toggleWidget(widgetId, isRunning, button) {
  console.log('[toggleWidget] Called with:', { widgetId, isRunning });
  console.log('[toggleWidget] window.managerAPI:', window.managerAPI);
  
  if (!window.managerAPI) {
    console.error('[toggleWidget] Manager API not available');
    showError('Manager API not available');
    return;
  }
  
  // Disable button to prevent double-clicks
  if (button) {
    button.disabled = true;
  }
  
  try {
    if (isRunning) {
      // Find the instance ID and close it
      console.log('[toggleWidget] Getting running widgets...');
      const runningWidgets = await window.managerAPI.widgets.getRunning();
      console.log('[toggleWidget] Running widgets:', runningWidgets);
      
      const widget = runningWidgets.find(w => w.widgetId === widgetId);
      
      if (!widget) {
        console.warn(`[toggleWidget] Widget ${widgetId} not found in running widgets`);
        return;
      }
      
      console.log(`[toggleWidget] Closing widget: ${widgetId} (${widget.instanceId})`);
      await window.managerAPI.widgets.close(widget.instanceId);
      console.log('[toggleWidget] Widget closed successfully');
    } else {
      // Launch the widget
      console.log(`[toggleWidget] Launching widget: ${widgetId}`);
      console.log('[toggleWidget] Calling window.managerAPI.widgets.create...');
      const instanceId = await window.managerAPI.widgets.create(widgetId);
      console.log(`[toggleWidget] Widget launched successfully with instance ID: ${instanceId}`);
    }
    
    // Reload the widget list
    console.log('[toggleWidget] Reloading widget list...');
    await loadWidgets();
    console.log('[toggleWidget] Widget list reloaded');
    
  } catch (error) {
    console.error('[toggleWidget] Error occurred:', error);
    console.error('[toggleWidget] Error stack:', error.stack);
    showError(`Failed to ${isRunning ? 'close' : 'launch'} widget: ${error.message}`);
  } finally {
    // Re-enable button
    if (button) {
      button.disabled = false;
    }
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(errorDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}
