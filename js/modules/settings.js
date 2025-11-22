/**
 * Settings Module
 * Provides settings page functionality including developer tools and log management
 */

(function () {
  'use strict';

  let container;
  let isInitialized = false;

  /**
   * Initialize settings module
   */
  function init() {
    if (isInitialized) return;

    console.log('[Settings] Initializing settings module');
    isInitialized = true;
  }

  /**
   * Render settings page
   */
  function render(targetContainer) {
    container = targetContainer;

    const html = `
      <div class="settings-page">
        <div class="settings-section">
          <h2>App Settings</h2>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Notifications</h3>
              <p>Enable push notifications for updates</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="setting-notifications">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Analytics</h3>
              <p>Help improve the app by sending usage data</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="setting-analytics" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Cache Management</h3>
              <p>Clear cached data and offline content</p>
            </div>
            <button class="btn btn-secondary" id="clear-cache-btn">Clear Cache</button>
          </div>
        </div>

        <div class="settings-section">
          <h2>Developer Tools</h2>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Log Level</h3>
              <p>Set the minimum level for log messages</p>
            </div>
            <select id="log-level-select" class="log-level-select">
              <option value="0">DEBUG</option>
              <option value="1">INFO</option>
              <option value="2">WARN</option>
              <option value="3">ERROR</option>
              <option value="4">NONE</option>
            </select>
          </div>

          <div class="log-stats" id="log-stats">
            <!-- Stats will be populated by JS -->
          </div>

          <div class="log-controls">
            <button class="btn btn-primary" id="view-logs-btn">View Logs</button>
            <button class="btn btn-secondary" id="download-logs-txt-btn">Download (TXT)</button>
            <button class="btn btn-secondary" id="download-logs-json-btn">Download (JSON)</button>
            <button class="btn btn-danger" id="clear-logs-btn">Clear Logs</button>
          </div>

          <div class="log-viewer" id="log-viewer" style="display: none;">
            <div class="log-viewer-header">
              <h3>Log Viewer</h3>
              <div class="log-filters">
                <input type="text" id="log-search" placeholder="Search logs..." class="log-search-input">
                <select id="log-filter-level" class="log-filter-select">
                  <option value="">All Levels</option>
                  <option value="0">DEBUG</option>
                  <option value="1">INFO</option>
                  <option value="2">WARN</option>
                  <option value="3">ERROR</option>
                </select>
                <select id="log-filter-module" class="log-filter-select">
                  <option value="">All Modules</option>
                </select>
                <button class="btn btn-sm" id="refresh-logs-btn">Refresh</button>
                <button class="btn btn-sm" id="close-logs-btn">Close</button>
              </div>
            </div>
            <div class="log-viewer-content" id="log-viewer-content">
              <!-- Logs will be populated here -->
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h2>About</h2>
          <div class="about-info">
            <p><strong>Version:</strong> <span id="app-version">1.0.0</span></p>
            <p><strong>Build Date:</strong> <span id="build-date">2025-11-22</span></p>
            <p><strong>Cache Status:</strong> <span id="cache-status">Loading...</span></p>
            <p><strong>Service Worker:</strong> <span id="sw-status">Loading...</span></p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    attachEventListeners();
    updateLogStats();
    updateAboutInfo();
    updateLogLevelSelect();
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Log level selection
    const logLevelSelect = window.helpers.$('#log-level-select');
    if (logLevelSelect) {
      logLevelSelect.addEventListener('change', handleLogLevelChange);
    }

    // Clear cache button
    const clearCacheBtn = window.helpers.$('#clear-cache-btn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', handleClearCache);
    }

    // Log controls
    const viewLogsBtn = window.helpers.$('#view-logs-btn');
    if (viewLogsBtn) {
      viewLogsBtn.addEventListener('click', handleViewLogs);
    }

    const downloadLogsTxtBtn = window.helpers.$('#download-logs-txt-btn');
    if (downloadLogsTxtBtn) {
      downloadLogsTxtBtn.addEventListener('click', () => window.PWALogger.downloadLogs('text'));
    }

    const downloadLogsJsonBtn = window.helpers.$('#download-logs-json-btn');
    if (downloadLogsJsonBtn) {
      downloadLogsJsonBtn.addEventListener('click', () => window.PWALogger.downloadLogs('json'));
    }

    const clearLogsBtn = window.helpers.$('#clear-logs-btn');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', handleClearLogs);
    }

    // Log viewer controls
    const closeLogsBtn = window.helpers.$('#close-logs-btn');
    if (closeLogsBtn) {
      closeLogsBtn.addEventListener('click', handleCloseLogs);
    }

    const refreshLogsBtn = window.helpers.$('#refresh-logs-btn');
    if (refreshLogsBtn) {
      refreshLogsBtn.addEventListener('click', handleRefreshLogs);
    }

    const logSearchInput = window.helpers.$('#log-search');
    if (logSearchInput) {
      logSearchInput.addEventListener('input', window.helpers.debounce(handleRefreshLogs, 300));
    }

    const logFilterLevel = window.helpers.$('#log-filter-level');
    if (logFilterLevel) {
      logFilterLevel.addEventListener('change', handleRefreshLogs);
    }

    const logFilterModule = window.helpers.$('#log-filter-module');
    if (logFilterModule) {
      logFilterModule.addEventListener('change', handleRefreshLogs);
    }

    // Settings toggles
    const notificationsToggle = window.helpers.$('#setting-notifications');
    if (notificationsToggle) {
      const enabled = window.helpers.getLocal('notifications-enabled') === 'true';
      notificationsToggle.checked = enabled;
      notificationsToggle.addEventListener('change', (e) => {
        window.helpers.setLocal('notifications-enabled', e.target.checked.toString());
        window.helpers.toast(e.target.checked ? 'Notifications enabled' : 'Notifications disabled');
      });
    }

    const analyticsToggle = window.helpers.$('#setting-analytics');
    if (analyticsToggle) {
      const enabled = window.helpers.getLocal('analytics-enabled') !== 'false';
      analyticsToggle.checked = enabled;
      analyticsToggle.addEventListener('change', (e) => {
        window.helpers.setLocal('analytics-enabled', e.target.checked.toString());
        window.helpers.toast(e.target.checked ? 'Analytics enabled' : 'Analytics disabled');
      });
    }
  }

  /**
   * Update log level select
   */
  function updateLogLevelSelect() {
    const select = window.helpers.$('#log-level-select');
    if (select) {
      select.value = window.PWALogger.getLogLevel().toString();
    }
  }

  /**
   * Handle log level change
   */
  function handleLogLevelChange(event) {
    const level = parseInt(event.target.value, 10);
    window.PWALogger.setLogLevel(level);
    window.helpers.toast('Log level updated to ' + window.PWALogger.getLevelName(level));
    updateLogStats();
  }

  /**
   * Handle clear cache
   */
  async function handleClearCache() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      window.helpers.toast('Cache cleared successfully');
      updateAboutInfo();
      console.log('[Settings] Cache cleared');
    } catch (error) {
      console.error('[Settings] Failed to clear cache:', error);
      window.helpers.toast('Failed to clear cache');
    }
  }

  /**
   * Handle view logs
   */
  function handleViewLogs() {
    const viewer = window.helpers.$('#log-viewer');
    if (viewer) {
      viewer.style.display = 'block';
      populateModuleFilter();
      handleRefreshLogs();
    }
  }

  /**
   * Handle close logs
   */
  function handleCloseLogs() {
    const viewer = window.helpers.$('#log-viewer');
    if (viewer) {
      viewer.style.display = 'none';
    }
  }

  /**
   * Handle refresh logs
   */
  function handleRefreshLogs() {
    const filters = {};

    const searchInput = window.helpers.$('#log-search');
    if (searchInput && searchInput.value) {
      filters.search = searchInput.value;
    }

    const levelFilter = window.helpers.$('#log-filter-level');
    if (levelFilter && levelFilter.value) {
      filters.level = parseInt(levelFilter.value, 10);
    }

    const moduleFilter = window.helpers.$('#log-filter-module');
    if (moduleFilter && moduleFilter.value) {
      filters.module = moduleFilter.value;
    }

    renderLogs(filters);
  }

  /**
   * Handle clear logs
   */
  function handleClearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
      window.PWALogger.clearLogs();
      window.helpers.toast('Logs cleared');
      updateLogStats();
      handleRefreshLogs();
    }
  }

  /**
   * Populate module filter dropdown
   */
  function populateModuleFilter() {
    const select = window.helpers.$('#log-filter-module');
    if (!select) return;

    const stats = window.PWALogger.getStats();
    const modules = Object.keys(stats.byModule).sort();

    select.innerHTML = '<option value="">All Modules</option>';
    modules.forEach(module => {
      const option = document.createElement('option');
      option.value = module;
      option.textContent = `${module} (${stats.byModule[module]})`;
      select.appendChild(option);
    });
  }

  /**
   * Render logs in viewer
   */
  function renderLogs(filters = {}) {
    const content = window.helpers.$('#log-viewer-content');
    if (!content) return;

    const logs = window.PWALogger.getLogs(filters);

    if (logs.length === 0) {
      content.innerHTML = '<div class="log-empty">No logs found</div>';
      return;
    }

    const logsHtml = logs.slice(-100).reverse().map(log => {
      const date = new Date(log.timestamp);
      const time = date.toLocaleTimeString();
      const levelClass = `log-level-${log.levelName.toLowerCase()}`;

      return `
        <div class="log-entry ${levelClass}">
          <span class="log-time">${time}</span>
          <span class="log-level">${log.levelName}</span>
          <span class="log-module">${log.module}</span>
          <span class="log-message">${window.helpers.sanitizeHTML(log.message)}</span>
        </div>
      `;
    }).join('');

    content.innerHTML = logsHtml;
  }

  /**
   * Update log statistics
   */
  function updateLogStats() {
    const statsContainer = window.helpers.$('#log-stats');
    if (!statsContainer) return;

    const stats = window.PWALogger.getStats();

    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Logs</div>
        </div>
        <div class="stat-card stat-debug">
          <div class="stat-value">${stats.byLevel.DEBUG}</div>
          <div class="stat-label">Debug</div>
        </div>
        <div class="stat-card stat-info">
          <div class="stat-value">${stats.byLevel.INFO}</div>
          <div class="stat-label">Info</div>
        </div>
        <div class="stat-card stat-warn">
          <div class="stat-value">${stats.byLevel.WARN}</div>
          <div class="stat-label">Warnings</div>
        </div>
        <div class="stat-card stat-error">
          <div class="stat-value">${stats.byLevel.ERROR}</div>
          <div class="stat-label">Errors</div>
        </div>
      </div>
    `;

    statsContainer.innerHTML = html;
  }

  /**
   * Update about information
   */
  async function updateAboutInfo() {
    // Update app version
    const versionEl = window.helpers.$('#app-version');
    if (versionEl && window.PWAApp) {
      versionEl.textContent = window.PWAApp.getVersion ? window.PWAApp.getVersion() : '1.0.0';
    }

    // Update cache status
    const cacheStatusEl = window.helpers.$('#cache-status');
    if (cacheStatusEl) {
      try {
        const cacheNames = await caches.keys();
        const cacheCount = cacheNames.length;
        cacheStatusEl.textContent = `${cacheCount} cache${cacheCount !== 1 ? 's' : ''} active`;
      } catch (error) {
        cacheStatusEl.textContent = 'Not available';
      }
    }

    // Update service worker status
    const swStatusEl = window.helpers.$('#sw-status');
    if (swStatusEl) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        swStatusEl.textContent = 'Active';
        swStatusEl.style.color = '#4CAF50';
      } else {
        swStatusEl.textContent = 'Not registered';
        swStatusEl.style.color = '#f44336';
      }
    }
  }

  // Public API
  window.PWASettings = {
    init,
    render,
  };
})();
