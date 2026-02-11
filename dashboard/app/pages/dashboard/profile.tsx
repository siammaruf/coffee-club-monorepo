import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Pencil } from "lucide-react";
import { userService } from "~/services/httpServices/userService";

// Selector to get current user from authReducer
const selectCurrentUser = (state: any) => state.auth?.user;

type ProfileForm = {
  firstName: string;
  lastName: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function Profile() {
  const currentUser = useSelector(selectCurrentUser);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picUploading, setPicUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form for profile
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  // React Hook Form for password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.first_name || "",
        lastName: currentUser.last_name || "",
      });
      setProfilePic(currentUser.picture || null);
    }
    // eslint-disable-next-line
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await userService.updateUser(currentUser?.id, {
        first_name: data.firstName,
        last_name: data.lastName,
      });
      setEditMode(false);
      // Optionally, refresh Redux state here
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(currentUser?.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      alert("Password updated successfully.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPicUploading(true);
    try {
      const formData = new FormData();
      formData.append("picture", file);
      await userService.updateProfilePicture(currentUser?.id, formData);
      // Optionally, update profilePic state here if backend returns new URL
    } finally {
      setPicUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <Card className="border border-gray-200 flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              Profile Information
              {!editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => setEditMode(true)}
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 mb-4">
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow"
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleProfilePicChange}
                  disabled={!editMode}
                />
                <Button
                  type="button"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={picUploading || !editMode}
                  variant={editMode ? "default" : "outline"}
                >
                  {picUploading ? "Uploading..." : "Change Picture"}
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="mb-1 block">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "First name is required" })}
                    disabled={!editMode}
                  />
                  {errors.firstName && (
                    <span className="text-xs text-red-500">{errors.firstName.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="mb-1 block">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Last name is required" })}
                    disabled={!editMode}
                  />
                  {errors.lastName && (
                    <span className="text-xs text-red-500">{errors.lastName.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">Email</Label>
                  <Input value={currentUser?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">Phone Number</Label>
                  <Input value={currentUser?.phone || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">Role</Label>
                  <Input value={currentUser?.role || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">Status</Label>
                  <Input value={currentUser?.status || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">NID Number</Label>
                  <Input value={currentUser?.nid_number || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">Date Joined</Label>
                  <Input value={currentUser?.date_joined ? new Date(currentUser.date_joined).toLocaleString() : ""} disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="mb-1 block">Address</Label>
                  <Input value={currentUser?.address || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">NID Front Picture</Label>
                  {currentUser?.nid_front_picture ? (
                    <a href={currentUser.nid_front_picture} target="_blank" rel="noopener noreferrer">
                      <img src={currentUser.nid_front_picture} alt="NID Front" className="h-16 border rounded shadow" />
                    </a>
                  ) : (
                    <Input value="" disabled />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="mb-1 block">NID Back Picture</Label>
                  {currentUser?.nid_back_picture ? (
                    <a href={currentUser.nid_back_picture} target="_blank" rel="noopener noreferrer">
                      <img src={currentUser.nid_back_picture} alt="NID Back" className="h-16 border rounded shadow" />
                    </a>
                  ) : (
                    <Input value="" disabled />
                  )}
                </div>
              </div>
              {editMode && (
                <div className="flex gap-2 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      reset({
                        firstName: currentUser.first_name || "",
                        lastName: currentUser.last_name || "",
                      });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        {/* Password Card */}
        <Card className="border border-gray-200 w-full md:max-w-xs self-start">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="mb-1 block">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword("currentPassword", { required: "Current password is required" })}
                  disabled={saving}
                />
                {passwordErrors.currentPassword && (
                  <span className="text-xs text-red-500">{passwordErrors.currentPassword.message}</span>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="newPassword" className="mb-1 block">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword", { required: "New password is required" })}
                  disabled={saving}
                />
                {passwordErrors.newPassword && (
                  <span className="text-xs text-red-500">{passwordErrors.newPassword.message}</span>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="confirmPassword" className="mb-1 block">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword("confirmPassword", { required: "Please confirm new password" })}
                  disabled={saving}
                />
                {passwordErrors.confirmPassword && (
                  <span className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</span>
                )}
              </div>
              <Button className="mt-6 w-full" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}