"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Activity, 
  User as UserIcon, 
  Calendar, 
  ArrowRight,
  PlusCircle,
  Edit,
  Trash2,
  DollarSign,
  Briefcase,
  Target,
  Clock,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/activity-logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE": return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case "UPDATE": return <Edit className="h-4 w-4 text-amber-500" />;
      case "DELETE": return <Trash2 className="h-4 w-4 text-red-500" />;
      case "SET_BUDGET": return <Target className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "EXPENSE": return <DollarSign className="h-3.5 w-3.5" />;
      case "INVESTMENT": return <Briefcase className="h-3.5 w-3.5" />;
      case "PARTNER": return <UserIcon className="h-3.5 w-3.5" />;
      case "BUDGET": return <Target className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Feed</h2>
        <p className="text-sm text-muted-foreground">Detailed audit trail of all organizational changes.</p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted/30 mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No activity recorded yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start space-x-4">
                <div className="mt-1 p-2 bg-muted/50 rounded-lg">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold">
                      <span className="text-primary">{log.user.name}</span>
                      {" "}<span className="text-muted-foreground font-medium lowercase"> {log.action.replace('_', ' ')}d</span>{" "}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider ml-1">
                        {getEntityIcon(log.entityType)}
                        <span className="ml-1">{log.entityType}</span>
                      </span>
                    </p>
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center">
                    ID: <span className="font-mono ml-1">{log.entityId}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
