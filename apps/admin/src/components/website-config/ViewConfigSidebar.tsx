import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebsiteConfig {
  _id: string;
  pageType: string;
  componentType: string;
  title: string;
  description?: string;
  weight: number;
  isActive: boolean;
  settings: {
    images?: string[];
    [key: string]: unknown;
  };
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

interface ViewConfigSidebarProps {
  open: boolean;
  onClose: () => void;
  config: WebsiteConfig | null;
}

const COMPONENT_TYPE_COLORS: Record<string, string> = {
  banner: "bg-purple-500/10 text-purple-700 border-purple-200",
  products: "bg-info-main/10 text-info-dark border-info-lighter",
  ads: "bg-orange-500/10 text-orange-700 border-orange-200",
  carousel: "bg-pink-500/10 text-pink-700 border-pink-200",
  "featured-categories": "bg-success-main/10 text-success-dark border-success-lighter",
  brands: "bg-secondary-main/10 text-secondary-dark border-secondary-lighter",
  testimonials: "bg-warning-main/10 text-warning-dark border-warning-lighter",
  newsletter: "bg-teal-500/10 text-teal-700 border-teal-200",
  "custom-html": "bg-grey-500/10 text-grey-700 border-grey-200",
};

export default function ViewConfigSidebar({
  open,
  onClose,
  config,
}: ViewConfigSidebarProps) {
  if (!config) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-between">
            Component Details
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-linear-to-br from-indigo-50 to-purple-50   border border-secondary-lighter  rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-grey-900  mb-2">
                    {config.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`${
                        COMPONENT_TYPE_COLORS[config.componentType] ||
                        "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {config.componentType}
                    </Badge>
                    <Badge variant={config.isActive ? "default" : "secondary"}>
                      {config.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      Weight: {config.weight}
                    </Badge>
                  </div>
                </div>
              </div>
              {config.description && (
                <p className="text-sm text-grey-600  mt-3">
                  {config.description}
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-white  border rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-linear-to-b from-indigo-600 to-purple-600 rounded-full"></span>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Page Type
                  </p>
                  <p className="font-medium capitalize">{config.pageType}</p>
                </div>
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Component Type
                  </p>
                  <p className="font-medium capitalize">
                    {config.componentType.replace(/-/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Display Order
                  </p>
                  <p className="font-medium">{config.weight}</p>
                </div>
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Status
                  </p>
                  <p className="font-medium">
                    {config.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            {config.settings.images && config.settings.images.length > 0 && (
              <div className="bg-white  border rounded-lg p-5">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-linear-to-b from-purple-600 to-pink-600 rounded-full"></span>
                  Images ({config.settings.images.length})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {config.settings.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white font-medium">
                          Image {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Object (if has more than just images) */}
            {Object.keys(config.settings).filter((key) => key !== "images")
              .length > 0 && (
              <div className="bg-white  border rounded-lg p-5">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-linear-to-b from-pink-600 to-orange-600 rounded-full"></span>
                  Advanced Settings
                </h4>
                <pre className="bg-grey-100  p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(config.settings).filter(
                        ([key]) => key !== "images"
                      )
                    ),
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white  border rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-linear-to-b from-indigo-600 to-blue-600 rounded-full"></span>
                Metadata
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Component ID
                  </p>
                  <p className="font-mono text-sm">{config._id}</p>
                </div>
                {config.createdBy && (
                  <div>
                    <p className="text-xs text-grey-500  mb-1">
                      Created By
                    </p>
                    <p className="font-medium">
                      {config.createdBy.name}{" "}
                      <span className="text-grey-500 text-sm">
                        ({config.createdBy.email})
                      </span>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Created At
                  </p>
                  <p className="font-medium">{formatDate(config.createdAt)}</p>
                </div>
                {config.updatedBy && (
                  <div>
                    <p className="text-xs text-grey-500  mb-1">
                      Last Updated By
                    </p>
                    <p className="font-medium">
                      {config.updatedBy.name}{" "}
                      <span className="text-grey-500 text-sm">
                        ({config.updatedBy.email})
                      </span>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-grey-500  mb-1">
                    Last Updated
                  </p>
                  <p className="font-medium">{formatDate(config.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
