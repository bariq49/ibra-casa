import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Eye,
  Settings,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Grid3x3,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import useAuthStore from "@/store/useAuthStore";
import AddConfigSidebar from "@/components/website-config/AddConfigSidebar";
import ViewConfigSidebar from "@/components/website-config/ViewConfigSidebar";
import ConfigSkeleton from "@/components/website-config/ConfigSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WebsiteConfig {
  _id: string;
  pageType: string;
  componentType: string;
  title: string;
  description?: string;
  weight: number;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page", icon: LayoutDashboard },
  { value: "product", label: "Product Page", icon: ShoppingBag },
  { value: "blog", label: "Blog Page", icon: FileText },
  { value: "category", label: "Category Page", icon: Grid3x3 },
  { value: "about", label: "About Page", icon: Info },
];

const COMPONENT_TYPE_COLORS: Record<string, string> = {
  banner: "bg-purple-500/10 text-purple-700 border-purple-200",
  products: "bg-info-main/10 text-info-dark border-info-lighter",
  ads: "bg-orange-500/10 text-orange-700 border-orange-200",
  carousel: "bg-pink-500/10 text-pink-700 border-pink-200",
  "featured-categories":
    "bg-success-main/10 text-success-dark border-success-lighter",
  brands: "bg-secondary-main/10 text-secondary-dark border-secondary-lighter",
  testimonials: "bg-warning-main/10 text-warning-dark border-warning-lighter",
  newsletter: "bg-teal-500/10 text-teal-700 border-teal-200",
  "custom-html": "bg-grey-500/10 text-grey-700 border-grey-200",
};

interface SortableItemProps {
  config: WebsiteConfig;
  onView: (config: WebsiteConfig) => void;
  onEdit: (config: WebsiteConfig) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ config, onView, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: config._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative bg-white  border rounded-lg p-4 hover:shadow-md transition-all ${
        !config.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-grey-400 hover:text-grey-600"
        >
          <GripVertical size={20} />
        </div>

        {/* Weight Badge */}
        <div className="shrink-0">
          <Badge variant="outline" className="font-mono">
            #{config.weight}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{config.title}</h4>
            <Badge
              className={`text-xs ${
                COMPONENT_TYPE_COLORS[config.componentType] ||
                "bg-grey-100 text-grey-700"
              }`}
            >
              {config.componentType}
            </Badge>
          </div>
          {config.description && (
            <p className="text-xs text-grey-500  truncate">
              {config.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(config)}
            className="h-8 w-8 text-secondary-main hover:text-secondary-dark hover:bg-secondary-lighter "
            title="View Details"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(config)}
            className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 "
            title="Edit Component"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(config._id)}
            className="h-8 w-8 text-error-main hover:text-error-dark hover:bg-error-lighter "
            title="Delete Component"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WebsiteConfigPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [configs, setConfigs] = useState<WebsiteConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WebsiteConfig | null>(
    null,
  );
  const [viewingConfig, setViewingConfig] = useState<WebsiteConfig | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const { token } = useAuthStore();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchConfigs = async (pageType: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/website-config/page/${pageType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConfigs(response.data?.data || []);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message ||
          "Failed to fetch configurations",
      });
      setConfigs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAddConfig = () => {
    setEditingConfig(null);
    setSidebarOpen(true);
  };

  const handleEditConfig = (config: WebsiteConfig) => {
    setEditingConfig(config);
    setSidebarOpen(true);
  };

  const handleViewConfig = (config: WebsiteConfig) => {
    setViewingConfig(config);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!configToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/website-config/${configToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });
      fetchConfigs(activeTab);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message ||
          "Failed to delete configuration",
      });
    } finally {
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = configs.findIndex((c) => c._id === active.id);
    const newIndex = configs.findIndex((c) => c._id === over.id);

    const newConfigs = arrayMove(configs, oldIndex, newIndex);
    setConfigs(newConfigs);

    // Update on server
    try {
      await axios.put(
        `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/website-config/reorder`,
        {
          pageType: activeTab,
          configs: newConfigs.map((c: WebsiteConfig) => ({ id: c._id })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast({
        title: "Success",
        description: "Configuration order updated",
      });
      fetchConfigs(activeTab);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message ||
          "Failed to reorder configurations",
      });
      // Revert on error
      fetchConfigs(activeTab);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setEditingConfig(null);
    fetchConfigs(activeTab);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900  flex items-center gap-2">
            <Settings className="text-primary" size={32} />
            Website Configuration
          </h1>
          <p className="text-grey-600  mt-1">
            Manage website components and their display order
          </p>
        </div>
        <Button
          onClick={handleAddConfig}
          className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
        >
          <Plus size={20} className="mr-2" />
          Add Component
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          {PAGE_TYPES.map((page) => {
            const Icon = page.icon;
            const count = (configs || []).filter(
              (c) => c.pageType === page.value,
            ).length;
            return (
              <TabsTrigger
                key={page.value}
                value={page.value}
                className="gap-2"
              >
                <Icon size={16} />
                {page.label}
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PAGE_TYPES.map((page) => (
          <TabsContent
            key={page.value}
            value={page.value}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <page.icon size={20} />
                    {page.label} Components
                  </span>
                  <Badge variant="outline">{configs.length} components</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ConfigSkeleton />
                ) : configs.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings
                      size={48}
                      className="mx-auto text-grey-300 mb-4"
                    />
                    <p className="text-grey-500  mb-4">
                      No components configured for this page yet
                    </p>
                    <Button
                      onClick={handleAddConfig}
                      className="bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
                    >
                      <Plus size={16} className="mr-2" />
                      Add First Component
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={configs.map((c) => c._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {configs.map((config) => (
                            <SortableItem
                              key={config._id}
                              config={config}
                              onView={handleViewConfig}
                              onEdit={handleEditConfig}
                              onDelete={handleDeleteConfig}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Sidebar */}
      <AddConfigSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        editingConfig={editingConfig}
        defaultPageType={activeTab}
      />

      {/* View Details Sidebar */}
      <ViewConfigSidebar
        open={!!viewingConfig}
        onClose={() => setViewingConfig(null)}
        config={viewingConfig}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                component configuration and remove it from the website.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => { setConfigToDelete(null); setDeleteDialogOpen(false); }}>
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-error-main hover:bg-error-dark text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
