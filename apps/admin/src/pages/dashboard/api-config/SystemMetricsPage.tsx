import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  ServerCrash,
  Clock,
  ArrowRight,
  Filter,
  Trash2,
  RefreshCw,
  Search,
  Power,
  PowerOff,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ApiLogEntry, ApiLogger } from "@/lib/api-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SystemMetricsSidebar from "@/pages/dashboard/api-config/SystemMetricsSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Method badge colours ───────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-[#EBF5FF] text-[#3B82F6]",
  POST: "bg-[#E6F4EA] text-[#34A853]",
  PUT: "bg-[#FEF7E0] text-[#FBBC04]",
  DELETE: "bg-error-lighter text-error-main",
  PATCH: "bg-[#F3E8FF] text-[#A855F7]",
};

function statusColor(code: number) {
  if (code >= 200 && code < 300) return "text-success-main";
  if (code >= 400) return "text-error-main";
  return "text-warning-main";
}

function statusDotColor(code: number) {
  if (code >= 200 && code < 300) return "bg-success-main";
  if (code >= 400) return "bg-error-main";
  return "bg-warning-main";
}

// ─── Pill toggle for enable/disable ────────────────────────────────────────
interface TrackingToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function TrackingToggle({ enabled, onToggle }: TrackingToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-10 items-center gap-3 rounded-full px-5 text-sm font-semibold transition-all duration-300 shadow-sm border",
        enabled
          ? "bg-success-main border-success-main text-white shadow-success-main/25"
          : "bg-neutral-900 border-neutral-800 text-white shadow-neutral-900/25 hover:bg-neutral-800"
      )}
      title={enabled ? "Click to stop tracking" : "Click to start tracking"}
    >
      {/* Animated indicator dot */}
      <span className="relative flex h-2.5 w-2.5">
        {enabled && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            enabled ? "bg-white" : "bg-neutral-500"
          )}
        />
      </span>

      {enabled ? (
        <>
          <Zap size={15} />
          Tracking Live
        </>
      ) : (
        <>
          <PowerOff size={15} />
          Tracking Off
        </>
      )}
    </button>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function SystemMetricsPage() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    errorRequests: 0,
    successRequests: 0,
    uptimeRatio: 100,
    averageResponseTime: 0,
  });
  const [isEnabled, setIsEnabled] = useState(ApiLogger.isEnabled());

  const [limit, setLimit] = useState("100");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("error"); // default: errors only
  const [methodFilter, setMethodFilter] = useState("all");   // default: all methods
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadData = useCallback(() => {
    const cfg = ApiLogger.getConfig();
    setLimit(cfg.limit.toString());
    setLogs(ApiLogger.getLogs());
    setSummary(ApiLogger.getSummary());
    setIsEnabled(cfg.enabled);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("api_log_updated", loadData);
    window.addEventListener("api_logger_config_changed", loadData);
    return () => {
      window.removeEventListener("api_log_updated", loadData);
      window.removeEventListener("api_logger_config_changed", loadData);
    };
  }, [loadData]);

  const handleToggleTracking = () => {
    ApiLogger.toggleEnabled();
    loadData();
  };

  const handleLimitChange = (value: string) => {
    setLimit(value);
    ApiLogger.setConfig({ limit: parseInt(value, 10) });
    loadData();
  };

  const handleClearLogs = () => {
    ApiLogger.clearLogs();
    loadData();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    // Keep logger level in sync so future captures match
    ApiLogger.setConfig({
      level: value === "error" ? "error" : value === "success" ? "success" : "all",
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
    if (statusFilter === "success" && log.statusCode >= 400) return false;
    if (statusFilter === "error" && log.statusCode < 400) return false;
    if (methodFilter !== "all" && log.method !== methodFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !log.originalUrl.toLowerCase().includes(q) &&
        !log.method.toLowerCase().includes(q) &&
        !log.statusCode.toString().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const openSidebar = (log: ApiLogEntry) => {
    setSelectedLog(log);
    setIsSidebarOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            System Metrics &amp; API Monitor
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Admin-only real-time API error tracking. Tracking is{" "}
            <span
              className={cn(
                "font-semibold",
                isEnabled ? "text-success-main" : "text-neutral-400"
              )}
            >
              {isEnabled ? "live" : "paused"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Tracking toggle — admin enable/disable */}
          <TrackingToggle enabled={isEnabled} onToggle={handleToggleTracking} />

          {/* Log limit */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 font-medium">Limit:</span>
            <Select value={limit} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[90px] h-10 border-neutral-200 rounded-full text-sm">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-2 h-10 rounded-full px-4 border-neutral-200"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>

          {/* Clear — destructive, white text */}
          <Button
            size="sm"
            onClick={handleClearLogs}
            className="flex items-center gap-2 h-10 rounded-full px-4 bg-error-main hover:bg-error-dark text-white shadow-sm shadow-error-main/20 border-0"
          >
            <Trash2 size={14} />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* ── Disabled state banner ───────────────────────────────────────── */}
      <AnimatePresence>
        {!isEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 bg-neutral-900 text-white rounded-2xl px-6 py-4 shadow-lg">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">API Tracking is paused</p>
                <p className="text-white/60 text-xs mt-0.5">
                  No requests are being captured. Enable tracking above to start
                  monitoring errors in real time.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleToggleTracking}
                className="bg-white text-neutral-900 hover:bg-white/90 rounded-full h-9 px-4 text-sm font-semibold shrink-0 gap-1.5"
              >
                <Power size={14} />
                Enable Tracking
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active tracking indicator ───────────────────────────────────── */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 bg-linear-to-r from-success-main/10 to-success-lighter/30 border border-success-main/20 text-neutral-800 rounded-2xl px-6 py-3.5">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-main opacity-50" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-main" />
              </div>
              <p className="text-sm font-medium text-success-dark">
                Actively monitoring — only{" "}
                <span className="font-bold">
                  {statusFilter === "error"
                    ? "error responses (4xx / 5xx)"
                    : statusFilter === "success"
                    ? "success responses"
                    : "all responses"}
                </span>{" "}
                are being captured.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleTracking}
                className="ml-auto text-error-main hover:bg-error-lighter hover:text-error-dark rounded-full h-8 px-3 text-xs gap-1.5"
              >
                <PowerOff size={13} />
                Stop
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Captured",
            value: summary.totalRequests,
            suffix: "",
            icon: Activity,
            iconBg: "bg-primary-lighter/50",
            iconColor: "text-primary-main",
          },
          {
            label: "Avg Response",
            value: summary.averageResponseTime,
            suffix: "ms",
            icon: Clock,
            iconBg: "bg-[#EBF5FF]",
            iconColor: "text-[#3B82F6]",
          },
          {
            label: "Error Responses",
            value: summary.errorRequests,
            suffix: "",
            icon: ServerCrash,
            iconBg: "bg-error-lighter",
            iconColor: "text-error-main",
            highlight: summary.errorRequests > 0,
          },
          {
            label: "Success Ratio",
            value: summary.uptimeRatio,
            suffix: "%",
            icon: CheckCircle2,
            iconBg: "bg-success-lighter",
            iconColor: "text-success-main",
          },
        ].map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all",
              card.highlight
                ? "border-error-lighter shadow-error-main/10"
                : "border-neutral-100"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                card.iconBg
              )}
            >
              <card.icon size={22} className={card.iconColor} />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-neutral-800 mt-0.5">
                {card.value}
                <span className="text-sm font-normal text-neutral-400 ml-1">
                  {card.suffix}
                </span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Table Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50/50">
          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <Input
              placeholder="Search URL, method, status..."
              className="pl-9 h-10 w-full rounded-full border-neutral-200 bg-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Source filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-10 rounded-full border-neutral-200 bg-white text-sm w-[130px]">
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-neutral-400" />
                  <span className="text-neutral-600 text-sm">
                    {sourceFilter === "all" ? "All Sources" : sourceFilter === "admin" ? "Admin" : "Storefront"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="admin">Admin Dashboard</SelectItem>
                <SelectItem value="user">User Storefront</SelectItem>
              </SelectContent>
            </Select>

            {/* Method filter */}
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="h-10 rounded-full border-neutral-200 bg-white text-sm w-[120px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter — hardcoded chip options */}
            <div className="flex items-center gap-1.5">
              {[
                { value: "error", label: "Errors", icon: AlertTriangle, cls: "border-error-lighter bg-error-lighter/60 text-error-dark hover:bg-error-lighter" },
                { value: "all", label: "All", icon: Activity, cls: "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50" },
                { value: "success", label: "Success", icon: CheckCircle2, cls: "border-success-lighter bg-success-lighter/60 text-success-dark hover:bg-success-lighter" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusFilterChange(opt.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    opt.cls,
                    statusFilter === opt.value
                      ? "ring-2 ring-offset-1 ring-current opacity-100 shadow-sm"
                      : "opacity-70"
                  )}
                >
                  <opt.icon size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log count bar */}
        <div className="px-4 py-2 border-b border-neutral-100 bg-white flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium">
            Showing{" "}
            <span className="font-bold text-neutral-700">{filteredLogs.length}</span>{" "}
            log{filteredLogs.length !== 1 ? "s" : ""}
            {filteredLogs.length !== logs.length && (
              <> of {logs.length} total</>
            )}
          </span>
          {!isEnabled && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              <PowerOff size={11} /> Paused — historical data
            </span>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {["Method", "Status", "Endpoint", "Duration", "Time", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="py-3.5 px-5 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 bg-neutral-50 border-b border-neutral-100 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      {isEnabled ? (
                        <>
                          <Activity size={36} className="opacity-20" />
                          <p className="text-sm font-medium">
                            No logs match your filters yet
                          </p>
                          <p className="text-xs">
                            Tracking is live — errors will appear here as they
                            happen
                          </p>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={36} className="opacity-20" />
                          <p className="text-sm font-medium">Tracking is paused</p>
                          <p className="text-xs">
                            Enable tracking to start capturing API errors
                          </p>
                          <Button
                            size="sm"
                            onClick={handleToggleTracking}
                            className="mt-1 bg-neutral-900 hover:bg-neutral-700 text-white rounded-full px-4 h-9 gap-2"
                          >
                            <Power size={13} />
                            Enable Tracking
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isError = log.statusCode >= 400;
                  return (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className={cn(
                        "group border-b border-neutral-100 transition-colors cursor-pointer",
                        isError
                          ? "hover:bg-error-lighter/20 bg-error-lighter/5"
                          : "hover:bg-primary-50/20"
                      )}
                      onClick={() => openSidebar(log)}
                    >
                      {/* Method */}
                      <td className="py-3 px-5">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold w-16",
                            METHOD_COLORS[log.method] ?? "bg-neutral-100 text-neutral-600"
                          )}
                        >
                          {log.method}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-5">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 font-semibold text-sm",
                            statusColor(log.statusCode)
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              statusDotColor(log.statusCode)
                            )}
                          />
                          {log.statusCode}
                        </span>
                      </td>

                      {/* Endpoint */}
                      <td className="py-3 px-5 max-w-[320px]">
                        <span
                          className="font-mono text-[13px] text-neutral-700 font-medium truncate block"
                          title={log.originalUrl}
                        >
                          {log.originalUrl.split("?")[0]}
                        </span>
                        {log.originalUrl.includes("?") && (
                          <span className="font-mono text-[10px] text-neutral-400 truncate block mt-0.5">
                            ?{log.originalUrl.split("?")[1]}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            log.responseTimeMs > 1000
                              ? "text-warning-dark"
                              : "text-neutral-600"
                          )}
                        >
                          {log.responseTimeMs}
                          <span className="text-xs font-normal text-neutral-400 ml-0.5">
                            ms
                          </span>
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-5">
                        <span className="text-sm text-neutral-500">
                          {format(new Date(log.createdAt), "HH:mm:ss")}
                        </span>
                      </td>

                      {/* Arrow */}
                      <td className="py-3 px-5 text-right">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={16} className="text-primary-main" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail sidebar */}
      <SystemMetricsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
