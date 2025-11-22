/**
 * Logger Module
 * Provides centralized logging with configurable log levels and persistent storage
 */

(function () {
  'use strict';

  // Log levels (ordered by severity)
  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4,
  };

  // Default configuration
  let config = {
    currentLevel: LOG_LEVELS.INFO,
    maxLogs: 500, // Maximum number of logs to store
    persistLogs: true,
    showTimestamp: true,
  };

  // In-memory log storage
  let logs = [];

  // Storage keys
  const STORAGE_KEYS = {
    LOGS: 'pwa-logs',
    LOG_LEVEL: 'pwa-log-level',
  };

  /**
   * Initialize logger
   */
  function init() {
    // Load saved log level
    const savedLevel = window.helpers.getLocal(STORAGE_KEYS.LOG_LEVEL);
    if (savedLevel !== null) {
      config.currentLevel = parseInt(savedLevel, 10);
    }

    // Load saved logs
    if (config.persistLogs) {
      const savedLogs = window.helpers.getLocal(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        try {
          logs = JSON.parse(savedLogs);
        } catch (e) {
          console.warn('[Logger] Failed to parse saved logs');
          logs = [];
        }
      }
    }

    // Override console methods to intercept logs
    interceptConsoleLogs();

    log(LOG_LEVELS.INFO, 'Logger', 'Logger initialized with level: ' + getLevelName(config.currentLevel));
  }

  /**
   * Intercept console methods to capture all logs
   */
  function interceptConsoleLogs() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    console.log = function (...args) {
      captureLog(LOG_LEVELS.INFO, args);
      originalConsole.log.apply(console, args);
    };

    console.info = function (...args) {
      captureLog(LOG_LEVELS.INFO, args);
      originalConsole.info.apply(console, args);
    };

    console.warn = function (...args) {
      captureLog(LOG_LEVELS.WARN, args);
      originalConsole.warn.apply(console, args);
    };

    console.error = function (...args) {
      captureLog(LOG_LEVELS.ERROR, args);
      originalConsole.error.apply(console, args);
    };

    console.debug = function (...args) {
      captureLog(LOG_LEVELS.DEBUG, args);
      originalConsole.debug.apply(console, args);
    };
  }

  /**
   * Capture a log entry
   */
  function captureLog(level, args) {
    // Extract module name if present (e.g., "[App]")
    let module = 'General';
    let message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Extract module name from message
    const moduleMatch = message.match(/^\[([^\]]+)\]/);
    if (moduleMatch) {
      module = moduleMatch[1];
    }

    const logEntry = {
      timestamp: Date.now(),
      level: level,
      levelName: getLevelName(level),
      module: module,
      message: message,
    };

    addLog(logEntry);
  }

  /**
   * Add a log entry to storage
   */
  function addLog(logEntry) {
    logs.push(logEntry);

    // Trim logs if exceeding max
    if (logs.length > config.maxLogs) {
      logs = logs.slice(-config.maxLogs);
    }

    // Persist to localStorage
    if (config.persistLogs) {
      saveLogs();
    }
  }

  /**
   * Save logs to localStorage
   */
  function saveLogs() {
    try {
      window.helpers.setLocal(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      // localStorage might be full, remove oldest logs
      logs = logs.slice(-Math.floor(config.maxLogs / 2));
      try {
        window.helpers.setLocal(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      } catch (e2) {
        console.warn('[Logger] Failed to save logs to localStorage');
      }
    }
  }

  /**
   * Main logging function
   */
  function log(level, module, ...args) {
    if (level < config.currentLevel) {
      return; // Don't log if below current level
    }

    const message = args.join(' ');
    const logEntry = {
      timestamp: Date.now(),
      level: level,
      levelName: getLevelName(level),
      module: module,
      message: message,
    };

    addLog(logEntry);
  }

  /**
   * Convenience methods
   */
  function debug(module, ...args) {
    log(LOG_LEVELS.DEBUG, module, ...args);
  }

  function info(module, ...args) {
    log(LOG_LEVELS.INFO, module, ...args);
  }

  function warn(module, ...args) {
    log(LOG_LEVELS.WARN, module, ...args);
  }

  function error(module, ...args) {
    log(LOG_LEVELS.ERROR, module, ...args);
  }

  /**
   * Get all logs
   */
  function getLogs(filters = {}) {
    let filteredLogs = [...logs];

    // Filter by level
    if (filters.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filters.level);
    }

    // Filter by module
    if (filters.module) {
      filteredLogs = filteredLogs.filter(log =>
        log.module.toLowerCase().includes(filters.module.toLowerCase())
      );
    }

    // Filter by time range
    if (filters.since) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchLower)
      );
    }

    return filteredLogs;
  }

  /**
   * Clear all logs
   */
  function clearLogs() {
    logs = [];
    window.helpers.removeLocal(STORAGE_KEYS.LOGS);
    info('Logger', 'All logs cleared');
  }

  /**
   * Set log level
   */
  function setLogLevel(level) {
    if (level >= LOG_LEVELS.DEBUG && level <= LOG_LEVELS.NONE) {
      config.currentLevel = level;
      window.helpers.setLocal(STORAGE_KEYS.LOG_LEVEL, level.toString());
      info('Logger', 'Log level set to: ' + getLevelName(level));
      return true;
    }
    return false;
  }

  /**
   * Get current log level
   */
  function getLogLevel() {
    return config.currentLevel;
  }

  /**
   * Get log level name
   */
  function getLevelName(level) {
    const entry = Object.entries(LOG_LEVELS).find(([_, val]) => val === level);
    return entry ? entry[0] : 'UNKNOWN';
  }

  /**
   * Export logs as text
   */
  function exportLogsAsText(filters = {}) {
    const filteredLogs = getLogs(filters);
    return filteredLogs.map(log => {
      const date = new Date(log.timestamp);
      const timestamp = date.toISOString();
      return `[${timestamp}] [${log.levelName}] [${log.module}] ${log.message}`;
    }).join('\n');
  }

  /**
   * Export logs as JSON
   */
  function exportLogsAsJSON(filters = {}) {
    const filteredLogs = getLogs(filters);
    return JSON.stringify(filteredLogs, null, 2);
  }

  /**
   * Download logs as file
   */
  function downloadLogs(format = 'text', filters = {}) {
    let content, filename, mimeType;

    if (format === 'json') {
      content = exportLogsAsJSON(filters);
      filename = `pwa-logs-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      content = exportLogsAsText(filters);
      filename = `pwa-logs-${Date.now()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    info('Logger', 'Logs downloaded as ' + filename);
  }

  /**
   * Get log statistics
   */
  function getStats() {
    const stats = {
      total: logs.length,
      byLevel: {
        DEBUG: logs.filter(l => l.level === LOG_LEVELS.DEBUG).length,
        INFO: logs.filter(l => l.level === LOG_LEVELS.INFO).length,
        WARN: logs.filter(l => l.level === LOG_LEVELS.WARN).length,
        ERROR: logs.filter(l => l.level === LOG_LEVELS.ERROR).length,
      },
      byModule: {},
    };

    logs.forEach(log => {
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
    });

    return stats;
  }

  // Public API
  window.PWALogger = {
    init,
    log,
    debug,
    info,
    warn,
    error,
    getLogs,
    clearLogs,
    setLogLevel,
    getLogLevel,
    getLevelName,
    exportLogsAsText,
    exportLogsAsJSON,
    downloadLogs,
    getStats,
    LOG_LEVELS,
  };
})();
