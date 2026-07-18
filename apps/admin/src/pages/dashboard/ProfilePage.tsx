import { useRef, useState } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Shield,
  Save,
  Loader2,
  Camera,
  Lock,
  KeyRound,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (name || user?.name || "A").charAt(0).toUpperCase();
  const roleLabel = user?.role || "admin";

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please choose an image file.",
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Avatar must be under 4MB.",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setAvatar(base64);
    } catch {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not read that image. Try another file.",
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setSavingProfile(true);
    try {
      const { data } = await axiosPrivate.put(`/users/${user._id}`, {
        name: name.trim(),
        avatar: avatar.trim() || undefined,
      });

      setUser({
        name: data.name ?? name.trim(),
        avatar: data.avatar ?? avatar,
        email: data.email ?? user.email,
      });

      if (data.avatar) setAvatar(data.avatar);

      toast({
        title: "Profile updated",
        description: "Your profile details were saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error?.response?.data?.message ||
          "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation must be the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setSavingPassword(true);
    try {
      await axiosPrivate.put(`/users/${user._id}/password`, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password changed",
        description: "Your password was updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description:
          error?.response?.data?.message ||
          "Could not change password. Check your current password.",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="relative w-full animate-in fade-in duration-300 pb-4">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-lighter/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-darker">
          <Sparkles className="h-3.5 w-3.5" />
          Account
        </div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-grey-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-main text-white shadow-sm">
            <User className="h-5 w-5" />
          </span>
          Profile
        </h1>
        <p className="max-w-xl text-sm text-grey-500">
          Manage your personal details, avatar, and password.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Identity card */}
        <Card className="h-fit overflow-hidden border-border/80 shadow-sm lg:col-span-4">
          <div className="h-24 bg-gradient-to-br from-primary-main via-primary-dark to-primary-darker" />
          <CardContent className="relative flex flex-col items-center px-5 pb-6 pt-0">
            <div className="-mt-12 mb-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-lighter shadow-md">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary-darker">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-primary-main shadow-sm transition-colors hover:bg-primary-lighter disabled:opacity-60"
                  title="Change avatar"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarPick}
                />
              </div>
            </div>

            <h2 className="truncate text-center text-lg font-bold text-grey-900">
              {name || user?.name || "Your name"}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-grey-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user?.email}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-lighter px-3 py-1 text-xs font-bold capitalize text-primary-darker">
                <Shield className="h-3.5 w-3.5" />
                {roleLabel}
              </span>
              {user?.employee_role ? (
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium capitalize text-grey-600">
                  {user.employee_role.replace("_", " ")}
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-grey-400">
              Click the camera icon to change your photo, then save your profile.
            </p>
          </CardContent>
        </Card>

        {/* Forms */}
        <div className="flex flex-col gap-5 lg:col-span-8">
          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary-lighter/50 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <User className="h-5 w-5 text-primary-main" />
                Account details
              </CardTitle>
              <p className="mt-1 text-xs text-grey-500">
                Update how your name appears across the admin panel.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-grey-700"
                    >
                      Full name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold text-grey-700"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="h-10 rounded-xl bg-muted/40 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="h-10 rounded-xl bg-primary-main px-5 font-semibold shadow-sm hover:bg-primary-dark"
                  >
                    {savingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-warning-lighter/40 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <KeyRound className="h-5 w-5 text-warning-dark" />
                Change password
              </CardTitle>
              <p className="mt-1 text-xs text-grey-500">
                Use at least 8 characters for a stronger password.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <form
                onSubmit={handleChangePassword}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-xs font-semibold text-grey-700"
                  >
                    Current password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="h-10 rounded-xl pl-9"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-xs font-semibold text-grey-700"
                    >
                      New password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-10 rounded-xl"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold text-grey-700"
                    >
                      Confirm new password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className={cn(
                        "h-10 rounded-xl",
                        confirmPassword &&
                          newPassword !== confirmPassword &&
                          "border-error-main focus-visible:ring-error-main",
                      )}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="h-10 rounded-xl bg-primary-main px-5 font-semibold shadow-sm hover:bg-primary-dark"
                  >
                    {savingPassword ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
