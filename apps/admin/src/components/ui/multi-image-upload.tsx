import { useState } from "react";
import { X, Upload, Loader2, GripVertical } from "lucide-react";
import { Button } from "./button";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getApiBaseUrl } from "@/lib/config";
const NEXT_PUBLIC_API_URL = getApiBaseUrl();

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  deferUpload?: boolean; // If true, converts to base64 instead of uploading immediately
  disableServerDelete?: boolean; // If true, only removes from frontend state and skips the DELETE API call
}

interface UploadingImage {
  index: number;
  preview: string;
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  disabled?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  onRemove: (index: number) => void;
}

function SortableImageItem({
  id,
  url,
  index,
  disabled,
  isUploading,
  isDeleting,
  onRemove,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg border-2 overflow-hidden bg-grey-100 ${
        index === 0 ? "border-info-main" : "border-success-main"
      } ${isDeleting ? "opacity-50 grayscale pointer-events-none" : "transition-all"}`}
    >
      <img
        src={url}
        alt={`Product ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Uploaded badge */}
      <div className="absolute top-2 left-2 bg-success-main text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
        Uploaded
      </div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className={`h-8 w-8 bg-white/20 rounded flex items-center justify-center ${isDeleting ? "cursor-not-allowed opacity-50" : "hover:bg-white/40 cursor-grab active:cursor-grabbing"}`}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-background" />
        </div>

        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8 z-50 "
          onClick={() => onRemove(index)}
          disabled={disabled || isUploading || isDeleting}
          title="Remove image"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin outline-hidden" />
          ) : (
            <X className="h-4 w-4 text-background" />
          )}
        </Button>
      </div>

      {/* Index badge */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}

export function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
  deferUpload = false,
  disableServerDelete = false, // Add disableServerDelete prop with a default
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingImage[]>([]);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed max
    if (value.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // If deferUpload is true, just convert to base64 and store
    if (deferUpload) {
      try {
        const base64Promises = Array.from(files).map((file) =>
          fileToBase64(file),
        );
        const base64Images = await Promise.all(base64Promises);
        onChange([...base64Images, ...value]);
      } catch (error) {
        console.error("Error converting images to base64:", error);
        alert("Failed to process images");
      }
      return;
    }

    // Original immediate upload logic
    // Create preview URLs and add to uploading state
    const newUploading: UploadingImage[] = Array.from(files).map(
      (file, index) => ({
        index: value.length + index,
        preview: URL.createObjectURL(file),
      }),
    );
    setUploading(newUploading);

    // Upload all files to API
    const uploadPromises = Array.from(files).map(async (file, index) => {
      try {
        // Convert file to base64
        const base64Image = await fileToBase64(file);

        // Get auth token from localStorage
        const authData = localStorage.getItem("auth");
        const token = authData ? JSON.parse(authData).token : null;

        // Upload to API server (which will use Cloudinary or S3 based on .env)
        const response = await axios.post(
          `${NEXT_PUBLIC_API_URL}/api/upload/test`,
          {
            image: base64Image,
            folder: "products",
            originalName: `upload_${Date.now()}_${index + 1}.jpg`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Clean up preview URL
        URL.revokeObjectURL(newUploading[index].preview);

        return response.data.result.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        // Clean up preview URL
        URL.revokeObjectURL(newUploading[index].preview);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(
      (url: string | null): url is string => url !== null,
    );

    if (validUrls.length > 0) {
      onChange([...validUrls, ...value]);
    }

    // Clear uploading state
    setUploading([]);

    // Reset file input
    event.target.value = "";
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = value[index];

    // If it's a local base64 preview, just remove it from state instantly
    if (imageUrl.startsWith("data:")) {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
      return;
    }

    if (disableServerDelete) {
      // Just remove from local state without calling DELETE API
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
      return;
    }

    try {
      setDeletingIndex(index);

      // Get auth token from localStorage
      const authData = localStorage.getItem("auth");
      const token = authData ? JSON.parse(authData).token : null;

      // Delete from Cloudinary/S3 through API
      await axios.delete(`${NEXT_PUBLIC_API_URL}/api/upload/delete`, {
        data: { identifier: imageUrl },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Remove from local state
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image from storage. Please try again.");
    } finally {
      setDeletingIndex(null);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex));
      }
    }
  };

  const canUploadMore = value.length < maxImages;
  const isUploading = uploading.length > 0;

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {(value.length > 0 || uploading.length > 0) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            <SortableContext items={value} strategy={rectSortingStrategy}>
              {/* Already uploaded images */}
              {value.map((url, index) => (
                <SortableImageItem
                  key={url}
                  id={url}
                  url={url}
                  index={index}
                  disabled={disabled}
                  isUploading={isUploading}
                  isDeleting={deletingIndex === index}
                  onRemove={handleRemoveImage}
                />
              ))}
            </SortableContext>

            {/* Uploading images with preview */}
            {uploading.map((uploadingImg) => (
              <div
                key={`loading-${uploadingImg.index}`}
                className="relative aspect-square rounded-lg border-2 border-info-main border-dashed bg-grey-100 overflow-hidden animate-pulse"
              >
                <img
                  src={uploadingImg.preview}
                  alt={`Uploading ${uploadingImg.index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Loading overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-2 bg-white/90 rounded-lg px-4 py-3 shadow-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-info-main" />
                    <span className="text-xs text-grey-700 font-semibold">
                      Uploading...
                    </span>
                  </div>
                </div>

                {/* Uploading badge */}
                <div className="absolute top-2 left-2 bg-info-main text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  New
                </div>

                {/* Index badge */}
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {uploadingImg.index + 1}
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {/* Upload Button */}
      {canUploadMore && (
        <div className="flex flex-col items-center gap-2">
          <label
            htmlFor="multi-image-upload"
            className={`cursor-pointer w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="border-2 border-dashed border-grey-300 rounded-lg p-8 hover:border-grey-400 transition-colors bg-grey-100 hover:bg-grey-100 flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-grey-400" />
              <div className="text-sm text-grey-600 text-center">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </div>
              <div className="text-xs text-grey-500">
                {value.length} of {maxImages} images uploaded
              </div>
            </div>
            <input
              id="multi-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={disabled || isUploading}
              className="hidden"
            />
          </label>

          {value.length > 0 && (
            <p className="text-xs text-grey-500 text-center">
              The first image will be used as the cover image
            </p>
          )}
        </div>
      )}

      {/* Max images reached */}
      {!canUploadMore && (
        <div className="text-sm text-grey-500 text-center p-4 bg-grey-100 rounded-lg border border-grey-200">
          Maximum number of images ({maxImages}) reached
        </div>
      )}
    </div>
  );
}
