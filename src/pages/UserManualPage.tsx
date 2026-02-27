import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchManuals, postEntry } from "../features/manual/manualSlice";

const UserManualPage = () => {
  const dispatch = useAppDispatch();
  const { manuals, loading } = useAppSelector((state) => state.manual);
  const { user } = useAppSelector((state) => state.auth);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    action: "Amend",
    rationale: "",
    references: "",
    wording: ""
  });

  useEffect(() => {
    dispatch(fetchManuals());
  }, [dispatch]);

  // Grouping manuals by "Part" for the sidebar
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
  }, [activeSectionId]);

  const handleSave = async (shouldNavigateNext: boolean = false) => {
    if (!activeSection || !user) return;
    setIsSubmitting(true);

    const submissions = [];
    if (formData.rationale.trim()) {
      submissions.push(dispatch(postEntry({ sectionId: activeSection._id, userId: user.id, content: formData.rationale, type: "justification" })));
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

  return (
    <div className="flex h-screen bg-[#f3eee1] overflow-hidden font-sans">
      
      {/* 1. INSTITUTIONAL DARK SIDEBAR */}
      <aside className="w-[320px] bg-[#12110b] text-white flex flex-col border-r border-[#b48222]/30 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b48222] mb-4">Manual Sections</h2>
          <div className="space-y-2">
            <div className="w-full bg-white/10 h-[3px] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#b48222] transition-all duration-500" 
                style={{ width: `${manuals.length > 0 ? ((activeIndex + 1) / manuals.length) * 100 : 0}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              {manuals.length > 0 ? `${activeIndex + 1} / ${manuals.length}` : "0 / 0"} Reviewed
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {loading ? (
             <div className="px-6 py-4 animate-pulse space-y-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white/5 rounded w-full" />)}
             </div>
          ) : (
            Object.entries(groupedManuals).map(([partName, sections]) => (
              <div key={partName} className="mb-8">
                <h3 className="px-6 text-[9px] font-black text-[#b48222] uppercase mb-3 tracking-[0.15em] opacity-80 border-l-[3px] border-transparent">
                  {partName}
                </h3>
                <div className="space-y-0.5">
                  {sections.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => setActiveSectionId(m._id)}
                      className={`w-full text-left px-6 py-3 flex items-start gap-4 border-l-[3px] transition-all ${
                        activeSectionId === m._id 
                        ? "bg-[#b48222]/10 border-[#b48222] text-white" 
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className={`text-[10px] font-bold font-mono mt-0.5 ${activeSectionId === m._id ? "text-[#b48222]" : "text-slate-600"}`}>
                        {m.code}
                      </span>
                      <span className="text-[12px] font-medium leading-tight tracking-tight">
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button className="w-full bg-white/5 hover:bg-[#b48222] hover:text-[#12110b] text-white py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm">
             View & Submit Summary
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Institutional Header */}
        <header className="bg-[#12110b] px-8 py-4 flex items-center justify-between border-b-[3px] border-[#b48222]">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#b48222] rounded-full flex items-center justify-center">
                 <svg className="w-5 h-5 text-[#12110b]" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2L3 7v2c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" />
                 </svg>
              </div>
              <div>
                <h1 className="text-white font-serif text-sm leading-tight tracking-wide">OFFICE OF THE EREGISTRAR HIGH COURT</h1>
                <p className="text-[#b48222] text-[8px] font-bold uppercase tracking-widest">High Court Review Portal</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[#b48222] text-[10px] font-bold uppercase tracking-wider">
                Hon. Justice {user?.id || "Roseline Korir"}
              </span>
              <button className="text-white border border-white/20 px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-white/10 transition-colors">
                Sign Out
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeSection ? (
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Part Label & Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b48222]">
                  <span>{activeSection.part}</span>
                  <span className="text-slate-300">•</span>
                  <span>Section {activeSection.code}</span>
                </div>
                <h2 className="font-serif text-4xl text-[#12110b] leading-tight">
                  {activeSection.title}
                </h2>
                <p className="text-slate-500 text-sm italic font-serif">
                  Review the current draft and provide your constitutional recommendations below.
                </p>
              </div>

              {/* Draft Provision Box */}
              <div className="bg-white border border-slate-200 p-10 rounded-sm shadow-sm relative group">
                <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-[#12110b] text-[#b48222] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
                  Draft Provision
                </div>
                <p className="text-[#333] leading-relaxed font-serif italic text-xl first-letter:text-3xl">
                  {activeSection.content}
                </p>
              </div>

              <hr className="border-slate-200" />

              {/* FORM SECTION */}
              <div className="space-y-10">
                <h3 className="text-[12px] font-black text-[#1a3a32] uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-8 h-px bg-[#b48222]" />
                  Your Comments on this Section
                </h3>
                
                {/* Field 1: Action */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3a32] text-white text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">Field 1</span>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recommended Action</label>
                  </div>
                  <select 
                    value={formData.action}
                    onChange={(e) => setFormData({...formData, action: e.target.value})}
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-4 text-sm font-medium outline-none focus:border-[#b48222] transition-colors"
                  >
                    <option>Amend</option>
                    <option>Retain Without Changes</option>
                    <option>Delete</option>
                  </select>
                </div>

                {/* Field 2: Rationale */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3a32] text-white text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">Field 2</span>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rationale / Justification</label>
                  </div>
                  <textarea 
                    rows={4}
                    value={formData.rationale}
                    onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                    placeholder="Provide the legal or administrative reasoning for your proposal..."
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 text-sm outline-none focus:border-[#b48222] transition-colors font-serif italic"
                  />
                </div>

                {/* Field 3: References */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3a32] text-white text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">Field 3</span>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Legal References</label>
                  </div>
                  <textarea 
                    rows={3}
                    value={formData.references}
                    onChange={(e) => setFormData({...formData, references: e.target.value})}
                    placeholder="Constitution, Judicial Service Act, Regulations, or Jurisprudence..."
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 text-sm outline-none focus:border-[#b48222] transition-colors font-serif italic"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-4 pt-10 border-t border-slate-100 pb-20">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)} 
                    className="bg-[#12110b] text-white px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black flex items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#b48222]" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16a3 3 0 110-6 3 3 0 010 6zm3-10H5V5h10v4z"/></svg>
                    Save Draft
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)} 
                    className="bg-[#b48222] text-[#12110b] px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c59330] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Commit & Next Section →"}
                  </button>
                  <button className="border border-slate-300 text-slate-400 px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
                    Skip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-serif text-xl italic">
               Select a registry record to begin review
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManualPage;