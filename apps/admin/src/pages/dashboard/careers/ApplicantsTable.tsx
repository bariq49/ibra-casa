import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ExternalLink, RefreshCw, Trash } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";

export type ApplicationStatus = "Pending" | "Reviewed" | "Shortlisted" | "Rejected";

export interface JobApplication {
  _id: string;
  careerId: {
    _id: string;
    title: string;
    department: string;
    location: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  portfolioUrl?: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
}

const statusColors: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Reviewed: "default",
  Shortlisted: "outline",
  Rejected: "destructive",
};

export default function ApplicantsTable() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axiosPrivate.get("/applications");
      setApplications(res.data.data || []);
      
      if (isRefresh) toast({ title: "Success", description: "Refreshed list" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load applications" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleView = (app: JobApplication) => {
    setSelectedApp(app);
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this application?")) return;
      
      try {
        await axiosPrivate.delete(`/applications/${id}`);
        toast({ title: "Application deleted successfully" });
        fetchApplications();
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to delete" });
      }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await axiosPrivate.put(`/applications/${selectedApp._id}/status`, { status: newStatus });
      toast({ title: "Status updated directly" });
      setSelectedApp({ ...selectedApp, status: newStatus });
      fetchApplications();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update status" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2">
        <h2 className="text-xl font-bold">Recent Applications</h2>
        <Button variant="outline" size="sm" onClick={() => fetchApplications(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No applications received yet
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app._id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(app)}>
                  <TableCell>
                    <div className="font-medium">{app.firstName} {app.lastName}</div>
                    <div className="text-xs text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{app.careerId?.title || "Unknown Role"}</div>
                    <div className="text-xs text-muted-foreground">{app.careerId?.department || "Unknown Dept"}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(app.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[app.status] || "secondary"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(app)}>
                            <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(app._id, e)} className="hover:text-error-main">
                            <Trash className="size-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader className="mb-6 pb-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl">{selectedApp.firstName} {selectedApp.lastName}</SheetTitle>
                    <SheetDescription className="text-base mt-1">
                      Applied for <span className="font-semibold text-foreground">{selectedApp.careerId?.title}</span> ({selectedApp.careerId?.department})
                    </SheetDescription>
                  </div>
                  <Badge variant={statusColors[selectedApp.status]} className="text-sm px-3 py-1">
                    {selectedApp.status}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Contact Email</p>
                    <p className="font-medium text-sm"><a href={`mailto:${selectedApp.email}`} className="hover:underline">{selectedApp.email}</a></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Phone Number</p>
                    <p className="font-medium text-sm">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Resume URL</p>
                    <a href={selectedApp.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center text-primary text-sm hover:underline font-medium">
                      View Document <ExternalLink className="ml-1.5 size-3" />
                    </a>
                  </div>
                  {selectedApp.portfolioUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Portfolio / Website</p>
                      <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center text-primary text-sm hover:underline font-medium">
                        View Portfolio <ExternalLink className="ml-1.5 size-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Cover Letter</h3>
                  <div className="bg-white border rounded-xl p-5 text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap shadow-sm">
                    {selectedApp.coverLetter}
                  </div>
                </div>

                <div className="border-t pt-6 pb-4">
                  <h3 className="font-semibold text-lg mb-3">Update Application Status</h3>
                  <div className="flex flex-wrap gap-3">
                    {(["Pending", "Reviewed", "Shortlisted", "Rejected"] as ApplicationStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedApp.status === status ? "default" : "outline"}
                        className={selectedApp.status === status ? "" : "opacity-70 hover:opacity-100"}
                        onClick={() => handleStatusChange(status)}
                        disabled={updating || selectedApp.status === status}
                      >
                        Mark as {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
