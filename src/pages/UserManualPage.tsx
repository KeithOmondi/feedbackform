import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchManuals, postEntry } from "../features/manual/manualSlice";
import type { IManual, EntryType } from "../features/manual/manualService";

const UserManualPage = () => {
  const dispatch = useAppDispatch();
  const { manuals, loading } = useAppSelector((state) => state.manual);
  const { user } = useAppSelector((state) => state.auth);

  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"comments" | "amendments" | "justifications">("comments");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    dispatch(fetchManuals());
  }, [dispatch]);

  const parts = useMemo(() => {
    const uniqueParts = Array.from(new Set(manuals.map((m) => m.part)));
    uniqueParts.sort();
    return uniqueParts;
  }, [manuals]);

  const currentSections = useMemo(() => {
    if (!parts[currentPartIndex]) return [];
    return manuals
      .filter((m) => m.part === parts[currentPartIndex])
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [manuals, parts, currentPartIndex]);

  const handleSubmit = (sectionId: string) => {
    if (!inputText.trim() || !user) return;

    const singularType = activeTab.slice(0, -1) as EntryType;

    dispatch(
      postEntry({
        sectionId,
        userId: user.id,
        content: inputText.trim(),
        type: singularType,
      })
    );

    setInputText("");
    setSelectedSection(null);
  };

  if (loading && manuals.length === 0) return (
    <div className="flex h-64 items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-[#1a3a32] animate-pulse">
      Indexing...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      
      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1a3a32] uppercase tracking-tighter">FEEDBACK FORM</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1"></p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setCurrentPartIndex(i => Math.max(0, i - 1))}
            disabled={currentPartIndex === 0}
            className="p-2 hover:bg-slate-50 disabled:opacity-20 transition-all text-[#b48222]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="px-4 text-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Current Partition</p>
            <span className="text-xs font-black text-[#1a3a32] uppercase tracking-widest">Part {parts[currentPartIndex]}</span>
          </div>
          <button 
            onClick={() => setCurrentPartIndex(i => Math.min(parts.length - 1, i + 1))}
            disabled={currentPartIndex === parts.length - 1}
            className="p-2 hover:bg-slate-50 disabled:opacity-20 transition-all text-[#b48222]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {currentSections.map((section: IManual) => (
          <div key={section._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            
            <div className="bg-[#1a3a32] px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="bg-[#b48222] text-white text-[10px] font-black px-3 py-1 rounded-lg tracking-widest">{section.code}</span>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{section.title}</h3>
              </div>
            </div>

            <div className="flex border-b border-slate-50 px-10 bg-slate-50/50">
              {(['comments', 'amendments', 'justifications'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === tab 
                    ? "border-[#b48222] text-[#1a3a32]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-10 space-y-8">
              <div className="min-h-[120px]">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4"> {activeTab}</h4>
                
                <div className="space-y-4">
                 {section[activeTab] && section[activeTab].length > 0 ? (
  section[activeTab].map((entry: any, idx: number) => (
    <div key={idx} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
      {/* Vertical Accent Line */}
      <div className="w-1 bg-slate-100 rounded-full group-hover:bg-[#b48222] transition-colors" />
      
      <div className="flex-1 pb-4">
        {/* The Entry Message */}
        <p className="text-[12px] text-slate-700 font-medium leading-relaxed mb-2">
          {entry.comment || entry.proposedChange || entry.justification}
        </p>
        
        {/* Entry Metadata (Date Only) */}
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-bold text-slate-300 uppercase italic tracking-widest">
            RECORDED: {new Date(entry.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="py-8 border-2 border-dashed border-slate-50 rounded-3xl text-center">
    <p className="text-[9px] font-bold text-slate-300 uppercase italic">
      No {activeTab} recorded for this provision.
    </p>
  </div>
)}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <div className="flex flex-col gap-4">
                  <label className="text-[9px] font-black text-[#1a3a32] uppercase tracking-widest">Submit New {activeTab.slice(0, -1)}</label>
                  <div className="flex gap-3">
                    <textarea
                      rows={1}
                      placeholder={`Provide detailed ${activeTab.slice(0, -1)} for section ${section.code}...`}
                      value={selectedSection === section._id ? inputText : ""}
                      onChange={(e) => {
                        setSelectedSection(section._id);
                        setInputText(e.target.value);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[12px] font-medium outline-none focus:ring-4 focus:ring-[#b48222]/5 focus:border-[#b48222]/40 transition-all resize-none"
                    />
                    <button 
                      onClick={() => handleSubmit(section._id)}
                      disabled={!inputText.trim()}
                      className="bg-[#1a3a32] text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 rounded-2xl hover:bg-[#112621] disabled:opacity-50 transition-all shadow-xl shadow-emerald-900/10 h-fit py-4"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManualPage;