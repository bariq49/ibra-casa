import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSchema } from "@/lib/validation";
import { DEFAULT_PER_PAGE } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pencil,
  Ban,
  Trash2,
  Plus,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "employee" | "vendor";
  employee_role?:
    | "packer"
    | "deliveryman"
    | "accounts"
    | "incharge"
    | "call_center"
    | null;
  createdAt: string;
};

type FormData = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPencilSheetOpen, setIsPencilSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const [exportScope, setExportScope] = useState<"page" | "all">("all");
  const [exportLoading, setExportLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState<any>(null);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPlainPassword, setShowPlainPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [bypassOldPassword, setBypassOldPassword] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname === "/dashboard/admins";
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(
    isAdminPage ? "admin" : "all",
  );
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [customPerPage, setCustomPerPage] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { user, checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();
  const isPreviewRole = false;

  // Auto-set role filter based on page
  useEffect(() => {
    if (isAdminPage) {
      setRoleFilter("admin");
    } else {
      setRoleFilter("all");
    }
  }, [isAdminPage]);

  const formAdd = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      employee_role: null,
      avatar: "",
    },
  });

  const formPencil = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      employee_role: null,
      avatar: "",
    },
  });

  const fetchUsers = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;

      const response = await axiosPrivate.get("/users", {
        params: {
          page: currentPage,
          perPage,
          sortOrder,
          role: roleFilter === "all" ? undefined : roleFilter,
          employee_role:
            employeeRoleFilter === "all" ? undefined : employeeRoleFilter,
          search: searchTerm.trim() || undefined,
        },
      });

      // Handle paginated response from updated server
      if (response.data.users) {
        setUsers(response.data.users);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);

        // If we reset the page, update the page state
        if (resetPage) {
          setPage(1);
        }
      } else {
        // Fallback for non-paginated response
        setUsers(response.data || []);
        setTotal(response.data?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/users", {
        params: {
          page,
          perPage,
          sortOrder: "desc",
          role: roleFilter === "all" ? undefined : roleFilter,
          employee_role:
            employeeRoleFilter === "all" ? undefined : employeeRoleFilter,
          search: searchTerm.trim() || undefined,
        },
      });

      // Handle paginated response
      if (response.data.users) {
        setUsers(response.data.users);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setUsers(response.data || []);
        setTotal(response.data?.length || 0);
        setTotalPages(1);
      }

      toast({
        title: "Success",
        description: "Users refreshed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh users",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, employeeRoleFilter, perPage, sortOrder, searchTerm]);

  // Add debounced search effect independently
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setPage(1); // Reset to page 1 when searching
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1); // Reset to first page when changing filter
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handlePerPageChange = (value: string) => {
    if (value === "all") {
      setPerPage(10000); // Set to a very large number for "all" - server will handle it appropriately
      setPage(1); // Reset to first page
      setCustomPerPage(""); // Hide custom input
    } else if (value === "custom") {
      setCustomPerPage("1"); // Show custom input with placeholder value
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setPerPage(numValue);
        setPage(1); // Reset to first page when changing perPage
        setCustomPerPage(""); // Hide custom input
      }
    }
  };

  const handleCustomPerPageChange = (value: string) => {
    setCustomPerPage(value);
  };

  const handleCustomPerPageSubmit = () => {
    const numValue = parseInt(customPerPage);
    if (!isNaN(numValue) && numValue > 0) {
      setPerPage(numValue);
      setPage(1); // Reset to first page
      setCustomPerPage(""); // Clear the custom input
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number greater than 0",
      });
    }
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setPage(1); // Reset to first page when changing sort order
  };

  const handleSelectUser = (userId: string, checked?: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Handle Export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      let dataToExport = users; // Current page data by default

      if (exportScope === "all") {
        // Fetch all data
        const response = await axiosPrivate.get("/users", {
          params: {
            page: 1,
            perPage: 10000,
            sortOrder,
            role: roleFilter === "all" ? undefined : roleFilter,
            employee_role:
              employeeRoleFilter === "all" ? undefined : employeeRoleFilter,
            search: searchTerm.trim() || undefined,
          },
        });

        if (response.data.users) {
          dataToExport = response.data.users;
        } else if (response.data) {
          dataToExport = response.data;
        }
      }

      // Format data for export
      const formatData = dataToExport.map((u) => ({
        ID: u._id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        "Employee Role": u.employee_role || "N/A",
        "Created At": new Date(u.createdAt || Date.now()).toLocaleDateString(),
      }));

      const dateStr = new Date().toISOString().split("T")[0];

      if (exportFormat === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(formatData);
        const workbook = {
          Sheets: { Users: worksheet },
          SheetNames: ["Users"],
        };
        XLSX.writeFile(workbook, `Users_Export_${dateStr}.xlsx`);
      } else if (exportFormat === "pdf") {
        const doc = new jsPDF();
        doc.text("Users Export", 14, 15);
        let y = 30;

        doc.setFontSize(10);
        doc.text("Name", 14, y);
        doc.text("Email", 70, y);
        doc.text("Role", 150, y);
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(14, y, 196, y);
        y += 10;

        formatData.forEach((row) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(String(row.Name).substring(0, 25), 14, y);
          doc.text(String(row.Email).substring(0, 35), 70, y);
          doc.text(String(row.Role), 150, y);
          y += 10;
        });
        doc.save(`Users_Export_${dateStr}.pdf`);
      }

      toast({
        title: "Export Successful",
        description: `Successfully exported ${
          exportScope === "all" ? "all records" : "current page records"
        } to ${exportFormat.toUpperCase()}.`,
      });
      setIsExportModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while generating the export file.",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(displayUsers.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select users to delete",
      });
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);

      // Delete users in parallel
      await Promise.all(
        selectedUsers.map((userId) => axiosPrivate.delete(`/users/${userId}`)),
      );

      toast({
        title: "Success",
        description: `${selectedUsers.length} user(s) deleted successfully`,
      });

      setSelectedUsers([]);
      setIsBulkDeleteModalOpen(false);
      fetchUsers(true); // Reset to page 1 and refetch
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected users",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // No need for client-side filtering anymore since we're doing server-side filtering
  const displayUsers = users;

  const handlePencil = (user: User) => {
    setSelectedUser(user);
    formPencil.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      employee_role: user.employee_role || null,
      avatar: user.avatar,
    });
    setOldPassword("");
    setBypassOldPassword(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setIsPencilSheetOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setPasswordInfo(null);
    setShowPasswordInfo(false);
    setIsViewSheetOpen(true);
  };

  const handleViewPassword = async () => {
    if (!selectedUser) return;

    setLoadingPassword(true);
    try {
      const response = await axiosPrivate.get(
        `/users/${selectedUser._id}/password`,
      );
      setPasswordInfo(response.data);
      setShowPasswordInfo(true);
      toast({
        title: "Password Info Retrieved",
        description: "Viewing password information (dev mode only)",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to retrieve password information. Make sure you're in development mode.",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-warning-lighter text-warning-main";
      case "employee":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-success-lighter text-success-main";
      default:
        return "bg-grey-100 text-grey-800";
    }
  };

  const getEmployeeRoleColor = (employeeRole: string) => {
    switch (employeeRole) {
      case "packer":
        return "bg-info-lighter text-info-dark";
      case "deliveryman":
        return "bg-orange-100 text-orange-800";
      case "accounts":
        return "bg-emerald-100 text-emerald-800";
      case "incharge":
        return "bg-secondary-lighter text-secondary-dark";
      case "call_center":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-grey-100 text-grey-800";
    }
  };

  const handleAddUser = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/users", data);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      formAdd.reset();
      setShowAddPassword(false);
      setIsAddSheetOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: FormData) => {
    if (!selectedUser) return;

    // Check if password is being updated
    if (data.password && data.password.trim() !== "") {
      // If admin in dev mode can bypass old password check
      const isDev = import.meta.env.DEV;
      if (!bypassOldPassword) {
        // Require old password verification
        if (!oldPassword || oldPassword.trim() === "") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter the current password to update it",
          });
          return;
        }
      } else if (!isDev || !isAdmin) {
        // Only allow bypass in dev mode for admins
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Bypass mode is only available for admins in development",
        });
        return;
      }
    }

    setFormLoading(true);
    try {
      const updateData: FormData & { oldPassword?: string } = { ...data };

      // Add old password if provided and not bypassing
      if (data.password && data.password.trim() !== "" && !bypassOldPassword) {
        updateData.oldPassword = oldPassword;
      }

      await axiosPrivate.put(`/users/${selectedUser._id}`, updateData);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsPencilSheetOpen(false);
      setOldPassword("");
      setBypassOldPassword(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update user";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    setDeletingId(selectedUser._id);
    setIsDeleteModalOpen(false);
    try {
      await axiosPrivate.delete(`/users/${selectedUser._id}`);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-grey-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-grey-900">
            {isAdminPage ? "Admin" : "All Users"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 md:mt-1 hidden">
            <p className="text-grey-600">
              {isAdminPage
                ? "Manage system administrators and their permissions"
                : "Manage all system users, roles, and profiles"}
            </p>
            {user?.role === "employee" && user?.employee_role && (
              <Badge
                className={cn(
                  "capitalize text-xs",
                  (() => {
                    switch (user.employee_role) {
                      case "packer":
                        return "bg-info-main/90 hover:bg-info-main text-white";
                      case "deliveryman":
                        return "bg-success-main/90 hover:bg-success-main text-white";
                      case "accounts":
                        return "bg-warning-main/90 hover:bg-warning-main text-white";
                      case "incharge":
                        return "bg-purple-500/90 hover:bg-purple-600 text-white";
                      case "call_center":
                        return "bg-pink-500/90 hover:bg-pink-600 text-white";
                      default:
                        return "bg-grey-500/90 hover:bg-grey-600 text-white";
                    }
                  })(),
                )}
              >
                {user.employee_role.replace("_", " ")}
              </Badge>
            )}
            {isAdmin && (
              <Badge className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-primary-main" />
            {loading || refreshing ? (
              <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-primary-main animate-spin" />
            ) : (
              <span className="text-xl md:text-2xl font-bold text-primary-main">
                {total}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-primary-main text-primary-main hover:bg-primary-main/10"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
          {isAdmin && canPerformCRUD && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                className="bg-primary-dark hover:bg-primary-darker text-white font-['DM_Sans',sans-serif] text-sm shadow-sm"
                disabled={isPreviewRole}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => setIsAddSheetOpen(true)}
                size="sm"
                className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isAdminPage ? "Create Admin" : "Add User"}
              </Button>
            </div>
          )}
          {isAdmin && isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning-lighter  border border-warning-lighter  rounded-md">
              <span className="text-xs text-warning-dark ">
                👁️ Read-only mode
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters Line */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        {/* Left: Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 rounded-full bg-grey-50 border-transparent focus-visible:ring-1 focus-visible:ring-grey-200 h-9 text-sm"
          />
        </div>

        {/* Right: Dropdowns */}
        <div className="flex  items-center justify-end gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="h-9 rounded-full border-grey-200 text-xs text-grey-600 bg-white min-w-[120px]">
              <SelectValue placeholder="Role format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
            </SelectContent>
          </Select>

          {/* Employee Role Filter (conditional) */}
          {roleFilter === "employee" && (
            <Select
              value={employeeRoleFilter}
              onValueChange={setEmployeeRoleFilter}
            >
              <SelectTrigger className="h-9 rounded-full border-grey-200 text-xs text-grey-600 bg-white min-w-[120px]">
                <SelectValue placeholder="Emp Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="call_center">Call Center</SelectItem>
                <SelectItem value="packer">Packer</SelectItem>
                <SelectItem value="deliveryman">Delivery Person</SelectItem>
                <SelectItem value="accounts">Accounts</SelectItem>
                <SelectItem value="incharge">Incharge</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Sort Order */}
          <Select value={sortOrder} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="h-9 rounded-full border-grey-200 text-xs text-grey-600 bg-white min-w-[120px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* Per Page */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <Select
              value={
                perPage >= 10000
                  ? "all"
                  : customPerPage !== ""
                    ? "custom"
                    : ![10, 20, 30, 50, 100].includes(perPage)
                      ? "custom"
                      : perPage.toString()
              }
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="h-9 rounded-full border-grey-200 text-xs text-grey-600 bg-white w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / Page</SelectItem>
                <SelectItem value="20">20 / Page</SelectItem>
                <SelectItem value="30">30 / Page</SelectItem>
                <SelectItem value="50">50 / Page</SelectItem>
                <SelectItem value="100">100 / Page</SelectItem>
                <SelectItem value="all">View All</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Per Page Input */}
        {customPerPage !== "" && (
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-grey-600">Custom:</Label>
            <Input
              type="number"
              placeholder="Enter number"
              value={customPerPage}
              onChange={(e) => handleCustomPerPageChange(e.target.value)}
              className="w-32"
              min="1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomPerPageSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCustomPerPageSubmit}
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomPerPage("")}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && canPerformCRUD && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-info-lighter border border-info-lighter rounded-lg p-3">
            <div className="flex items-center gap-2 text-info-dark">
              <Users className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers([])}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                Unselect All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected
              user(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Users"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="sm:max-w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add User</SheetTitle>
            <SheetDescription>Create a new user account</SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddUser)}
              className="space-y-6 mt-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        disabled={formLoading}
                        className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showAddPassword ? "text" : "password"}
                          {...field}
                          disabled={formLoading}
                          className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowAddPassword(!showAddPassword)}
                        >
                          {showAddPassword ? (
                            <EyeOff className="h-4 w-4 text-grey-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-grey-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Role
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset employee_role when changing role
                        if (value !== "employee") {
                          formAdd.setValue("employee_role", null);
                        }
                      }}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              {formAdd.watch("role") === "employee" && (
                <FormField
                  control={formAdd.control}
                  name="employee_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-grey-700 font-medium">
                        Employee Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200">
                            <SelectValue placeholder="Select employee role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call_center">
                            Call Center
                          </SelectItem>
                          <SelectItem value="packer">Packer</SelectItem>
                          <SelectItem value="deliveryman">
                            Delivery Person
                          </SelectItem>
                          <SelectItem value="accounts">Accounts</SelectItem>
                          <SelectItem value="incharge">Incharge</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-error-main text-xs" />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={formAdd.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Avatar
                    </FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <SheetFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSheetOpen(false)}
                  disabled={formLoading}
                  className="border-grey-300 text-grey-700 hover:bg-grey-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Pencil User Sheet */}
      <Sheet open={isPencilSheetOpen} onOpenChange={setIsPencilSheetOpen}>
        <SheetContent className="sm:max-w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>Update user information</SheetDescription>
          </SheetHeader>
          <Form {...formPencil}>
            <form
              onSubmit={formPencil.handleSubmit(handleUpdateUser)}
              className="space-y-6 mt-4"
            >
              <FormField
                control={formPencil.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={formPencil.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        disabled={formLoading}
                        className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />

              {/* Old Password Field - Required when updating password */}
              {formPencil.watch("password") &&
                formPencil.watch("password")?.trim() !== "" &&
                !bypassOldPassword && (
                  <div className="space-y-2">
                    <Label className="text-grey-700 font-medium">
                      Current Password{" "}
                      <span className="text-error-main">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={formLoading}
                        className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4 text-grey-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-grey-500" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-grey-500">
                      Required to verify it's you before changing password
                    </p>
                  </div>
                )}

              {/* New Password Field with Show/Hide */}
              <FormField
                control={formPencil.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      New Password (leave empty to keep current)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          {...field}
                          placeholder="Leave empty to keep current password"
                          disabled={formLoading}
                          className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-grey-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-grey-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />

              {/* Bypass Old Password - Admin Only in Dev Mode */}
              {formPencil.watch("password") &&
                formPencil.watch("password")?.trim() !== "" &&
                isAdmin &&
                import.meta.env.DEV && (
                  <div className="flex items-center space-x-2 p-3 bg-warning-lighter border border-warning-lighter rounded-lg">
                    <Checkbox
                      id="bypassPassword"
                      checked={bypassOldPassword}
                      onCheckedChange={(checked) =>
                        setBypassOldPassword(checked === true)
                      }
                      disabled={formLoading}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="bypassPassword"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-warning-main" />
                          <span className="text-warning-darker">
                            Bypass old password verification (Dev Mode)
                          </span>
                        </div>
                      </label>
                      <p className="text-xs text-warning-dark mt-1">
                        Admin privilege: Update password without current
                        password verification
                      </p>
                    </div>
                  </div>
                )}

              <FormField
                control={formPencil.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Role
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset employee_role when changing role
                        if (value !== "employee") {
                          formPencil.setValue("employee_role", null);
                        }
                      }}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              {formPencil.watch("role") === "employee" && (
                <FormField
                  control={formPencil.control}
                  name="employee_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-grey-700 font-medium">
                        Employee Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="border-grey-300 rounded-lg focus:ring-2 focus:ring-secondary-main focus:border-secondary-main transition-all duration-200">
                            <SelectValue placeholder="Select employee role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call_center">
                            Call Center
                          </SelectItem>
                          <SelectItem value="packer">Packer</SelectItem>
                          <SelectItem value="deliveryman">
                            Delivery Person
                          </SelectItem>
                          <SelectItem value="accounts">Accounts</SelectItem>
                          <SelectItem value="incharge">Incharge</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-error-main text-xs" />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={formPencil.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grey-700 font-medium">
                      Avatar
                    </FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-error-main text-xs" />
                  </FormItem>
                )}
              />
              <SheetFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPencilSheetOpen(false)}
                  disabled={formLoading}
                  className="border-grey-300 text-grey-700 hover:bg-grey-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Export Users Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription className="text-grey-600">
              Choose the format and scope of the data you want to export.
              Exporting "All Data" will download all matching records regardless
              of pagination.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-grey-900">Format</h4>
              <div className="flex gap-4">
                <div
                  onClick={() => setExportFormat("excel")}
                  className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                    exportFormat === "excel"
                      ? "border-primary-main bg-primary-lighter/30"
                      : "border-grey-200 hover:border-grey-400"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${exportFormat === "excel" ? "text-primary-main" : "text-grey-700"}`}
                  >
                    Excel (.xlsx)
                  </p>
                </div>
                <div
                  onClick={() => setExportFormat("pdf")}
                  className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                    exportFormat === "pdf"
                      ? "border-primary-main bg-primary-lighter/30"
                      : "border-grey-200 hover:border-grey-400"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${exportFormat === "pdf" ? "text-primary-main" : "text-grey-700"}`}
                  >
                    PDF (.pdf)
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-grey-900">Scope</h4>
              <div className="flex gap-4">
                <div
                  onClick={() => setExportScope("page")}
                  className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                    exportScope === "page"
                      ? "border-primary-main bg-primary-lighter/30"
                      : "border-grey-200 hover:border-grey-400"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${exportScope === "page" ? "text-primary-main" : "text-grey-700"}`}
                  >
                    Current Page
                  </p>
                </div>
                <div
                  onClick={() => setExportScope("all")}
                  className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                    exportScope === "all"
                      ? "border-primary-main bg-primary-lighter/30"
                      : "border-grey-200 hover:border-grey-400"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${exportScope === "all" ? "text-primary-main" : "text-grey-700"}`}
                  >
                    All Data
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
              className="text-grey-600 border-grey-200 hover:bg-grey-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportLoading}
              className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm"
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Export File"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              disabled={deleteLoading}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
              className="bg-error-main hover:bg-error-dark text-white"
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Table - Desktop View (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:block overflow-hidden mt-4"
      >
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-grey-50">
                <TableHead className="text-xs uppercase font-bold text-grey-500 w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(perPage)].map((_, index) => (
                <TableRow key={index} className="hover:bg-grey-100">
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-grey-50">
                {canPerformCRUD && (
                  <TableHead className="text-xs uppercase font-bold text-grey-500 w-12">
                    <Checkbox
                      checked={
                        displayUsers.length > 0 &&
                        selectedUsers.length === displayUsers.length
                      }
                      onCheckedChange={handleSelectAllUsers}
                      aria-label="Select all users"
                    />
                  </TableHead>
                )}
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Avatar
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Name
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Email
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Role
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Created At
                </TableHead>
                <TableHead className="text-xs uppercase font-bold text-grey-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.length > 0 ? (
                displayUsers.map((user) =>
                  deletingId === user._id ? (
                    <TableRow
                      key={`skeleton-${user._id}`}
                      className="hover:bg-grey-100 opacity-50 pointer-events-none"
                    >
                      {canPerformCRUD && (
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={user._id} className="hover:bg-grey-100">
                      {canPerformCRUD && (
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onCheckedChange={(checked) =>
                              handleSelectUser(user._id, checked === true)
                            }
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="h-12 w-12 rounded-full bg-info-lighter flex items-center justify-center text-info-main font-semibold shadow-sm overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          isPreviewRole &&
                            "blur-md select-none pointer-events-none",
                        )}
                      >
                        {user.name}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-grey-600",
                          isPreviewRole &&
                            "blur-md select-none pointer-events-none",
                        )}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            className={cn(
                              "capitalize",
                              getRoleColor(user.role),
                            )}
                          >
                            {user.role}
                          </Badge>
                          {user.role === "employee" && user.employee_role && (
                            <Badge
                              className={cn(
                                "capitalize text-xs",
                                getEmployeeRoleColor(user.employee_role),
                              )}
                            >
                              {user.employee_role}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(user)}
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && canPerformCRUD && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePencil(user)}
                                title="Pencil user"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(user)}
                                className="text-error-main hover:text-error-dark"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isAdmin && isReadOnly && (
                            <span className="text-xs text-muted-foreground px-2">
                              View only
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="h-12 w-12 text-grey-400" />
                      <div>
                        <p className="text-lg font-medium text-grey-900">
                          No users found
                        </p>
                        <p className="text-sm text-grey-500">
                          {searchTerm || roleFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Users will appear here when they register"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Users Cards - Mobile/Tablet View (hidden on desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:hidden space-y-4"
      >
        {loading ? (
          // Loading skeleton for mobile cards
          [...Array(perPage)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          ))
        ) : displayUsers.length > 0 ? (
          displayUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar and Checkbox */}
                <div className="flex flex-col items-center gap-2">
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user._id, checked === true)
                    }
                    aria-label={`Select ${user.name}`}
                  />
                  <div className="h-16 w-16 rounded-full bg-info-lighter flex items-center justify-center text-info-main font-semibold shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-semibold text-grey-900 text-lg truncate",
                      isPreviewRole &&
                        "blur-md select-none pointer-events-none",
                    )}
                  >
                    {user.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm text-grey-600 truncate",
                      isPreviewRole &&
                        "blur-md select-none pointer-events-none",
                    )}
                  >
                    {user.email}
                  </p>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      className={cn("capitalize", getRoleColor(user.role))}
                    >
                      {user.role}
                    </Badge>
                    {user.role === "employee" && user.employee_role && (
                      <Badge
                        className={cn(
                          "capitalize text-xs",
                          getEmployeeRoleColor(user.employee_role),
                        )}
                      >
                        {user.employee_role}
                      </Badge>
                    )}
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-grey-500 mt-2">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(user)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePencil(user)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Pencil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      className="flex items-center gap-2 text-error-main hover:text-error-dark border-error-lighter hover:bg-error-lighter"
                    >
                      <Ban className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12">
            <div className="flex flex-col items-center gap-4">
              <Users className="h-12 w-12 text-grey-400" />
              <div className="text-center">
                <p className="text-lg font-medium text-grey-900">
                  No users found
                </p>
                <p className="text-sm text-grey-500">
                  {searchTerm || roleFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Users will appear here when they register"}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination Controls */}
      {loading ? (
        <div className="flex items-center justify-between bg-white rounded-lg border border-grey-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ) : (
        total > perPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-grey-200 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="text-sm text-grey-600">
                Showing{" "}
                <span className="font-medium">{(page - 1) * perPage + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * perPage, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> users
              </div>
              <div className="text-sm text-grey-600">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )
      )}

      {/* Simple message for single page */}
      {!loading && total > 0 && total <= perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-grey-600 bg-white rounded-lg border border-grey-200 px-4 py-3"
        >
          Showing all <span className="font-medium">{total}</span> users
        </motion.div>
      )}

      {/* View User Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>View complete user information</SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-info-lighter flex items-center justify-center text-info-main font-semibold shadow-sm overflow-hidden">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-2xl font-bold text-grey-900",
                      isPreviewRole &&
                        "blur-md select-none pointer-events-none",
                    )}
                  >
                    {selectedUser.name}
                  </h3>
                  <p
                    className={cn(
                      "text-grey-600",
                      isPreviewRole &&
                        "blur-md select-none pointer-events-none",
                    )}
                  >
                    {selectedUser.email}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      className={cn(
                        "capitalize",
                        getRoleColor(selectedUser.role),
                      )}
                    >
                      {selectedUser.role}
                    </Badge>
                    {selectedUser.role === "employee" &&
                      selectedUser.employee_role && (
                        <Badge
                          className={cn(
                            "capitalize",
                            getEmployeeRoleColor(selectedUser.employee_role),
                          )}
                        >
                          {selectedUser.employee_role}
                        </Badge>
                      )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-grey-600">
                    User ID
                  </Label>
                  <p className="text-lg font-semibold">{selectedUser._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-grey-600">
                    Created At
                  </Label>
                  <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
