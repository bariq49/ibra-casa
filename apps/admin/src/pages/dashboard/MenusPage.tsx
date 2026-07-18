import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Loader2, Plus, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Schemas based on previous discussion
const baseMenuItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  href: z.string().min(1, "Link is required"),
});

// Define interfaces for recursion
export interface SubItem {
  title: string;
  href: string;
  subItems?: SubItem[];
}

export interface MegaMenuColumn {
  title: string;
  items: {
    title: string;
    href: string;
  }[];
}

export interface MenuFormData {
  title: string;
  href: string;
  order: number;
  isActive: boolean;
  isMega: boolean;
  subItems?: SubItem[];
  megaData?: MegaMenuColumn[];
}

// Recursive schema definition
const subItemSchema: z.ZodType<SubItem> = z.lazy(() =>
  z.object({
    title: z.string().min(1, "Title is required"),
    href: z.string().min(1, "Link is required"),
    subItems: z.array(subItemSchema).optional(),
  }),
);

const megaMenuColumnSchema = z.object({
  title: z.string().min(1, "Column title is required"),
  items: z.array(baseMenuItemSchema),
});

const menuSchema = z.object({
  title: z.string().min(1, "Title is required"),
  href: z.string().min(1, "Link is required"),
  order: z.number().int().min(0, "Order must be at least 0"),
  isActive: z.boolean(),
  isMega: z.boolean(),
  subItems: z.array(subItemSchema).optional(),
  megaData: z.array(megaMenuColumnSchema).optional(),
});

