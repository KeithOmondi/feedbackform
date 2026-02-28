import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchManuals, postEntry } from "../features/manual/manualSlice";
import { logout } from "../features/auth/authSlice";
import { Menu, X, Save, CheckCircle } from "lucide-react";

const UserManualPage = () => {
  const dispatch = useAppDispatch();
  const { manuals, loading } = useAppSelector((state) => state.manual);
  const { user } = useAppSelector((state) => state.auth);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    action: "Amend",
    rationale: "",
    references: "",
    wording: ""
  });

  useEffect(() => {
    dispatch(fetchManuals());
  }, [dispatch]);

  const groupedManuals = useMemo(() => {
    return manuals.reduce((acc: { [key: string]: any[] }, m) => {
      const part = m.part || "UNASSIGNED";
      if (!acc[part]) acc[part] = [];
      acc[part].push(m);
      return acc;
    }, {});
  }, [manuals]);

  useEffect(() => {
    if (manuals.length > 0 && !activeSectionId) {
      setActiveSectionId(manuals[0]._id);
    }
  }, [manuals, activeSectionId]);

  const activeSection = useMemo(() => manuals.find(m => m._id === activeSectionId), [manuals, activeSectionId]);
  const activeIndex = useMemo(() => manuals.findIndex(m => m._id === activeSectionId), [manuals, activeSectionId]);

  useEffect(() => {
    setFormData({ action: "Amend", rationale: "", references: "", wording: "" });
    setIsSidebarOpen(false); 
  }, [activeSectionId]);

  const handleSave = async (shouldNavigateNext: boolean = false) => {
    if (!activeSection || !user) return;
    setIsSubmitting(true);

    const submissions = [];
    if (formData.rationale.trim() || formData.action) {
      const contentWithAction = `[ACTION: ${formData.action}] ${formData.rationale}`;
      submissions.push(dispatch(postEntry({ sectionId: activeSection._id, userId: user.id, content: contentWithAction, type: "justification" })));
    }
    if (formData.references.trim()) {
      submissions.push(dispatch(postEntry({ sectionId: activeSection._id, userId: user.id, content: formData.references, type: "reference" })));
    }
    if (formData.wording.trim()) {
      submissions.push(dispatch(postEntry({ sectionId: activeSection._id, userId: user.id, content: formData.wording, type: "amendment" })));
    }

    try {
      await Promise.all(submissions);
      if (shouldNavigateNext && activeIndex < manuals.length - 1) {
        setActiveSectionId(manuals[activeIndex + 1]._id);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : "Hon. Justice Roseline Korir";

  return (
    <div className="flex h-screen bg-[#f3eee1] overflow-hidden font-sans relative">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-[#25443c] text-white flex flex-col border-r border-[#d9b929]/30 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9b929]">Manual Sections</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase mt-1">
              {manuals.length > 0 ? `${activeIndex + 1} / ${manuals.length}` : "0 / 0"} Reviewed
            </p>
          </div>
          <button className="lg:hidden text-[#d9b929]" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {!loading && Object.entries(groupedManuals).map(([partName, sections]) => (
            <div key={partName} className="mb-6">
              <h3 className="px-6 text-[9px] font-black text-[#d9b929] uppercase mb-2 tracking-[0.15em] opacity-80">{partName}</h3>
              <div className="space-y-0.5">
                {sections.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => setActiveSectionId(m._id)}
                    className={`w-full text-left px-6 py-3 flex items-start gap-3 border-l-[3px] transition-all ${activeSectionId === m._id ? "bg-white/10 border-[#d9b929] text-white" : "border-transparent text-white/60 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className={`text-[10px] font-bold font-mono mt-0.5 ${activeSectionId === m._id ? "text-[#d9b929]" : "text-white/20"}`}>{m.code}</span>
                    <span className="text-[11px] sm:text-[12px] font-medium leading-tight">{m.title}</span>
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
        <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-[3px] border-[#d9b929] shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="lg:hidden p-2 text-[#25443c] hover:bg-gray-100 rounded-md" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <img src="/JOB_LOGO.jpg" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            <div className="hidden xs:block">
              <h1 className="text-[#25443c] font-serif text-sm sm:text-lg leading-tight font-bold uppercase tracking-tight">High Court of Kenya</h1>
              <p className="text-[#d9b929] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em]">Draft Disciplinary Procedures Manual</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
            <div className="flex items-center gap-3">
              <p className="text-[#25443c] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                {displayName}
              </p>
              <button 
                onClick={() => dispatch(logout())}
                className="text-[#d9b929] hover:bg-[#d9b929] hover:text-white text-[9px] sm:text-[10px] font-black uppercase border-2 border-[#d9b929] px-3 py-1 rounded-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
          {activeSection ? (
            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
              <div className="space-y-2 sm:space-y-4">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b929]">
                  {activeSection.part} • Section {activeSection.code}
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#25443c] leading-tight">{activeSection.title}</h2>
              </div>

              {/* Draft Provision Box */}
              <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-sm shadow-sm relative">
                <div className="absolute top-0 left-4 sm:left-8 transform -translate-y-1/2 bg-[#25443c] text-[#d9b929] px-3 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                  Draft Provision
                </div>
                <p className="text-[#333] leading-relaxed font-serif italic text-base sm:text-xl">
                  {activeSection.content}
                </p>
              </div>

              {/* Form Feedback */}
              <div className="space-y-8 sm:space-y-10">
                <h3 className="text-[11px] sm:text-[12px] font-black text-[#25443c] uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3">
                  <span className="w-6 sm:w-8 h-px bg-[#d9b929]" />
                  Section Feedback
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9b929]"></span> Field 1: Action
                  </label>
                  <select 
                    value={formData.action}
                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-3 sm:p-4 text-sm outline-none focus:border-[#25443c]"
                  >
                    <option value="Amend">Amend</option>
                    <option value="Clarify">Clarify</option>
                    <option value="Retain as is">Retain as is</option>
                    <option value="Delete">Delete</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9b929]"></span> Field 2: Justification
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.rationale}
                    onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-4 sm:p-5 text-sm outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Enter legal justification..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9b929]"></span> Field 3: References
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.references}
                    onChange={(e) => setFormData({...formData, references: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-4 sm:p-5 text-sm outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Statutory or Case Law references..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9b929]"></span> Field 4: Proposed Wording
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.wording}
                    onChange={(e) => setFormData({...formData, wording: e.target.value})}
                    className="w-full bg-[#f9f7f0] border-l-4 border-l-[#d9b929] border-t border-r border-b border-slate-200 p-4 sm:p-5 text-sm outline-none focus:border-[#25443c] font-serif italic"
                    placeholder="Type the exact proposed wording here..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 pb-16">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)}
                    className="bg-[#25443c] text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#1a312b] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Save Draft
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)}
                    className="bg-[#d9b929] text-[#25443c] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#c2a525] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Processing..." : <><CheckCircle size={14} /> Commit & Next →</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-serif italic animate-pulse">
               Accessing Registry Records...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManualPage;