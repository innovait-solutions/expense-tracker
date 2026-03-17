"use client";

import { useState, useEffect } from "react";
import { Settings, User, Bell, Palette, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { useTheme } from "@/providers/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [orgData, setOrgData] = useState({ name: "", currency: "USD" });
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [updatingOrg, setUpdatingOrg] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async () => {
    try {
      const [orgRes, catRes] = await Promise.all([
        axios.get("/api/organization"),
        axios.get("/api/categories"),
      ]);
      setOrgData({ name: orgRes.data.name, currency: orgRes.data.currency });
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingOrg(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.patch("/api/organization", orgData);
      setMessage({ type: "success", text: "Organization profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update profile" });
    } finally {
      setUpdatingOrg(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setAddingCategory(true);
    try {
      await axios.post("/api/categories", { name: newCategory });
      setNewCategory("");
      fetchData();
    } catch (err) {
      console.error("Failed to add category:", err);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await axios.delete(`/api/categories?id=${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    setChangingPassword(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to change password" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your organization preferences and account settings.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md flex items-center ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 mr-3" /> : <AlertCircle className="h-5 w-5 mr-3" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-card border rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Organization Profile</h3>
                <form onSubmit={handleUpdateOrg} className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium mb-1">Organization Name</label>
                    <input
                        value={orgData.name}
                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium mb-1">Base Currency</label>
                    <select 
                        value={orgData.currency}
                        onChange={(e) => setOrgData({ ...orgData, currency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background outline-none"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                    </select>
                    </div>
                    <button 
                    type="submit" 
                    disabled={updatingOrg}
                    className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                    {updatingOrg ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Update Profile
                    </button>
                </form>
            </div>

            <div className="p-6 bg-card border rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Category Management</h3>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                    <input
                        placeholder="New category name..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button 
                        type="submit"
                        disabled={addingCategory}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {addingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </button>
                </form>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                    {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No categories added.</p>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <span className="text-sm font-medium">{cat.name}</span>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4 border-b pb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={changingPassword}
                className="flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Change Password
              </button>
            </form>
          </div>

          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4 border-b pb-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Customize how FinanceFlow looks for you.</p>
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-full text-xs font-medium border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-muted hover:bg-muted/80"}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-full text-xs font-medium border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-muted hover:bg-muted/80"}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => setTheme("system")}
                  className={`px-4 py-2 rounded-full text-xs font-medium border-2 transition-all ${theme === "system" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-muted hover:bg-muted/80"}`}
                >
                  System
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
