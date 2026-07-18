import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, RefreshCw, Save, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const FoundationUpload = ({ 
  value, 
  onChange, 
  disabled,
  placeholder 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  disabled?: boolean;
  placeholder: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const displayPreview = preview || value;

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 4000000,
    maxFiles: 1,
    disabled,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        try {
          const base64 = await convertToBase64(acceptedFiles[0]);
          onChange(base64);
          setPreview(base64);
        } catch (error) {
          console.error("Error converting file to base64:", error);
        }
      }
    },
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreview(null);
  };

  return (
    <div
      {...getRootProps({
        className:
          "w-full h-full relative flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors bg-white/50 overflow-hidden",
      })}
    >
      <input {...getInputProps()} />
      {displayPreview && !displayPreview.includes("picsum.photos") ? (
        <>
          <img
            src={displayPreview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full shadow-md"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X size={14} color="white" />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center z-10">
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs font-semibold text-muted-foreground">Upload</p>
          <p className="text-[10px] text-muted-foreground/70 hidden sm:block whitespace-pre-wrap">{placeholder}</p>
        </div>
      )}
    </div>
  );
};

export default function CareerPageConfig() {
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [collageImages, setCollageImages] = useState<string[]>([]);
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const fetchCareerConfig = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/career-page");
      if (response.data.success && response.data.data) {
        setCollageImages(response.data.data.collageImages || []);
      }
    } catch (error) {
      console.error("Failed to load career page config", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load career page configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerConfig();
  }, []);

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      await axiosPrivate.put("/career-page", { collageImages });
      toast({
        title: "Success",
        description: "Career Page configuration updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to save career page config", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update configuration",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newCollage = [...collageImages];
    // pad array if not fully expanded
    while (newCollage.length < 5) newCollage.push("");
    newCollage[index] = value;
    setCollageImages(newCollage);
  };

  const isSaveDisabled = formLoading || loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Career Page Config</h1>
          <p className="text-muted-foreground">
            Manage the image collage for the Storefront's Careers page exactly as it appears.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchCareerConfig}
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleSubmit}
            size="sm"
            disabled={isSaveDisabled}
          >
            {formLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Foundation Layout</CardTitle>
            <CardDescription>
              Upload images directly into the masonry grid to preview exactly how they configure onto the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50/50 p-6 md:p-10 rounded-2xl border">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center max-w-4xl mx-auto">
                {/* Image 1 */}
                <div className="space-y-4 md:space-y-6 lg:-translate-y-8">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
                    <FoundationUpload 
                      value={collageImages[0] || ""} 
                      onChange={(v) => handleImageChange(0, v)} 
                      disabled={loading}
                      placeholder="3:4 Ratio\n(Tall)"
                    />
                  </div>
                </div>
                {/* Images 2 & 3 */}
                <div className="space-y-4 md:space-y-6 lg:translate-y-12">
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group">
                    <FoundationUpload 
                      value={collageImages[1] || ""} 
                      onChange={(v) => handleImageChange(1, v)} 
                      disabled={loading}
                      placeholder="1:1 Ratio\n(Square)"
                    />
                  </div>
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted group">
                    <FoundationUpload 
                      value={collageImages[2] || ""} 
                      onChange={(v) => handleImageChange(2, v)} 
                      disabled={loading}
                      placeholder="4:3 Ratio\n(Wide)"
                    />
                  </div>
                </div>
                {/* Remote Friendly Box & Image 4 */}
                <div className="space-y-4 md:space-y-6 lg:-translate-y-4">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted group bg-primary flex flex-col items-center justify-center p-4">
                    <h3 className="text-white font-bold text-xl lg:text-3xl text-center leading-tight">
                      100%
                      <br />
                      <span className="text-sm lg:text-lg font-medium opacity-80 mt-1 lg:mt-2 block">
                        Remote Friendly
                      </span>
                    </h3>
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group">
                    <FoundationUpload 
                      value={collageImages[3] || ""} 
                      onChange={(v) => handleImageChange(3, v)} 
                      disabled={loading}
                      placeholder="1:1 Ratio\n(Square)"
                    />
                  </div>
                </div>
                {/* Image 5 */}
                <div className="space-y-4 md:space-y-6 lg:translate-y-8">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
                    <FoundationUpload 
                      value={collageImages[4] || ""} 
                      onChange={(v) => handleImageChange(4, v)} 
                      disabled={loading}
                      placeholder="3:4 Ratio\n(Tall)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
