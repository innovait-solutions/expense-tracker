"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Search, Filter, Trash2, Edit2, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export default function InvestmentsPage() {
  const { organization } = useOrganization();
  const [investments, setInvestments] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingInvestment, setEditingInvestment] = useState<any>(null);

  const [formData, setFormData] = useState({
    partnerId: "",
    amount: "",
    investmentDate: new Date().toISOString().split("T")[0],
    investmentType: "ONE_TIME",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [invRes, partRes] = await Promise.all([
        axios.get("/api/investments"),
        axios.get("/api/partners"),
      ]);
      setInvestments(invRes.data);
      setPartners(partRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      partnerId: "",
      amount: "",
      investmentDate: new Date().toISOString().split("T")[0],
      investmentType: "ONE_TIME",
      notes: "",
    });
    setEditingInvestment(null);
  };

  const handleAddInvestment = async (e: any) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await axios.put(`/api/investments/${editingInvestment.id}`, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await axios.post("/api/investments", {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setFormData({
      partnerId: investment.partnerId,
      amount: investment.amount.toString(),
      investmentDate: new Date(investment.investmentDate).toISOString().split("T")[0],
      investmentType: investment.investmentType,
      notes: investment.notes || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment record?")) {
      await axios.delete(`/api/investments/${id}`);
      fetchData();
    }
  };

  const filteredInvestments = investments.filter((i: any) => 
    i.partner?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvestments = investments.reduce((acc, curr: any) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investments</h2>
          <p className="text-sm text-muted-foreground">Track capital injections and partner contributions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Investment
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-5 bg-card border rounded-xl shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Capital</p>
          <p className="text-2xl font-bold tracking-tighter text-primary">
            {formatCurrency(totalInvestments, organization?.currency)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by partner or notes..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading investments...</td></tr>
            ) : filteredInvestments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No investments found.</td></tr>
            ) : (
              filteredInvestments.map((inv: any) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Wallet className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold">{inv.partner?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold uppercase tracking-tighter">
                        {inv.investmentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(inv.investmentDate), "MMM dd, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                    {inv.notes || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary tracking-tighter">
                    {formatCurrency(inv.amount, organization?.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(inv)} className="p-1.5 hover:bg-muted rounded-md transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg border rounded-2xl shadow-2xl p-8 transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">{editingInvestment ? "Edit Investment" : "Record Investment"}</h3>
            <form onSubmit={handleAddInvestment} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Investor / Partner</label>
                  <select
                    required
                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                  >
                    <option value="">Select Partner</option>
                    {partners.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Amount</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={formData.investmentDate}
                    onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Describe the nature of this investment..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2 text-sm font-semibold border rounded-xl hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:shadow-xl active:scale-95 transition-all"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
