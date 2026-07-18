"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Bell, Check, ExternalLink, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

import api, { API_ENDPOINTS } from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Link } from "@/i18n/routing";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  priority: string;
}

export function NotificationsListClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null); // null means bulk delete
  const { fetchUnreadCount, decrementUnread, setUnreadCount } = useNotificationStore();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
      if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
        // Also sync unread count globally when we fetch the list
        if (response.data.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.READ(id));
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        decrementUnread();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map(n => n._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      if (itemToDelete) {
        // Single delete
        const response = await api.delete(`/api/notifications/${itemToDelete}`);
        if (response.data?.success) {
          setNotifications(prev => prev.filter(n => n._id !== itemToDelete));
          toast.success("Notification deleted");
          setSelectedIds(prev => prev.filter(id => id !== itemToDelete));
        }
      } else {
        // Bulk delete
        if (selectedIds.length === notifications.length) {
          // Optimization: if all are selected, use the bulk wipe endpoint
          const response = await api.delete("/api/notifications");
          if (response.data?.success) {
            setNotifications([]);
            setSelectedIds([]);
            toast.success("All notifications deleted");
          }
        } else {
          // Otherwise, delete selected ones sequentially or concurrently via Promise.all
          await Promise.all(
            selectedIds.map(id => api.delete(`/api/notifications/${id}`))
          );
          setNotifications(prev => prev.filter(n => !selectedIds.includes(n._id)));
          setSelectedIds([]);
          toast.success("Selected notifications deleted");
        }
      }
      
      // Update unread count manually based on what was deleted
      // The easiest way is to just refetch the unread count from the server
      fetchUnreadCount();
      
    } catch (error) {
      console.error("Error deleting notification(s):", error);
      toast.error("Failed to delete notification(s)");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsSheetOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  return (
    <div className="flex flex-col gap-[24px] w-full items-start justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
        <h1 className="text-light-primary-text font-urbanist text-[32px] font-bold leading-[48px]">
          Notifications
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center justify-center p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading || notifications.length === 0}
            className="flex items-center gap-2 px-[16px] py-[8px] rounded-[80px] border border-success/30 bg-success/5 text-success-dark hover:bg-success/10 transition-colors disabled:opacity-50 text-[14px] font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </button>
          
          {notifications.length > 0 && (
            <button
              onClick={() => {
                setItemToDelete(null); // setup bulk delete
                setDeleteDialogOpen(true);
              }}
              disabled={selectedIds.length === 0 || isDeleting}
              className={`flex items-center gap-2 px-[16px] py-[8px] rounded-[80px] border transition-colors text-[14px] font-semibold ${
                selectedIds.length > 0
                  ? "border-error/30 bg-error/5 text-error hover:bg-error/10"
                  : "border-border bg-muted/30 text-light-disabled-text pointer-events-none"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </button>
          )}
        </div>
      </div>
      
      {notifications.length > 0 && (
        <div className="w-full flex items-center gap-3 px-[24px] py-2">
          <Checkbox
            id="selectAll"
            className="rounded-[6px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            checked={notifications.length > 0 && selectedIds.length === notifications.length}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <label htmlFor="selectAll" className="text-[14px] font-medium text-muted-foreground cursor-pointer select-none">
            Select All
          </label>
        </div>
      )}

      <div className="flex flex-col gap-[16px] w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-[16px] text-center flex flex-col items-center justify-center border border-light-divider">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold text-light-primary-text mb-1">No notifications yet</p>
            <p className="text-sm text-muted-foreground">We'll let you know when we have something new for you.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex flex-col w-full relative bg-white border border-light-divider rounded-[16px] overflow-hidden hover:shadow-sm transition-all duration-300 ${
                !notification.isRead ? "border-primary/30" : ""
              }`}
            >
              {!notification.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
              )}
              
              <div className="px-[24px] py-[20px] flex sm:items-center justify-between gap-4 flex-col sm:flex-row w-full">
                <div className="flex items-start gap-4 flex-1" onClick={(e) => { e.stopPropagation(); openNotification(notification); }} style={{ cursor: 'pointer' }}>
                  <div className="flex items-center h-10 shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      className="rounded-[6px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      checked={selectedIds.includes(notification._id)}
                      onCheckedChange={(checked) => handleSelectOne(notification._id, checked as boolean)}
                    />
                  </div>
                  <div className={`mt-1 sm:mt-0 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className={`text-[16px] leading-[24px] ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-[14px] text-muted-foreground leading-[22px] line-clamp-1 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-muted-foreground">
                      {format(new Date(notification.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(notification._id);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-full text-light-disabled-text hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!notification.isRead && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full self-start sm:self-end">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Details Sidebar */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[450px]">
          <SheetHeader className="mb-6 border-b border-light-divider pb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <SheetTitle className="text-xl font-bold">{selectedNotification?.title}</SheetTitle>
            <SheetDescription>
              {selectedNotification && format(new Date(selectedNotification.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </SheetDescription>
          </SheetHeader>

          {selectedNotification && (
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl opacity-80" />
                <h3 className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Message Details
                </h3>
                <div className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap mb-4">
                  {selectedNotification.message}
                </div>
                {selectedNotification.actionUrl && (
                  <div className="pt-4 border-t border-gray-200 mt-2">
                    <Link href={selectedNotification.actionUrl as any}>
                      <button className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-[80px] shadow-md shadow-primary/20 transition-all hover:-translate-y-[1px]">
                        {selectedNotification.actionText || "View Details"}
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification{itemToDelete ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete ? "this notification" : `${selectedIds.length} selected notifications`}? This action cannot be undone and it will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              disabled={isDeleting}
              className="bg-error hover:bg-error/90 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
