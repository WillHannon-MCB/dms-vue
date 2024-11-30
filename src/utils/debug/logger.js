/**
 * A simple logger class for logging messages to the console.
 */
class Logger {
  constructor(filename) {
    this.filename = filename
  }

  formatTimestamp() {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  info(...args) {
    if (import.meta.env.VITE_DEBUG) {
      const timestamp = this.formatTimestamp()
      console.log(`[INFO ${timestamp} ${this.filename}]`, ...args)
    }
  }

  warn(...args) {
    if (import.meta.env.VITE_DEBUG) {
      const timestamp = this.formatTimestamp()
      console.warn(`[WARN ${timestamp} ${this.filename}]`, ...args)
    }
  }

  error(...args) {
    if (import.meta.env.VITE_DEBUG) {
      const timestamp = this.formatTimestamp()
      console.error(`[ERROR ${timestamp} ${this.filename}]`, ...args)
    }
  }
}

export const createLogger = (filename) => new Logger(filename)
