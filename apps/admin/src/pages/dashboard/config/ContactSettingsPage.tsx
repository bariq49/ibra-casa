import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Save, Edit } from "lucide-react";

// Form schema
const contactSettingsSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().min(2, "Subtitle is required"),
  faqs: z.array(
    z.object({
      q: z.string().min(2, "Question is required"),
      a: z.string().min(2, "Answer is required"),
    })
  ),
});

type FormData = z.infer<typeof contactSettingsSchema>;

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      title: "We are happy to assist you",
      subtitle: "Here to help, anytime you need us.",
      faqs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosPrivate.get("/contact-page");
        if (res.data.data) {
          form.reset({
            title: res.data.data.title,
            subtitle: res.data.data.subtitle,
            faqs: res.data.data.faqs || [],
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load Contact Page config",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [axiosPrivate, form, toast]);

  const onSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.put("/contact-page", data);
      toast({
        title: "Success",
        description: "Contact settings updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings",
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Page Settings</h1>
        <p className="text-muted-foreground">Manage the content and FAQs of the public Contact Us page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Description)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Frequently Asked Questions (FAQs)</CardTitle>
              {isAdmin && canPerformCRUD && (
                <Button type="button" onClick={() => append({ q: "", a: "" })} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg bg-muted/20 flex gap-4 items-start">
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.q`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question {index + 1}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. What payment methods do you accept?" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.a`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Answer..." className="min-h-[80px]" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {isAdmin && canPerformCRUD && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-8 hover:text-error-main">
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No FAQs added yet.</p>
              )}
            </CardContent>
          </Card>

          {isAdmin && canPerformCRUD && (
            <Button type="submit" size="lg" disabled={formLoading} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" /> {formLoading ? "Saving..." : "Save Settings"}
            </Button>
          )}
        </form>
      </Form>
    </motion.div>
  );
}
