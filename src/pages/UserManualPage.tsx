import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchManuals, postEntry } from "../features/manual/manualSlice";
import { logout } from "../features/auth/authSlice";
import { Menu, Save, CheckCircle, Loader2 } from "lucide-react";

const UserManualPage = () => {
  const dispatch = useAppDispatch();
  const { manuals} = useAppSelector((state) => state.manual);
  const { user } = useAppSelector((state) => state.auth);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    action: "amend",
    rationale: "",
    references: "",
    wording: ""
  });

  // Fetch manuals on mount
  useEffect(() => {
    dispatch(fetchManuals());
  }, [dispatch]);

  // Grouping logic for the sidebar
  const groupedManuals = useMemo(() => {
    return manuals.reduce((acc: { [key: string]: any[] }, m) => {
      const part = m.part || "UNASSIGNED";
      if (!acc[part]) acc[part] = [];
      acc[part].push(m);
      return acc;
    }, {});
  }, [manuals]);

  // Set default selection
  useEffect(() => {
    if (manuals.length > 0 && !activeSectionId) {
      setActiveSectionId(manuals[0]._id);
    }
  }, [manuals, activeSectionId]);

  const activeSection = useMemo(() => manuals.find(m => m._id === activeSectionId), [manuals, activeSectionId]);
  const activeIndex = useMemo(() => manuals.findIndex(m => m._id === activeSectionId), [manuals, activeSectionId]);

  // Reset form when section changes
  useEffect(() => {
    setFormData({ action: "amend", rationale: "", references: "", wording: "" });
    setIsSidebarOpen(false);
  }, [activeSectionId]);

  const handleSave = async (shouldNavigateNext: boolean = false) => {
    // 1. Debugging check
    console.log("Save initiated. User:", user?._id || (user as any)?.id);

    const userId = user?._id || (user as any)?.id;
    if (!activeSection || !userId) {
      alert("System Error: Section or User ID missing.");
      return;
    }

    setIsSubmitting(true);
    const submissions = [];

    // Action (Always sent)
    submissions.push(dispatch(postEntry({ 
      sectionId: activeSection._id, 
      userId, 
      content: formData.action, 
      type: "action" 
    })).unwrap());

    // Optional Fields
    if (formData.rationale.trim()) {
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, userId, content: formData.rationale.trim(), type: "justification" 
      })).unwrap());
    }
    if (formData.references.trim()) {
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, userId, content: formData.references.trim(), type: "reference" 
      })).unwrap());
    }
    if (formData.wording.trim()) {
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, userId, content: formData.wording.trim(), type: "amendment" 
      })).unwrap());
    }

    try {
      await Promise.all(submissions);
      console.log("All entries saved.");
      
      if (shouldNavigateNext && activeIndex < manuals.length - 1) {
        setActiveSectionId(manuals[activeIndex + 1]._id);
      } else {
        alert("Draft saved successfully.");
      }
    } catch (error: any) {
      console.error("Save failed:", error);
      alert("Error: " + (error?.message || "Internal Server Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Hon. Justice User";

  return (
    <div className="flex h-screen bg-[#f3eee1] overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[300px] bg-[#25443c] text-white flex flex-col border-r border-[#d9b929]/30 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9b929]">Manual Sections</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase mt-1">
            {manuals.length > 0 ? `${activeIndex + 1} / ${manuals.length}` : "0 / 0"} Reviewed
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {Object.entries(groupedManuals).map(([partName, sections]) => (
            <div key={partName} className="mb-6">
              <h3 className="px-6 text-[9px] font-black text-[#d9b929] uppercase mb-2 tracking-[0.15em] opacity-80">{partName}</h3>
              <div className="space-y-0.5">
                {sections.map((m: any) => (
                  <button
                    key={m._id}
                    onClick={() => setActiveSectionId(m._id)}
                    className={`w-full text-left px-6 py-3 flex items-start gap-3 border-l-[3px] transition-all ${activeSectionId === m._id ? "bg-white/10 border-[#d9b929] text-white" : "border-transparent text-white/60 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className={`text-[10px] font-bold font-mono mt-0.5 ${activeSectionId === m._id ? "text-[#d9b929]" : "text-white/20"}`}>{m.code}</span>
                    <span className="text-[12px] font-medium leading-tight">{m.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* HEADER */}
        <header className="bg-white px-6 py-4 flex items-center justify-between border-b-[3px] border-[#d9b929] shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-[#25443c]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-[#25443c] font-serif text-lg font-bold uppercase tracking-tight">High Court of Kenya</h1>
              <p className="text-[#d9b929] text-[9px] font-bold uppercase tracking-[0.1em]">Draft Disciplinary Procedures Manual</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l pl-4">
            <span className="text-[#25443c] text-[11px] font-bold uppercase">{displayName}</span>
            <button onClick={() => dispatch(logout())} className="text-[#d9b929] text-[10px] font-black uppercase border-2 border-[#d9b929] px-3 py-1 hover:bg-[#d9b929] hover:text-white transition-all">
              Sign Out
            </button>
          </div>
        </header>

        {/* SCROLLABLE FORM AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar">
          {activeSection ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Header Title */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b929]">{activeSection.part} • Section {activeSection.code}</div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#25443c]">{activeSection.title}</h2>
              </div>

              {/* Draft Provision Card */}
              <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-sm shadow-sm relative">
                <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-[#25443c] text-[#d9b929] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">Draft Provision</div>
                <p className="text-[#333] leading-relaxed font-serif italic text-xl">{activeSection.content}</p>
              </div>

              {/* FEEDBACK FIELDS */}
              <div className="space-y-8">
                <h3 className="text-[12px] font-black text-[#25443c] uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-8 h-px bg-[#d9b929]" /> Section Feedback
                </h3>

                {/* Field 1: Action */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Field 1: Action</label>
                  <select 
                    value={formData.action}
                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-4 outline-none focus:border-[#25443c] appearance-none"
                  >
                    <option value="amend">Amend</option>
                    <option value="clarify">Clarify</option>
                    <option value="Retain as is">Retain as is</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>

                {/* Field 2: Justification */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Field 2: Justification</label>
                  <textarea 
                    rows={4}
                    value={formData.rationale}
                    onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Enter legal justification..."
                  />
                </div>

                {/* Field 3: References */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Field 3: References</label>
                  <textarea 
                    rows={2}
                    value={formData.references}
                    onChange={(e) => setFormData({...formData, references: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Statutory or Case Law..."
                  />
                </div>

                {/* Field 4: Proposed Wording */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Field 4: Proposed Wording</label>
                  <textarea 
                    rows={4}
                    value={formData.wording}
                    onChange={(e) => setFormData({...formData, wording: e.target.value})}
                    className="w-full bg-[#f9f7f0] border-l-4 border-l-[#d9b929] border-y border-r border-slate-200 p-5 outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Exact wording..."
                  />
                </div>

                {/* FINAL BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-20">
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)}
                    className="bg-[#25443c] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1a312b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> {isSubmitting ? "Saving..." : "Save Draft"}
                  </button>
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)}
                    className="bg-[#d9b929] text-[#25443c] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c2a525] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Commit & Next →</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-serif italic">
              Accessing Registry Records...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManualPage;