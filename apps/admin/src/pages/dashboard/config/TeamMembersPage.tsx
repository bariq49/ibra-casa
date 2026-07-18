import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash, Plus, RefreshCw, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  image: string;
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isActive: boolean;
};

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role is required"),
  image: z.string().min(1, "Image is required"),
  socials: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      image: "",
      socials: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      isActive: true,
    },
  });

  const fetchMembers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axiosPrivate.get("/team-members");
      setMembers(res.data.data || []);
      
      if (isRefresh) toast({ title: "Success", description: "Refreshed list" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load team members" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditMode(true);
    form.reset({
      name: member.name,
      role: member.role,
      image: member.image,
      socials: {
        facebook: member.socials?.facebook || "",
        twitter: member.socials?.twitter || "",
        instagram: member.socials?.instagram || "",
        linkedin: member.socials?.linkedin || "",
      },
      isActive: member.isActive,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      role: "",
      image: "",
      socials: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      isActive: true,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const onSubmit: SubmitHandler<TeamMemberFormData> = async (data) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedMember) {
        await axiosPrivate.put(`/team-members/${selectedMember._id}`, data);
        toast({ title: "Updated successfully" });
      } else {
        await axiosPrivate.post("/team-members", data);
        toast({ title: "Created successfully" });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchMembers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving team member" });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    try {
      await axiosPrivate.delete(`/team-members/${selectedMember._id}`);
      toast({ title: "Deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchMembers();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Our Team</h1>
          <p className="text-muted-foreground">Manage the team members displayed on the About Page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchMembers(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {canPerformCRUD && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {member.image && <img src={member.image} alt={member.name} className="w-full h-full object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canPerformCRUD && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:text-error-main" onClick={() => handleDelete(member)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditMode ? "Edit Team Member" : "Add Team Member"}</SheetTitle>
            <SheetDescription>
              {isEditMode ? "Update the member details" : "Add a new member to the website"}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ""}
                      disabled={formLoading}
                      onChange={(url) => field.onChange(url)}
                    />
                  </FormControl>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Role/Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-4">Social Links</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="socials.facebook" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-xs"><Facebook className="w-3 h-3" /> Facebook</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..."/></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="socials.twitter" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-xs"><Twitter className="w-3 h-3" /> Twitter/X</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..."/></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="socials.instagram" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-xs"><Instagram className="w-3 h-3" /> Instagram</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..."/></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="socials.linkedin" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-xs"><Linkedin className="w-3 h-3" /> LinkedIn</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..."/></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between border p-4 rounded-lg mt-4">
                  <FormLabel>Show on Website</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setIsSidebarOpen(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? "Saving..." : "Save Member"}</Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this team member?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone and will remove them from the website.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-error-main hover:bg-error-dark" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
