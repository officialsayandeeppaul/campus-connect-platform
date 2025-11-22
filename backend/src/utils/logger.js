import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple Logger Utility
 * Logs to console and optionally to file
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

/**
 * Format log message
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}\n`;
};

/**
 * Write to log file
 */
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

/**
 * Logger object
 */
const logger = {
  /**
   * Info level log
   */
  info: (message, meta = {}) => {
    const formattedMessage = formatMessage('info', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    if (process.env.NODE_ENV === 'production') {
      writeToFile(combinedLogPath, formattedMessage);
    }
  },

  /**
   * Error level log
   */
  error: (message, meta = {}) => {
    const formattedMessage = formatMessage('error', message, meta);
    console.error(`❌ ${message}`, meta);
    if (process.env.NODE_ENV === 'production') {
      writeToFile(errorLogPath, formattedMessage);
      writeToFile(combinedLogPath, formattedMessage);
    }
  },

  /**
   * Warning level log
   */
  warn: (message, meta = {}) => {
    const formattedMessage = formatMessage('warn', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    if (process.env.NODE_ENV === 'production') {
      writeToFile(combinedLogPath, formattedMessage);
    }
  },

  /**
   * Debug level log
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = formatMessage('debug', message, meta);
      console.log(`🐛 ${message}`, meta);
    }
  },

  /**
   * Success level log
   */
  success: (message, meta = {}) => {
    const formattedMessage = formatMessage('success', message, meta);
    console.log(`✅ ${message}`, meta);
    if (process.env.NODE_ENV === 'production') {
      writeToFile(combinedLogPath, formattedMessage);
    }
  },
};

export default logger;
