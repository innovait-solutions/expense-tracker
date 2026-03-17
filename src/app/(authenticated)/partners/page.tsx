"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Users, Mail, Trash2, Edit2, Info, X, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export default function PartnersPage() {
  const { organization } = useOrganization();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "" });

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/partners");
      setPartners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPartner = async (e: any) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await axios.put(`/api/partners/${editingPartner.id}`, formData);
      } else {
        await axios.post("/api/partners", formData);
      }
      setShowAddModal(false);
      setEditingPartner(null);
      setFormData({ name: "", email: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, email: partner.email });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will remove the partner but keep their recorded transactions.")) {
      try {
        await axios.delete(`/api/partners/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
        const res = await axios.get(`/api/partners/${id}`);
        setShowDetailModal(res.data);
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partners</h2>
          <p className="text-sm text-muted-foreground">Manage your investors and collaboration partners.</p>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null);
            setFormData({ name: "", email: "" });
            setShowAddModal(true);
          }}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Invite Partner
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
             <div className="col-span-full text-center py-8">Loading...</div>
        ) : partners.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">No partners found. Invite someone to collaborate!</div>
        ) : (
          partners.map((partner: any) => (
            <div key={partner.id} className="p-6 bg-card border rounded-xl shadow-sm relative group transition-all hover:shadow-md">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(partner)} className="p-1 hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(partner.id)} className="p-1 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-center mb-1">{partner.name}</h3>
                <p className="text-sm text-muted-foreground text-center truncate mb-4">
                    {partner.email}
                </p>
                <div className="flex justify-center">
                    <button 
                        onClick={() => handleViewDetails(partner.id)}
                        className="flex items-center text-xs font-semibold px-4 py-1.5 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                        <Info className="h-3 w-3 mr-1" /> View Details
                    </button>
                </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-sm border rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">{editingPartner ? "Edit Partner" : "Invite New Partner"}</h3>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Partner Name</label>
                <input
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.email}
                  disabled={!!editingPartner}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {!editingPartner && (
                    <p className="text-[10px] text-muted-foreground mt-1">An invitation will be sent to this email.</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
                >
                  {editingPartner ? "Save Changes" : "Invite Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card w-full max-w-2xl border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{showDetailModal.name}</h3>
                            <p className="text-sm text-muted-foreground">{showDetailModal.email}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowDetailModal(null)} className="p-2 hover:bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Invested</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(showDetailModal.totalInvested, organization?.currency)}
                            </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Paid for Expenses</p>
                            <p className="text-2xl font-bold text-red-500">
                                {formatCurrency(showDetailModal.totalPaid, organization?.currency)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-bold border-b pb-2 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" /> Recent Activity
                        </h4>
                        <div className="space-y-2">
                             {showDetailModal.expenses?.length === 0 && showDetailModal.investments?.length === 0 && (
                                 <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
                             )}
                             {showDetailModal.expenses?.map((e: any) => (
                                 <div key={e.id} className="flex items-center justify-between text-sm p-2 border-b last:border-0">
                                     <div>
                                         <p className="font-medium">{e.title}</p>
                                         <p className="text-xs text-muted-foreground">{format(new Date(e.expenseDate), 'MMM dd, yyyy')} • Expense</p>
                                     </div>
                                     <p className="font-bold text-red-500">-{formatCurrency(e.amount, organization?.currency)}</p>
                                 </div>
                             ))}
                             {showDetailModal.investments?.map((i: any) => (
                                 <div key={i.id} className="flex items-center justify-between text-sm p-2 border-b last:border-0">
                                     <div>
                                         <p className="font-medium">{i.title}</p>
                                         <p className="text-xs text-muted-foreground">{format(new Date(i.investmentDate), 'MMM dd, yyyy')} • Investment</p>
                                     </div>
                                     <p className="font-bold text-primary">+{formatCurrency(i.amount, organization?.currency)}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}
