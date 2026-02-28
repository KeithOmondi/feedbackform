import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchAdminManuals, downloadReport } from "../features/manual/manualSlice";
import { type IManual, type IManualEntry } from "../features/manual/manualService";
import { Download, Loader2, Users, Landmark, FileText, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { adminManuals, loading } = useAppSelector((state) => state.manual);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminManuals());
  }, [dispatch]);

  const handleDownload = (userId?: string) => {
    dispatch(downloadReport(userId));
  };

  // Memoized unique user list from the audit logs
  const users = useMemo(() => {
    const usersMap: Record<string, { _id: string; name: string; pj: string }> = {};
    adminManuals.forEach((section) => {
      ["comments", "justifications", "references", "amendments"].forEach((key) => {
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

  const columns: { label: string; key: keyof Pick<IManual, "justifications" | "references" | "amendments" | "comments"> }[] = [
    { label: "Justifications", key: "justifications" },
    { label: "References", key: "references" },
    { label: "Proposed Wording", key: "amendments" },
    { label: "General Comments", key: "comments" },
  ];

  const getEntryText = (entry: IManualEntry, type: string) => {
    switch (type) {
      case "comments": return entry.comment;
      case "justifications": return entry.justification;
      case "amendments": return entry.proposedChange;
      case "references": return entry.reference;
      default: return "";
    }
  };

  return (
    <div className="flex h-screen bg-[#fdfcf0] overflow-hidden font-sans">
      {/* SIDEBAR - Deep Green UI */}
      <aside className="w-[340px] bg-[#1a3a32] text-white flex flex-col border-r border-[#b48222]/20 shadow-2xl z-20">
        <div className="p-8 border-b border-white/5 bg-[#16312a]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#b48222] p-2.5 rounded-sm shadow-lg">
              <Landmark size={22} className="text-white" />
            </div>
            <h2 className="font-bold text-[12px] uppercase tracking-[0.25em] text-[#b48222]">
              Audit Registry
            </h2>
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Reviewing Judge
          </p>
        </div>

        {/* USER LIST */}
        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {users.length ? (
            users.map((u) => (
              <button
                key={u._id}
                className={`w-full text-left px-8 py-6 transition-all border-l-[4px] relative border-b border-white/5 ${
                  selectedUserId === u._id
                    ? "bg-[#b48222]/10 border-[#b48222] text-white shadow-inner"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setSelectedUserId(u._id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider mb-1">
                      {u.name}
                    </p>
                    <p className={`text-[9px] font-mono font-bold ${
                      selectedUserId === u._id ? "text-[#b48222]" : "text-white/20"
                    }`}>
                      PJ NO: {u.pj}
                    </p>
                  </div>
                  {selectedUserId === u._id && (
                    <div className="bg-[#b48222] rounded-full p-1 shadow-md">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-8 py-20 text-center">
              <Users size={32} className="mx-auto text-white/5 mb-4" />
              <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">
                No active archives found
              </p>
            </div>
          )}
        </nav>

        {/* ACTIONS - Gold & Dark Contrast */}
        <div className="p-6 bg-[#16312a] border-t border-white/10 space-y-3">
          <button
            className="w-full flex items-center justify-center gap-3 bg-[#b48222] text-white px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl rounded-sm"
            onClick={() => handleDownload()}
          >
            <Download size={16} /> Download Full Report
          </button>
          {selectedUserId && (
            <button
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-[#b48222]/40 text-[#b48222] px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#b48222] hover:text-white transition-all rounded-sm"
              onClick={() => handleDownload(selectedUserId)}
            >
              <Download size={16} /> Download Selected Judge
            </button>
          )}
        </div>
      </aside>

      {/* MAIN AUDIT PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white px-12 py-10 border-b-[4px] border-[#b48222] shadow-sm flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif text-[#1a3a32] font-bold tracking-tight">
              High Court of Kenya
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.3em]">
                Disciplinary Procedures Manual
              </span>
              <span className="h-1 w-1 bg-slate-300 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Centralized Audit System
              </span>
            </div>
          </div>
          <div className="text-right pb-1">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Archive Status</p>
            <p className="text-[10px] font-bold text-[#1a3a32] flex items-center justify-end gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Synchronization
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#fdfcfb]">
          {!selectedUserId && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                 <Landmark size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-serif text-slate-400 italic tracking-widest uppercase">
                Select a Judge from the registry to begin review
              </h3>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-[#b48222]" size={48} strokeWidth={1.5} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1a3a32]">
                Decrypting Judicial Archives...
              </p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12">
              {adminManuals.map((section: IManual) => {
                const entriesForUser = columns.filter(col => 
                  ((section as any)[col.key] as IManualEntry[])?.some(e => e.userId?._id === selectedUserId)
                );

                if (entriesForUser.length === 0) return null;

                return (
                  <div key={section._id} className="bg-white border border-slate-200 shadow-lg rounded-sm overflow-hidden">
                    {/* SECTION HEADER - Matching Screenshot */}
                    <div className="px-8 py-5 bg-[#1a3a32] flex justify-between items-center">
                      <div className="flex gap-5 items-center">
                        <span className="bg-[#b48222] text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-sm">
                          {section.code}
                        </span>
                        <h3 className="text-[12px] font-bold text-white uppercase tracking-[0.2em]">
                          {section.title}
                        </h3>
                      </div>
                      <FileText size={18} className="text-white/10" />
                    </div>

                    {/* DRAFT CONTENT */}
                    <div className="p-10 bg-[#fdfcfb] border-b border-dashed border-slate-100 relative">
                       <div className="absolute top-0 right-10 -translate-y-1/2 bg-white border border-slate-200 px-4 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] shadow-sm italic">
                        Draft Provision
                      </div>
                      <p className="italic font-serif text-xl text-slate-700 leading-relaxed text-justify">
                        {section.content}
                      </p>
                    </div>

                    {/* AUDIT COLUMNS */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 bg-white">
                      {columns.map((col) => {
                        const entries = ((section as any)[col.key] || []).filter(
                          (e: IManualEntry) => e.userId?._id === selectedUserId
                        );

                        return (
                          <div key={col.key}>
                            <h4 className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                              <span className="w-1.5 h-1.5 bg-[#b48222] rounded-full shadow-[0_0_8px_#b48222]" />
                              {col.label}
                            </h4>

                            <div className="space-y-8">
                              {entries.length ? (
                                entries.map((item: any, idx: number) => (
                                  <div key={idx} className="group border-l-2 border-slate-50 pl-5 hover:border-[#b48222] transition-all">
                                    <p className="text-[14px] text-[#1a3a32] leading-relaxed font-serif italic mb-4">
                                      {getEntryText(item, col.key) || "[ACTION: Amend]"}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                      Timestamp: {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-300 italic font-serif">
                                  No contribution for this field.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;