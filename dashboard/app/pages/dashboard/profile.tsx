import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Pencil, CheckCircle, AlertCircle, Upload, X, Eye, ImageIcon, ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
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

function getNidStatus(front: string | null | undefined, back: string | null | undefined) {
  if (front && back) return { label: "Uploaded", Icon: ShieldCheck, color: "text-green-700 bg-green-50 border-green-200" };
  if (front || back) return { label: "Partial", Icon: ShieldAlert, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { label: "Not Uploaded", Icon: ShieldOff, color: "text-gray-500 bg-gray-50 border-gray-200" };
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
  const [nidLightbox, setNidLightbox] = useState<{ src: string; label: string } | null>(null);
  const [nidFrontDragging, setNidFrontDragging] = useState(false);
  const [nidBackDragging, setNidBackDragging] = useState(false);

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

  const handleNidDrop = (side: "front" | "back", e: React.DragEvent) => {
    e.preventDefault();
    if (side === "front") setNidFrontDragging(false);
    else setNidBackDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleNidFileSelect(side, file);
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
      {(() => {
        const nidStatus = getNidStatus(
          nidFrontPreview || currentUser?.nid_front_picture,
          nidBackPreview || currentUser?.nid_back_picture,
        );
        const { Icon: StatusIcon } = nidStatus;
        return (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">NID Verification</CardTitle>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${nidStatus.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {nidStatus.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Upload clear photos of both sides of your National ID card.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ─ Front Side ─ */}
                {(["front", "back"] as const).map((side) => {
                  const preview = side === "front" ? nidFrontPreview : nidBackPreview;
                  const uploaded = side === "front" ? currentUser?.nid_front_picture : currentUser?.nid_back_picture;
                  const file = side === "front" ? nidFrontFile : nidBackFile;
                  const error = side === "front" ? nidFrontError : nidBackError;
                  const ref = side === "front" ? nidFrontRef : nidBackRef;
                  const dragging = side === "front" ? nidFrontDragging : nidBackDragging;
                  const setDragging = side === "front" ? setNidFrontDragging : setNidBackDragging;
                  const clearPreview = side === "front"
                    ? () => { setNidFrontFile(null); setNidFrontPreview(null); setNidFrontError(null); }
                    : () => { setNidBackFile(null); setNidBackPreview(null); setNidBackError(null); };
                  const label = side === "front" ? "Front Side" : "Back Side";
                  const imgSrc = preview || uploaded || null;

                  return (
                    <div key={side} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">{label}</Label>

                      {imgSrc ? (
                        /* Thumbnail card */
                        <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                          <img
                            src={imgSrc}
                            alt={label}
                            className="w-full h-44 object-cover"
                          />
                          {/* Preview badge */}
                          {preview && !uploaded && (
                            <span className="absolute top-2 left-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">
                              Preview
                            </span>
                          )}
                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              type="button"
                              title="View full image"
                              className="bg-white/90 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-gray-200 transition-colors"
                              onClick={() => setNidLightbox({ src: imgSrc, label })}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {preview && (
                              <button
                                type="button"
                                title="Remove"
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
                                onClick={clearPreview}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {/* Replace button at bottom */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex justify-end">
                            <button
                              type="button"
                              disabled={nidSaving}
                              className="text-xs text-white bg-white/20 hover:bg-white/30 border border-white/40 rounded-lg px-3 py-1.5 flex items-center gap-1 backdrop-blur-sm transition-colors"
                              onClick={() => { ref.current?.click(); }}
                            >
                              <Upload className="w-3 h-3" />
                              Replace
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Drag-and-drop zone */
                        <div
                          className={`relative h-44 rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 ${
                            dragging
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                          }`}
                          onClick={() => ref.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={(e) => handleNidDrop(side, e)}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragging ? "bg-blue-100" : "bg-gray-200"}`}>
                            <ImageIcon className={`w-6 h-6 ${dragging ? "text-blue-500" : "text-gray-400"}`} />
                          </div>
                          <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-600">
                              {dragging ? "Drop to upload" : "Click or drag to upload"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · Max 5MB</p>
                          </div>
                        </div>
                      )}

                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        ref={ref}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleNidFileSelect(side, e.target.files[0]);
                          e.target.value = "";
                        }}
                      />

                      {file && !preview && (
                        <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                      )}
                      {error && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {(nidFrontFile || nidBackFile) && (
                <Button
                  onClick={handleNidImagesSubmit}
                  disabled={nidSaving || !!nidFrontError || !!nidBackError}
                  className="w-full sm:w-auto"
                >
                  {nidSaving ? "Uploading..." : "Save NID Images"}
                </Button>
              )}

              {nidMessage && (
                <p className={`text-sm flex items-center gap-1.5 ${nidMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {nidMessage.type === "success"
                    ? <CheckCircle className="w-4 h-4" />
                    : <AlertCircle className="w-4 h-4" />}
                  {nidMessage.text}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* ── Lightbox ── */}
      {nidLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setNidLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">{nidLightbox.label}</p>
              <button
                type="button"
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                onClick={() => setNidLightbox(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={nidLightbox.src}
              alt={nidLightbox.label}
              className="w-full rounded-xl max-h-[80vh] object-contain bg-white/5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
