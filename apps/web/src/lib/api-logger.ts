export interface ApiLogEntry {
  _id: string; // Unique ID
  method: string;
  originalUrl: string;
  statusCode: number;
  responseTimeMs: number;
  ip?: string;
  createdAt: string;
  userAgent?: string;
  source: "admin" | "user";
  errorObj?: any;
}

export type LogLevel = "all" | "error" | "success" | "none";

interface LoggerConfig {
  limit: number;
  level: LogLevel;
}

const STORAGE_KEY = "system_api_metrics";
const CONFIG_KEY = "system_api_metrics_config";

const DEFAULT_CONFIG: LoggerConfig = {
  limit: 100,
  level: "all",
};

export const ApiLogger = {
  getConfig(): LoggerConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try {
      const configStr = localStorage.getItem(CONFIG_KEY);
      if (configStr) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(configStr) };
      }
    } catch (e) {
      console.error("Failed to parse logger config", e);
    }
    return DEFAULT_CONFIG;
  },

  setConfig(config: Partial<LoggerConfig>) {
    if (typeof window === "undefined") return;
    const current = this.getConfig();
    const newConfig = { ...current, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    this.enforceLimit(newConfig.limit);
  },

  getLogs(): ApiLogEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const logsStr = localStorage.getItem(STORAGE_KEY);
      if (logsStr) {
        return JSON.parse(logsStr) as ApiLogEntry[];
      }
    } catch (e) {
      console.error("Failed to parse logs", e);
    }
    return [];
  },

  addLog(log: Omit<ApiLogEntry, "_id" | "createdAt">) {
    if (typeof window === "undefined") return;
    
    const config = this.getConfig();
    if (config.level === "none") return;
    
    const isError = log.statusCode >= 400;
    if (config.level === "error" && !isError) return;
    if (config.level === "success" && isError) return;

    const newLog: ApiLogEntry = {
      ...log,
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    const logs = this.getLogs();
    logs.unshift(newLog); // Add to beginning

    // Enforce limit immediately
    if (logs.length > config.limit) {
      logs.splice(config.limit);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("api_log_updated"));
    }
  },

  enforceLimit(limit: number) {
    const logs = this.getLogs();
    if (logs.length > limit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, limit)));
    }
  },

  clearLogs() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "[]");
    window.dispatchEvent(new Event("api_log_updated"));
  },

  getSummary() {
    const logs = this.getLogs();
    const totalRequests = logs.length;
    let errorRequests = 0;
    let successRequests = 0;
    let totalResponseTime = 0;

    for (const log of logs) {
      if (log.statusCode >= 400) {
        errorRequests++;
      } else {
        successRequests++;
      }
      totalResponseTime += log.responseTimeMs;
    }

    const uptimeRatio = totalRequests > 0 
      ? Math.round((successRequests / totalRequests) * 100) 
      : 100;
      
    const averageResponseTime = totalRequests > 0 
      ? Math.round(totalResponseTime / totalRequests) 
      : 0;

    return {
      totalRequests,
      errorRequests,
      successRequests,
      uptimeRatio,
      averageResponseTime,
    };
  }
};
