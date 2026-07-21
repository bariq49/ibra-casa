import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2, RefreshCw, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

const aboutPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mission: z.string().min(1, "Mission is required"),
  vision: z.string().min(1, "Vision is required"),
  stats: z
    .array(
      z.object({
        value: z.string().min(1, "Value is required"),
        label: z.string().min(1, "Label is required"),
      }),
    )
    .max(6, "Maximum 6 stats allowed"),
  heroImage: z.string().optional(),
  heroImageSmall: z.string().optional(),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        bulletPoints: z.array(z.string()),
        imageOne: z.string().optional(),
        imageTwo: z.string().optional(),
      }),
    )
    .default([])
    .optional(),
});

type AboutPageFormData = z.infer<typeof aboutPageSchema>;

export default function AboutPageConfig() {
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const form = useForm<AboutPageFormData>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
      title: "",
      mission: "",
      vision: "",
      stats: [],
      heroImage: "",
      heroImageSmall: "",
      features: [],
    },
  });

  const {
    fields: statFields,
    append: appendStat,
    remove: removeStat,
  } = useFieldArray({
    control: form.control,
    name: "stats",
  });

  const fetchAboutConfig = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/about-page");
      if (response.data.success && response.data.data) {
        form.reset({
          title: response.data.data.title || "",
          mission: response.data.data.mission || "",
          vision: response.data.data.vision || "",
          stats: response.data.data.stats || [],
          heroImage: response.data.data.heroImage || "",
          heroImageSmall: response.data.data.heroImageSmall || "",
          features: response.data.data.features || [],
        });
      }
    } catch (error) {
      console.error("Failed to load about page config", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load about page configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutConfig();
  }, []);

  const handleSubmit = async (data: AboutPageFormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.put("/about-page", data);
      form.reset(data);
      toast({
        title: "Success",
        description: "About Page configuration updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to save about page config", error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">About Page Config</h1>
          <p className="text-muted-foreground">
            Manage the content for the Storefront&apos;s About page here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchAboutConfig}
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            size="sm"
            disabled={formLoading || loading || !form.formState.isDirty}
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Left: Main Content */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Main Content</CardTitle>
                <CardDescription>
                  Update the Title, Mission, and Vision sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Empowering Better Health at Home"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="heroImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Main Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            disabled={loading}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heroImageSmall"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Small Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            disabled={loading}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Mission</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[150px]"
                            placeholder="Describe your company's mission..."
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Vision</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[150px]"
                            placeholder="Describe your company's vision for the future..."
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right: Statistics Blocks */}
            <Card className="lg:col-span-2 lg:sticky lg:top-6">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1.5">
                  <CardTitle>Statistics Blocks</CardTitle>
                  <CardDescription>
                    Stats shown on the About page hero. Leave empty to hide.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => appendStat({ value: "", label: "" })}
                  disabled={statFields.length >= 6 || loading}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {statFields.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No stats yet. Click Add to create one.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {statFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-3 items-start bg-muted/40 border p-4 rounded-xl"
                      >
                        <div className="space-y-3 flex-1 min-w-0">
                          <FormField
                            control={form.control}
                            name={`stats.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value/Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. 1M+, 12+"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`stats.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label Text</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Orders Delivered"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 shrink-0 mt-[26px]"
                          onClick={() => removeStat(index)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