interface Menu extends MenuFormData {
  _id: string;
  createdAt: string;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema) as any,
    defaultValues: {
      title: "",
      href: "#",
      order: 0,
      isActive: true,
      isMega: false,
      subItems: [],
      megaData: [],
    },
  });

  const {
    fields: subItemsFields,
    append: appendSubItem,
    remove: removeSubItem,
  } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  const {
    fields: megaDataFields,
    append: appendMegaColumn,
    remove: removeMegaColumn,
  } = useFieldArray({
    control: form.control,
    name: "megaData",
  });

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get<Menu[]>("/menus");
      setMenus(response.data);
    } catch (error) {
      console.error("Failed to load menus", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load menus",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    form.reset({
      title: menu.title,
      href: menu.href,
      order: menu.order,
      isActive: menu.isActive,
      isMega: menu.isMega,
      subItems: menu.subItems || [],
      megaData: menu.megaData || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMenu(null);
    form.reset({
      title: "",
      href: "#",
      order: menus.length,
      isActive: true,
      isMega: false,
      subItems: [],
      megaData: [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: MenuFormData) => {
    setFormLoading(true);
    try {
      if (editingMenu) {
        await axiosPrivate.put(`/menus/${editingMenu._id}`, data);
        toast({
          title: "Success",
          description: "Menu updated successfully",
        });
      } else {
        await axiosPrivate.post("/menus", data);
        toast({
          title: "Success",
          description: "Menu created successfully",
        });
      }
      // Re-fetch before closing to ensure UI is up to date
      await fetchMenus();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save menu", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save menu",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMenu) return;

    try {
      await axiosPrivate.delete(`/menus/${selectedMenu._id}`);
      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchMenus();
    } catch (error: any) {
      console.error("Failed to delete menu", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete menu",
      });
    }
  };

  const handleToggleStatus = async (menu: Menu) => {
    try {
      await axiosPrivate.patch(`/menus/${menu._id}/toggle`);
      toast({
        title: "Success",
        description: `Menu ${
          menu.isActive ? "deactivated" : "activated"
        } successfully`,
      });
      fetchMenus();
    } catch (error) {
      console.error("Failed to toggle status", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle status",
      });
    }
  };

  // Helper to render nested sub-item fields recursively - simplified for now
  // Note: Recursive forms in react-hook-form can be complex.
  // For this implementation, we'll stick to 1 level of nesting for standard menus
  // and specific structure for mega menus as requested.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Menus</h1>
          <p className="text-muted-foreground">Manage website navigation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMenus} size="sm">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Menu
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Menus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : menus.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No menus found
                    </TableCell>
                  </TableRow>
                ) : (
                  menus.map((menu) => (
                    <TableRow key={menu._id}>
                      <TableCell>{menu.order}</TableCell>
                      <TableCell className="font-medium">
                        {menu.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {menu.href}
                      </TableCell>
                      <TableCell>
                        {menu.isMega ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            Mega Menu
                          </span>
                        ) : (
                          <span className="bg-info-lighter text-info-dark px-2 py-1 rounded text-xs font-medium">
                            Standard
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={menu.isActive}
                          onCheckedChange={() => handleToggleStatus(menu)}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(menu)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(menu)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!formLoading) setIsModalOpen(open);
        }}
      >
        <SheetContent
          side="right"
          className="sm:max-w-2xl overflow-y-auto"
          onInteractOutside={(e) => {
            if (formLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (formLoading) e.preventDefault();
          }}
        >
          <SheetHeader className="mb-6">
            <SheetTitle>{editingMenu ? "Edit Menu" : "Add Menu"}</SheetTitle>
            <SheetDescription>
              Configure the menu item and its children.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Menu Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="href"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder="/url or #" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-6 pt-4 md:pt-8">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Active</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isMega"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">
                          Mega Menu
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Mega Menu Editor */}
              {form.watch("isMega") ? (
                <div className="border rounded-xl p-4 space-y-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Mega Menu Columns
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        appendMegaColumn({ title: "New Column", items: [] })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Column
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {megaDataFields.map((field, index) => (
                      <MegaMenuColumnEditor
                        key={field.id}
                        control={form.control}
                        index={index}
                        remove={removeMegaColumn}
                        setValue={form.setValue}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Standard Sub Menu Editor */
                <div className="border rounded-xl p-4 space-y-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Sub Items
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        appendSubItem({ title: "", href: "#", subItems: [] })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Sub Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {subItemsFields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 border rounded-lg bg-background shadow-sm"
                      >
                        <FormField
                          control={form.control}
                          name={`subItems.${index}.title`}
                          render={({ field }) => (
                            <FormItem className="flex-1 space-y-0">
                              <FormControl>
                                <Input
                                  placeholder="Title"
                                  {...field}
                                  className="h-9"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subItems.${index}.href`}
                          render={({ field }) => (
                            <FormItem className="flex-1 space-y-0">
                              <FormControl>
                                <Input
                                  placeholder="Link"
                                  {...field}
                                  className="h-9"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          onClick={() => removeSubItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {subItemsFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                      No sub items added. Click the button above to add one.
                    </p>
                  )}
                </div>
              )}

              <div className="fixed bottom-0 right-0 left-0 md:left-auto md:w-[672px] bg-background border-t p-6 flex justify-end gap-3 z-10 shadow-2xl">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="min-w-[120px]"
                >
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingMenu ? "Update Menu" : "Create Menu"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              menu "{selectedMenu?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-error-main hover:bg-error-dark text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component to handle Mega Menu Column Editing
function MegaMenuColumnEditor({ control, index, remove, setValue }: any) {
  const {
    fields,
    append,
    remove: RemoveItem,
  } = useFieldArray({
    control,
    name: `megaData.${index}.items`,
  });

  const handleAutoGenerateHref = (itemIndex: number) => {
    const titleValue =
      control._formValues.megaData[index].items[itemIndex].title;
    if (titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue(`megaData.${index}.items.${itemIndex}.href`, slug);
    }
  };

  return (
    <div className="border border-dashed p-4 rounded-md bg-card">
      <div className="flex justify-between items-center mb-2">
        <FormField
          control={control}
          name={`megaData.${index}.title`}
          render={({ field }) => (
            <FormItem className="flex-1 mr-2">
              <FormControl>
                <Input
                  placeholder="Column Title"
                  {...field}
                  className="font-bold"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive h-8"
          onClick={() => remove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 pl-4 border-l-2">
        {fields.map((field, itemIndex) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={control}
              name={`megaData.${index}.items.${itemIndex}.title`}
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input
                      placeholder="Item Title"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const title = e.target.value;
                        const slug = title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "");
                        setValue(
                          `megaData.${index}.items.${itemIndex}.href`,
                          slug,
                        );
                      }}
                      className="h-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`megaData.${index}.items.${itemIndex}.href`}
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input placeholder="Link" {...field} className="h-8" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 shrink-0"
              title="Auto-generate link from title"
              onClick={() => handleAutoGenerateHref(itemIndex)}
            >
              <Wand2 className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive shrink-0"
              onClick={() => RemoveItem(itemIndex)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full mt-2 h-7 text-xs"
          onClick={() => append({ title: "", href: "#" })}
        >
          <Plus className="mr-1 h-3 w-3" /> Add Item
        </Button>
      </div>
    </div>
  );
}
