import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Pencil, CheckCircle, AlertCircle, Upload, X } from "lucide-react";
import { userService } from "~/services/httpServices/userService";
import { checkAuthStatus } from "~/services/httpServices/authService";
import type { AppDispatch } from "~/redux/store/store";

const selectCurrentUser = (state: any) => state.auth?.user;

type ProfileForm = { firstName: string; lastName: string };
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };
type KycForm = { nidNumber: string; address: string };
type PhoneVerifyState = "idle" | "otp-sent" | "verified";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG and PNG files are allowed";
  if (file.size > MAX_FILE_SIZE) return "File size must be less than 5MB";
  return null;
}

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);

  // Profile info
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picUploading, setPicUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone verification
  const [phoneVerifyState, setPhoneVerifyState] = useState<PhoneVerifyState>("idle");
  const [phoneEditMode, setPhoneEditMode] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // KYC
  const [kycEditMode, setKycEditMode] = useState(false);
  const [kycSaving, setKycSaving] = useState(false);
  const [kycMessage, setKycMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // NID Images
  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);
  const [nidFrontError, setNidFrontError] = useState<string | null>(null);
  const [nidBackError, setNidBackError] = useState<string | null>(null);
  const [nidSaving, setNidSaving] = useState(false);
  const [nidMessage, setNidMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const nidFrontRef = useRef<HTMLInputElement>(null);
  const nidBackRef = useRef<HTMLInputElement>(null);

  // Profile form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { firstName: "", lastName: "" },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // KYC form
  const {
    register: registerKyc,
    handleSubmit: handleKycSubmit,
    reset: resetKyc,
    formState: { errors: kycErrors },
  } = useForm<KycForm>({
    defaultValues: { nidNumber: "", address: "" },
  });

  useEffect(() => {
    if (currentUser) {
      reset({ firstName: currentUser.first_name || "", lastName: currentUser.last_name || "" });
      resetKyc({ nidNumber: currentUser.nid_number || "", address: currentUser.address || "" });
      setProfilePic(currentUser.picture || null);
      setNewPhone(currentUser.phone || "");
    }
    // eslint-disable-next-line
  }, [currentUser]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // Profile info submit
  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await userService.updateUser(currentUser?.id, {
        first_name: data.firstName,
        last_name: data.lastName,
      });
      await dispatch(checkAuthStatus());
      setEditMode(false);
    } catch (err: any) {
      alert(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Password submit
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
    } catch (err: any) {
      alert(err?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Profile picture
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPicUploading(true);
    try {
      const formData = new FormData();
      formData.append("picture", file);
      const res: any = await userService.updateProfilePicture(currentUser?.id, formData);
      if (res?.data?.picture) setProfilePic(res.data.picture);
      await dispatch(checkAuthStatus());
    } finally {
      setPicUploading(false);
    }
  };

  // Phone — send OTP
  const handleSendPhoneOtp = async () => {
    if (!newPhone.trim()) {
      setPhoneMessage({ text: "Please enter a phone number", type: "error" });
      return;
    }
    setPhoneLoading(true);
    setPhoneMessage(null);
    try {
      await userService.sendPhoneOtp(newPhone.trim());
      setPhoneVerifyState("otp-sent");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(30);
      setPhoneMessage({ text: "OTP sent to your phone number", type: "success" });
    } catch (err: any) {
      setPhoneMessage({ text: err?.message || "Failed to send OTP", type: "error" });
    } finally {
      setPhoneLoading(false);
    }
  };

  // OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const updated = ["", "", "", "", "", ""];
    digits.forEach((d, i) => { updated[i] = d; });
    setOtpDigits(updated);
    const nextEmpty = digits.length < 6 ? digits.length : 5;
    otpRefs.current[nextEmpty]?.focus();
  };

  // Phone — verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setPhoneMessage({ text: "Please enter all 6 digits", type: "error" });
      return;
    }
    setPhoneLoading(true);
    setPhoneMessage(null);
    try {
      await userService.verifyPhoneOtp(newPhone.trim(), otp);
      setPhoneVerifyState("verified");
      setPhoneEditMode(false);
      setPhoneMessage({ text: "Phone number verified successfully!", type: "success" });
      await dispatch(checkAuthStatus());
    } catch (err: any) {
      setPhoneMessage({ text: err?.message || "Invalid or expired OTP", type: "error" });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleCancelPhone = () => {
    setPhoneEditMode(false);
    setPhoneVerifyState("idle");
    setNewPhone(currentUser?.phone || "");
    setOtpDigits(["", "", "", "", "", ""]);
    setPhoneMessage(null);
  };

  // KYC submit
  const onKycSubmit = async (data: KycForm) => {
    setKycSaving(true);
    setKycMessage(null);
    try {
      await userService.updateKyc({ nid_number: data.nidNumber, address: data.address });
      await dispatch(checkAuthStatus());
      setKycEditMode(false);
      setKycMessage({ text: "KYC information updated successfully", type: "success" });
    } catch (err: any) {
      setKycMessage({ text: err?.message || "Failed to update KYC information", type: "error" });
    } finally {
      setKycSaving(false);
    }
  };

  // NID image selection
  const handleNidFileSelect = (side: "front" | "back", file: File) => {
    const error = validateImageFile(file);
    if (side === "front") {
      setNidFrontError(error);
      if (!error) {
        setNidFrontFile(file);
        setNidFrontPreview(URL.createObjectURL(file));
      }
    } else {
      setNidBackError(error);
      if (!error) {
        setNidBackFile(file);
        setNidBackPreview(URL.createObjectURL(file));
      }
    }
  };

  // NID images submit
  const handleNidImagesSubmit = async () => {
    if (!nidFrontFile && !nidBackFile) {
      setNidMessage({ text: "Please select at least one image", type: "error" });
      return;
    }
    setNidSaving(true);
    setNidMessage(null);
    try {
      const formData = new FormData();
      if (nidFrontFile) formData.append("nid_front_picture", nidFrontFile);
      if (nidBackFile) formData.append("nid_back_picture", nidBackFile);
      await userService.updateNidImages(formData);
      await dispatch(checkAuthStatus());
      setNidFrontFile(null);
      setNidBackFile(null);
      setNidFrontPreview(null);
      setNidBackPreview(null);
      setNidMessage({ text: "NID images updated successfully", type: "success" });
    } catch (err: any) {
      setNidMessage({ text: err?.message || "Failed to upload NID images", type: "error" });
    } finally {
      setNidSaving(false);
    }
  };

  const isPhoneVerified = currentUser?.phone_verified === true;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8">

      {/* ── Row 1: Profile Info + Change Password ── */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Profile Info */}
        <Card className="border border-gray-200 flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              Profile Information
              {!editMode && (
                <Button variant="ghost" size="icon" className="ml-2" onClick={() => setEditMode(true)} aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-5">
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow"
              />
              <div>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleProfilePicChange} />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={picUploading || !editMode}
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                >
                  {picUploading ? "Uploading..." : "Change Picture"}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register("firstName", { required: "First name is required" })} disabled={!editMode} />
                  {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register("lastName", { required: "Last name is required" })} disabled={!editMode} />
                  {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={currentUser?.email || ""} disabled />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Input value={currentUser?.role || ""} disabled />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Input value={currentUser?.status || ""} disabled />
                </div>
                <div className="space-y-1">
                  <Label>Date Joined</Label>
                  <Input value={currentUser?.date_joined ? new Date(currentUser.date_joined).toLocaleDateString() : ""} disabled />
                </div>
              </div>

              {editMode && (
                <div className="flex gap-2 mt-5">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                  <Button variant="outline" type="button" onClick={() => { setEditMode(false); reset({ firstName: currentUser.first_name || "", lastName: currentUser.last_name || "" }); }} disabled={saving}>Cancel</Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border border-gray-200 w-full md:max-w-xs self-start">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...registerPassword("currentPassword", { required: "Current password is required" })} disabled={saving} />
                {passwordErrors.currentPassword && <span className="text-xs text-red-500">{passwordErrors.currentPassword.message}</span>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword("newPassword", { required: "New password is required" })} disabled={saving} />
                {passwordErrors.newPassword && <span className="text-xs text-red-500">{passwordErrors.newPassword.message}</span>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword", { required: "Please confirm new password" })} disabled={saving} />
                {passwordErrors.confirmPassword && <span className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</span>}
              </div>
              <Button className="w-full" type="submit" disabled={saving}>{saving ? "Updating..." : "Update Password"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Phone Verification ── */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            Phone Number
            {isPhoneVerified
              ? <span className="flex items-center gap-1 text-sm font-normal text-green-600"><CheckCircle className="w-4 h-4" /> Verified</span>
              : <span className="flex items-center gap-1 text-sm font-normal text-amber-500"><AlertCircle className="w-4 h-4" /> Not Verified</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!phoneEditMode ? (
            <div className="flex items-center gap-3">
              <Input value={currentUser?.phone || ""} disabled className="max-w-xs" />
              <Button variant="outline" size="sm" onClick={() => { setPhoneEditMode(true); setNewPhone(currentUser?.phone || ""); setPhoneVerifyState("idle"); setPhoneMessage(null); }}>
                Change & Verify
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm">
              {phoneVerifyState === "idle" && (
                <div className="space-y-2">
                  <Label>New Phone Number</Label>
                  <div className="flex gap-2">
                    <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+8801XXXXXXXXX" disabled={phoneLoading} />
                    <Button onClick={handleSendPhoneOtp} disabled={phoneLoading} size="sm">
                      {phoneLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </div>
              )}

              {phoneVerifyState === "otp-sent" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to <strong>{newPhone}</strong></p>
                  <div className="flex gap-2" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <Input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="text-center text-lg font-semibold h-11 w-11 p-0"
                        maxLength={1}
                        disabled={phoneLoading}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleVerifyOtp} disabled={phoneLoading || otpDigits.join("").length < 6} size="sm">
                      {phoneLoading ? "Verifying..." : "Verify"}
                    </Button>
                    <Button variant="outline" size="sm" disabled={resendTimer > 0 || phoneLoading} onClick={() => { setPhoneVerifyState("idle"); setPhoneMessage(null); }}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Change number"}
                    </Button>
                    {resendTimer === 0 && (
                      <Button variant="ghost" size="sm" disabled={phoneLoading} onClick={handleSendPhoneOtp}>Resend OTP</Button>
                    )}
                  </div>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={handleCancelPhone} disabled={phoneLoading}>Cancel</Button>
            </div>
          )}

          {phoneMessage && (
            <p className={`text-sm ${phoneMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {phoneMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Row 3: KYC Information ── */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            KYC Information
            {!kycEditMode && (
              <Button variant="ghost" size="icon" className="ml-2" onClick={() => setKycEditMode(true)} aria-label="Edit KYC">
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleKycSubmit(onKycSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nidNumber">NID Number</Label>
                <Input
                  id="nidNumber"
                  {...registerKyc("nidNumber")}
                  disabled={!kycEditMode}
                  placeholder="Enter your NID number"
                />
                {kycErrors.nidNumber && <span className="text-xs text-red-500">{kycErrors.nidNumber.message}</span>}
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...registerKyc("address")}
                  disabled={!kycEditMode}
                  placeholder="Enter your address"
                />
                {kycErrors.address && <span className="text-xs text-red-500">{kycErrors.address.message}</span>}
              </div>
            </div>

            {kycEditMode && (
              <div className="flex gap-2 mt-5">
                <Button type="submit" disabled={kycSaving}>{kycSaving ? "Saving..." : "Save KYC"}</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setKycEditMode(false);
                    resetKyc({ nidNumber: currentUser?.nid_number || "", address: currentUser?.address || "" });
                    setKycMessage(null);
                  }}
                  disabled={kycSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>

          {kycMessage && (
            <p className={`text-sm mt-3 ${kycMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {kycMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Row 4: NID Documents ── */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">NID Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NID Front */}
            <div className="space-y-2">
              <Label>NID Front</Label>
              {(nidFrontPreview || currentUser?.nid_front_picture) ? (
                <div className="relative inline-block">
                  <a href={nidFrontPreview || currentUser.nid_front_picture} target="_blank" rel="noopener noreferrer">
                    <img
                      src={nidFrontPreview || currentUser.nid_front_picture}
                      alt="NID Front"
                      className="h-28 border rounded shadow object-contain"
                    />
                  </a>
                  {nidFrontPreview && (
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      onClick={() => { setNidFrontFile(null); setNidFrontPreview(null); setNidFrontError(null); }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-28 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-400">
                  No image uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                ref={nidFrontRef}
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleNidFileSelect("front", e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => nidFrontRef.current?.click()}
                disabled={nidSaving}
              >
                <Upload className="w-4 h-4 mr-1" />
                {nidFrontPreview ? "Change Front" : "Upload Front"}
              </Button>
              {nidFrontFile && <p className="text-xs text-muted-foreground">{nidFrontFile.name}</p>}
              {nidFrontError && <p className="text-xs text-red-500">{nidFrontError}</p>}
            </div>

            {/* NID Back */}
            <div className="space-y-2">
              <Label>NID Back</Label>
              {(nidBackPreview || currentUser?.nid_back_picture) ? (
                <div className="relative inline-block">
                  <a href={nidBackPreview || currentUser.nid_back_picture} target="_blank" rel="noopener noreferrer">
                    <img
                      src={nidBackPreview || currentUser.nid_back_picture}
                      alt="NID Back"
                      className="h-28 border rounded shadow object-contain"
                    />
                  </a>
                  {nidBackPreview && (
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      onClick={() => { setNidBackFile(null); setNidBackPreview(null); setNidBackError(null); }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-28 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-400">
                  No image uploaded
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                ref={nidBackRef}
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleNidFileSelect("back", e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => nidBackRef.current?.click()}
                disabled={nidSaving}
              >
                <Upload className="w-4 h-4 mr-1" />
                {nidBackPreview ? "Change Back" : "Upload Back"}
              </Button>
              {nidBackFile && <p className="text-xs text-muted-foreground">{nidBackFile.name}</p>}
              {nidBackError && <p className="text-xs text-red-500">{nidBackError}</p>}
            </div>
          </div>

          {(nidFrontFile || nidBackFile) && (
            <Button onClick={handleNidImagesSubmit} disabled={nidSaving || !!nidFrontError || !!nidBackError}>
              {nidSaving ? "Uploading..." : "Save NID Images"}
            </Button>
          )}

          {nidMessage && (
            <p className={`text-sm ${nidMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {nidMessage.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
