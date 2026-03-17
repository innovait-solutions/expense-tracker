"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Loader2, CheckCircle2, AlertCircle, Key, Lock } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function UserProfilePage() {
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUserData({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.patch("/api/auth/profile", userData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update profile" });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setChangingPassword(true);
    setPassMessage({ type: "", text: "" });
    try {
      await axios.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPassMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPassMessage({ type: "error", text: err.response?.data?.error || "Failed to change password" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-center lg:text-left">Account Settings</h2>
        <p className="text-sm text-muted-foreground text-center lg:text-left">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mr-auto">Personal Information</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Update your account's primary identification details. Changes here will be reflected across the organization's collaboration logs.
            </p>
        </div>
        
        <div className="lg:col-span-3">
            <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
                {message.text && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-center text-xs font-bold",
                        message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {message.type === "success" ? <CheckCircle2 className="h-4 w-4 mr-3" /> : <AlertCircle className="h-4 w-4 mr-3" />}
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid gap-4">
                        <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Full Name</label>
                        <input
                            required
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            className="w-full px-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                        />
                        </div>
                        <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                        <input
                            required
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            className="w-full px-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                        />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex items-center justify-center px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-4 pt-4 border-t lg:border-t-0">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Security & Password</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Maintain your account's security by choosing a strong password. We recommend a password of at least 12 characters.
            </p>
        </div>

        <div className="lg:col-span-3">
            <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
                {passMessage.text && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-center text-xs font-bold",
                        passMessage.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {passMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 mr-3" /> : <AlertCircle className="h-4 w-4 mr-3" />}
                        {passMessage.text}
                    </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Current Password</label>
                            <input
                                required
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Confirm New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="flex items-center justify-center px-6 py-2 text-sm font-bold bg-muted text-foreground border border-border rounded-xl hover:bg-primary hover:text-primary-foreground hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-3.5 w-3.5 mr-2" />}
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
