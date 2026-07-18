import { useMemo, useState } from "react";
import { Plus, Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePreviewGuard } from "@/hooks/usePreviewGuard";
import {
  previewStaff,
  type PreviewStaffMember,
} from "@/lib/preview/vendorPreviewData";

type RoleFilter = "all" | PreviewStaffMember["role"];

const ROLE_LABEL: Record<PreviewStaffMember["role"], string> = {
  manager: "Manager",
  packer: "Packer",
  support: "Support",
  accountant: "Accountant",
};

const STATUS_PILLS: Record<
  PreviewStaffMember["status"],
  { bg: string; text: string; label: string }
> = {
  active: { bg: "bg-success-lighter", text: "text-success-dark", label: "Active" },
  invited: {
    bg: "bg-warning-lighter",
    text: "text-warning-dark",
    label: "Invited",
  },
  disabled: { bg: "bg-grey-200", text: "text-grey-700", label: "Disabled" },
};

export default function VendorStaff() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const { toast } = useToast();
  const { blockIfPreview } = usePreviewGuard();

  const staff = previewStaff;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    });
  }, [staff, search, roleFilter]);

  const counts = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s) => s.status === "active").length,
      invited: staff.filter((s) => s.status === "invited").length,
      disabled: staff.filter((s) => s.status === "disabled").length,
    };
  }, [staff]);

  function handleInvite() {
    if (blockIfPreview("invite staff")) return;
    toast({ title: "Invite staff", description: "Coming soon." });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-900">Staff Users</h1>
          <p className="text-sm text-grey-500 mt-1">
            People with access to your storefront. Manage roles, invites, and
            access.
          </p>
        </div>
        <Button
          onClick={handleInvite}
          className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
        >
          <Plus size={16} className="mr-1" /> Invite Staff
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryTile label="Total Staff" value={counts.total} bg="bg-[#E0E7FF]" />
        <SummaryTile label="Active" value={counts.active} bg="bg-[#CAF8E4]" />
        <SummaryTile label="Invited" value={counts.invited} bg="bg-[#FEF3C7]" />
        <SummaryTile
          label="Disabled"
          value={counts.disabled}
          bg="bg-[#F1F5F9]"
        />
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative max-w-md flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search staff…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full bg-muted/40"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "manager", "packer", "support", "accountant"] as RoleFilter[]).map(
              (r) => {
                const isActive = r === roleFilter;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 h-8 rounded-full text-xs font-semibold border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-grey-700 border-border hover:bg-muted"
                    }`}
                  >
                    {r === "all" ? "All" : ROLE_LABEL[r]}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12 text-right">·</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-grey-500"
                  >
                    No staff matches your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const initials = s.name
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const pill = STATUS_PILLS[s.status];
                  return (
                    <TableRow key={s._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${s.avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-grey-900">
                              {s.name}
                            </div>
                            <div className="text-xs text-grey-500">
                              #{s._id.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-grey-700 flex items-center gap-1.5">
                          <Mail size={13} className="text-grey-400" />
                          {s.email}
                        </div>
                        <div className="text-xs text-grey-500 flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-grey-400" />
                          {s.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {ROLE_LABEL[s.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${pill.bg} ${pill.text}`}
                        >
                          {pill.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-grey-600">
                        {new Date(s.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => blockIfPreview("manage staff")}
                          className="p-2 rounded-full hover:bg-muted text-grey-500 hover:text-grey-900"
                          aria-label="Actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  bg,
}: {
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <div className="text-sm font-medium text-grey-700">{label}</div>
      <div className="text-2xl font-bold text-grey-900 mt-1">{value}</div>
    </div>
  );
}
