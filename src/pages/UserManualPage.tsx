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
    wording: "" // This maps to Field 4
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
  }, [activeSectionId]);

  const handleSave = async (shouldNavigateNext: boolean = false) => {
    if (!activeSection || !user) return;
    setIsSubmitting(true);

    const submissions = [];
    
    // Field 1 & 2: Action & Rationale
    if (formData.rationale.trim() || formData.action) {
      const contentWithAction = `[ACTION: ${formData.action}] ${formData.rationale}`;
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, 
        userId: user.id, 
        content: contentWithAction, 
        type: "justification" 
      })));
    }

    // Field 3: References
    if (formData.references.trim()) {
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, 
        userId: user.id, 
        content: formData.references, 
        type: "reference" 
      })));
    }

    // Field 4: Suggested Wording
    if (formData.wording.trim()) {
      submissions.push(dispatch(postEntry({ 
        sectionId: activeSection._id, 
        userId: user.id, 
        content: formData.wording, 
        type: "amendment" 
      })));
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
      
      {/* 1. SIDEBAR */}
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
          {!loading && Object.entries(groupedManuals).map(([partName, sections]) => (
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
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button className="w-full bg-white/5 hover:bg-[#b48222] hover:text-[#12110b] text-white py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm">
             View & Submit Summary
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#12110b] px-8 py-4 flex items-center justify-between border-b-[3px] border-[#b48222]">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#b48222] rounded-full flex items-center justify-center">
                 <span className="text-lg">⚖️</span>
              </div>
              <h1 className="text-white font-serif text-sm leading-tight tracking-wide uppercase">Office of the Registrar High Court</h1>
           </div>
           <div className="flex items-center gap-4 text-white">
              <span className="text-[#b48222] text-[10px] font-bold uppercase tracking-wider">
                Hon. Justice {user?.id || "Roseline Korir"}
              </span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeSection ? (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b48222]">
                  {activeSection.part} • Section {activeSection.code}
                </div>
                <h2 className="font-serif text-4xl text-[#12110b] leading-tight">{activeSection.title}</h2>
              </div>

              <div className="bg-white border border-slate-200 p-10 rounded-sm shadow-sm relative">
                <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-[#12110b] text-[#b48222] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                  Draft Provision
                </div>
                <p className="text-[#333] leading-relaxed font-serif italic text-xl">
                  {activeSection.content}
                </p>
              </div>

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
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-4 text-sm font-medium outline-none focus:border-[#b48222] transition-colors appearance-none"
                  >
                    <option value="Amend">Amend</option>
                    <option value="Clarify">Clarify</option>
                    <option value="Retain as is">Retain as is</option>
                    <option value="Delete">Delete</option>
                    <option value="No comment in this section">No comment in this section</option>
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
                    placeholder="Provide legal reasoning..."
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 text-sm outline-none focus:border-[#b48222] font-serif italic"
                  />
                </div>

                {/* Field 3: Relevant References */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3a32] text-white text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">Field 3</span>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Relevant References</label>
                  </div>
                  <textarea 
                    rows={3}
                    value={formData.references}
                    onChange={(e) => setFormData({...formData, references: e.target.value})}
                    placeholder="Constitution, Case Law, or Statutory references..."
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 text-sm outline-none focus:border-[#b48222] font-serif italic"
                  />
                </div>

                {/* Field 4: Clear Recommendations & Suggested Wording */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3a32] text-white text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">Field 4</span>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Clear Recommendations & Suggested Wording</label>
                  </div>
                  <textarea 
                    rows={5}
                    value={formData.wording}
                    onChange={(e) => setFormData({...formData, wording: e.target.value})}
                    placeholder="Specify the exact wording or structural changes proposed..."
                    className="w-full bg-[#f9f7f0] border border-slate-200 p-5 text-sm outline-none focus:border-[#b48222] font-serif italic border-l-4 border-l-[#b48222]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-4 pt-10 border-t border-slate-100 pb-20">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)}
                    className="bg-[#12110b] text-white px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)}
                    className="bg-[#b48222] text-[#12110b] px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c59330] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Commit & Next Section →"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-serif text-xl italic">
               Loading Registry Records...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManualPage;