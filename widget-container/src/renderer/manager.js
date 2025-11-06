/**
 * Widget Manager UI Script
 * Handles the user interface for managing widgets
 */

// This will be populated in later tasks when widget management is implemented
document.addEventListener('DOMContentLoaded', () => {
  console.log('Widget Manager loaded');
  
  // Load installed widgets
  loadWidgets();
  
  // Listen for widget state changes
  if (window.managerAPI) {
    window.managerAPI.onWidgetStateChange((state) => {
      console.log('Widget state changed:', state);
      loadWidgets();
    });
  }
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
    const installedWidgets = await window.managerAPI.widgets.getInstalled();
    const runningWidgets = await window.managerAPI.widgets.getRunning();
    
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
    widgetList.innerHTML = installedWidgets.map(widget => {
      const isRunning = runningWidgets.some(w => w.widgetId === widget.id);
      const runningInstance = runningWidgets.find(w => w.widgetId === widget.id);
      
      // Format author info
      const authorInfo = widget.author 
        ? (typeof widget.author === 'string' ? widget.author : widget.author.name)
        : 'Unknown';
      
      return `
        <div class="widget-card">
          <span class="status ${isRunning ? 'running' : 'stopped'}">
            ${isRunning ? '● Running' : '○ Stopped'}
          </span>
          <h3>${widget.displayName || widget.name}</h3>
          <p>${widget.description || 'No description'}</p>
          
          <div class="widget-info">
            <div><strong>Version:</strong> ${widget.version}</div>
            <div><strong>Author:</strong> ${authorInfo}</div>
            <div><strong>Size:</strong> ${widget.sizes?.default?.width || 'N/A'}x${widget.sizes?.default?.height || 'N/A'}</div>
            ${runningInstance ? `<div><strong>Instance:</strong> ${runningInstance.instanceId.substring(0, 8)}...</div>` : ''}
          </div>
          
          <div class="widget-card-actions">
            <button 
              class="btn" 
              onclick="toggleWidget('${widget.id}', ${isRunning})"
            >
              ${isRunning ? '✕ Close' : '▶ Launch'}
            </button>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Failed to load widgets:', error);
    widgetList.innerHTML = `
      <div class="empty-state">
        <h2>Error Loading Widgets</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

/**
 * Toggle widget (launch or close)
 */
async function toggleWidget(widgetId, isRunning) {
  if (!window.managerAPI) {
    console.error('Manager API not available');
    showError('Manager API not available');
    return;
  }
  
  try {
    if (isRunning) {
      // Find the instance ID and close it
      const runningWidgets = await window.managerAPI.widgets.getRunning();
      const widget = runningWidgets.find(w => w.widgetId === widgetId);
      if (widget) {
        console.log(`Closing widget: ${widgetId} (${widget.instanceId})`);
        await window.managerAPI.widgets.close(widget.instanceId);
        console.log('Widget closed successfully');
      }
    } else {
      // Launch the widget
      console.log(`Launching widget: ${widgetId}`);
      const instanceId = await window.managerAPI.widgets.create(widgetId);
      console.log(`Widget launched successfully with instance ID: ${instanceId}`);
    }
    
    // Reload the widget list
    await loadWidgets();
    
  } catch (error) {
    console.error('Failed to toggle widget:', error);
    showError(`Failed to ${isRunning ? 'close' : 'launch'} widget: ${error.message}`);
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const widgetList = document.getElementById('widget-list');
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
