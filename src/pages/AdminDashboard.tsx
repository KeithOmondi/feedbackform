import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchAdminManuals, downloadReport } from "../features/manual/manualSlice";
import {  type IManualEntry } from "../features/manual/manualService";
import { Download, Loader2, Landmark, CheckCircle, Menu, X, FileText } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { adminManuals, loading } = useAppSelector((state) => state.manual);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminManuals());
  }, [dispatch]);

  const handleDownload = (userId?: string) => {
    dispatch(downloadReport(userId));
  };

  /* ===============================
     USER EXTRACTION LOGIC
     Scans all 5 possible arrays to find contributing Judges
  =============================== */
  const users = useMemo(() => {
    const usersMap: Record<string, { _id: string; name: string; pj: string }> = {};
    adminManuals.forEach((section) => {
      ["actions", "justifications", "references", "amendments", "comments"].forEach((key) => {
        (section as any)[key]?.forEach((entry: IManualEntry) => {
          if (entry.userId) {
            usersMap[entry.userId._id] = {
              _id: entry.userId._id,
              name: `${entry.userId.firstName} ${entry.userId.lastName}`,
              pj: entry.userId.pj,
            };
          }
        });
      });
    });
    return Object.values(usersMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [adminManuals]);

  /* ===============================
     COLUMN MAPPING
     This MUST match your backend controller's typeMap exactly.
  =============================== */
  const columns = [
    { label: "Field 1: Action", dataKey: "actions", fieldName: "action" },
    { label: "Field 2: Justification", dataKey: "justifications", fieldName: "justification" },
    { label: "Field 3: References", dataKey: "references", fieldName: "reference" },
    { label: "Field 4: Proposed Wording", dataKey: "amendments", fieldName: "proposedChange" },
  ];

  return (
    <div className="flex h-screen bg-[#fdfcfb] overflow-hidden font-sans relative">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[300px] bg-[#1a3a32] text-white flex flex-col transition-transform duration-300 transform lg:relative lg:translate-x-0 lg:w-[340px] ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 border-b border-white/5 bg-[#16312a] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#b48222] p-2 rounded-sm shadow-lg">
              <Landmark size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-[12px] uppercase tracking-[0.25em] text-[#b48222]">Audit Registry</h2>
          </div>
          <button className="lg:hidden text-white/50" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {users.length > 0 ? (
            users.map((u) => (
              <button
                key={u._id}
                className={`w-full text-left px-8 py-6 transition-all border-l-[4px] relative border-b border-white/5 ${selectedUserId === u._id ? "bg-[#b48222]/10 border-[#b48222] text-white" : "border-transparent text-white/50 hover:bg-white/5"}`}
                onClick={() => { setSelectedUserId(u._id); setIsSidebarOpen(false); }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider">{u.name}</p>
                    <p className="text-[9px] font-mono font-bold text-white/20">PJ: {u.pj}</p>
                  </div>
                  {selectedUserId === u._id && <CheckCircle size={12} className="text-[#b48222]" />}
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-white/20 text-[10px] uppercase tracking-widest italic">No Judge Activity Detected</div>
          )}
        </nav>

        <div className="p-6 bg-[#16312a] border-t border-white/10 space-y-2">
          <button onClick={() => handleDownload()} className="w-full flex items-center justify-center gap-2 bg-[#b48222] text-white px-3 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm transition-colors hover:bg-[#9a6e1c]">
            <Download size={14} /> Full Audit Report
          </button>
          {selectedUserId && (
            <button onClick={() => handleDownload(selectedUserId)} className="w-full flex items-center justify-center gap-2 border border-[#b48222]/40 text-[#b48222] px-3 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-[#b48222]/5">
              <Download size={14} /> Download for Judge
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white px-12 py-10 border-b-[4px] border-[#b48222] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-[#1a3a32]" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <div>
              <h1 className="text-4xl font-serif text-[#1a3a32] font-bold tracking-tight">High Court of Kenya</h1>
              <p className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] mt-1">Centralized Audit System</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#fdfcfb]">
          {!selectedUserId && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Landmark size={48} className="text-slate-100 mb-4" />
              <h3 className="text-lg font-serif text-slate-400 italic uppercase tracking-widest">Select a Judge to review entries</h3>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#b48222]" size={32} />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1a3a32]">Syncing Records...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-12">
              {adminManuals.map((section: any) => {
                // Determine if the selected judge has any entry in this section
                const hasActivity = columns.some(col => 
                  section[col.dataKey]?.some((e: any) => e.userId?._id === selectedUserId)
                );

                if (!hasActivity) return null;

                return (
                  <div key={section._id} className="bg-white border border-slate-200 shadow-md rounded-sm overflow-hidden">
                    {/* SECTION BAR */}
                    <div className="px-8 py-4 bg-[#1a3a32] flex justify-between items-center">
                      <div className="flex gap-5 items-center">
                        <span className="bg-[#b48222] text-white text-[10px] font-mono font-bold px-2 py-1 rounded-sm">{section.code}</span>
                        <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">{section.title}</h3>
                      </div>
                      <FileText size={16} className="text-white/20" />
                    </div>

                    {/* PROVISION TEXT */}
                    <div className="p-10 bg-[#fdfcfb] border-b border-dashed border-slate-100">
                      <p className="italic font-serif text-xl text-slate-700 leading-relaxed max-w-5xl">{section.content}</p>
                    </div>

                    {/* 4-COLUMN FEEDBACK GRID */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 bg-white">
                      {columns.map((col) => {
                        const entries = (section[col.dataKey] || []).filter(
                          (e: any) => e.userId?._id === selectedUserId
                        );

                        return (
                          <div key={col.dataKey} className="flex flex-col">
                            <h4 className="text-[9px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#b48222] rounded-full" />
                              {col.label}
                            </h4>
                            <div className="space-y-6">
                              {entries.length > 0 ? (
                                entries.map((item: any, idx: number) => (
                                  <div key={idx} className="border-l-2 border-slate-100 pl-5 hover:border-[#b48222] transition-colors">
                                    <p className="text-[14px] text-[#1a3a32] font-serif italic mb-2 leading-snug">
                                      {/* Specific formatting for the Action field */}
                                      {col.dataKey === "actions" 
                                        ? `[ACTION: ${item[col.fieldName]}]` 
                                        : item[col.fieldName] || "—"}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-300 italic pl-5">No entry.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Footer spacer for scroll comfort */}
              <div className="h-20" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;