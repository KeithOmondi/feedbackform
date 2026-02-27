import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
  fetchManuals,
  editManual,
  removeManual,
  postEntry,
} from "../features/manual/manualSlice";
import { type IManual, type EntryType } from "../features/manual/manualService";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { manuals, loading } = useAppSelector((state) => state.manual);
  const { user } = useAppSelector((state) => state.auth);

  // Administrative State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<Partial<IManual> | null>(null);

  // Unified Submission State - Store text by sectionId-type key
  const [entryTexts, setEntryTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchManuals());
  }, [dispatch]);

  const handleUpdate = () => {
    if (!editingSectionId || !editingSectionData) return;
    dispatch(editManual({ id: editingSectionId, data: editingSectionData }));
    setEditingSectionId(null);
    setEditingSectionData(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to strike this section from the record?")) {
      dispatch(removeManual(id));
    }
  };

  const handleEntrySubmit = (sectionId: string, rawType: string) => {
    const inputKey = `${sectionId}-${rawType}`;
    const text = entryTexts[inputKey];
    
    if (!user || !text?.trim()) return;

    // Singularize type: "comments" -> "comment"
    const singularType = rawType.slice(0, -1) as EntryType;

    dispatch(postEntry({ 
      sectionId, 
      userId: user.id, 
      content: text.trim(), // Match updated backend key
      type: singularType 
    }));
    
    // Reset specific text field
    setEntryTexts((prev) => ({ ...prev, [inputKey]: "" }));
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
      {/* Dashboard Header */}
      <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-[#1a3a32] uppercase tracking-tighter">Admin Registry Management</h1>
          <p className="text-[10px] font-bold text-[#b48222] uppercase tracking-[0.2em] mt-1">Full Oversight & Document Control</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase block">Active Administrator</span>
          <span className="text-xs font-bold text-[#1a3a32]">{user?.id || "N/A"}</span>
        </div>
      </div>

      {loading && manuals.length === 0 ? (
        <div className="text-center py-20 text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing Registry...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {manuals.map((section: IManual) => (
            <div key={section._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
              
              {/* SECTION HEADER / EDIT MODE */}
              <div className={`px-8 py-5 flex items-center justify-between ${editingSectionId === section._id ? 'bg-slate-50' : 'bg-[#1a3a32]'}`}>
                {editingSectionId === section._id ? (
                  <div className="flex gap-3 w-full items-center">
                    <input
                      className="bg-white border border-slate-200 px-3 py-1 rounded text-xs font-bold w-24"
                      value={editingSectionData?.code || ""}
                      onChange={(e) => setEditingSectionData({ ...editingSectionData, code: e.target.value })}
                    />
                    <input
                      className="bg-white border border-slate-200 px-3 py-1 rounded text-xs font-bold flex-1"
                      value={editingSectionData?.title || ""}
                      onChange={(e) => setEditingSectionData({ ...editingSectionData, title: e.target.value })}
                    />
                    <button onClick={handleUpdate} className="bg-[#b48222] text-white px-4 py-1 rounded text-[10px] font-black uppercase">Save</button>
                    <button onClick={() => setEditingSectionId(null)} className="text-slate-400 text-[10px] font-black uppercase">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="bg-[#b48222] text-white text-[10px] font-black px-3 py-1 rounded tracking-widest">{section.code}</span>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">{section.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingSectionId(section._id); setEditingSectionData(section); }}
                        className="text-[9px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
                      >
                        Modify
                      </button>
                      <button 
                        onClick={() => handleDelete(section._id)}
                        className="text-[9px] font-black text-red-400/80 hover:text-red-400 uppercase tracking-widest transition-all"
                      >
                        Strike
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* DATA GRIDS */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {(["comments", "amendments", "justifications"] as const).map((type) => {
                  const inputKey = `${section._id}-${type}`;
                  return (
                    <div key={type} className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#1a3a32] uppercase tracking-[0.15em] border-b border-slate-100 pb-2">{type}</h4>
                      
                      {/* List entries */}
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {section[type]?.length ? (
                          section[type].map((item: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                              <p className="text-[11px] text-slate-600 leading-snug">
                                "{item.comment || item.proposedChange || item.justification}"
                              </p>
                              <p className="text-[8px] font-bold text-slate-300 mt-2 uppercase tracking-tighter">
                                {new Date(item.createdAt).toLocaleDateString()} • ID: {item.userId?.toString().slice(-4) || "????"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[9px] text-slate-300 italic">No entries recorded.</p>
                        )}
                      </div>

                      {/* Admin quick-add for this section */}
                      <div className="pt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder={`Add ${type.slice(0, -1)}...`}
                          className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] flex-1 outline-none focus:border-[#b48222] transition-all"
                          value={entryTexts[inputKey] || ""}
                          onChange={(e) => setEntryTexts({ ...entryTexts, [inputKey]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleEntrySubmit(section._id, type)}
                        />
                        <button 
                          onClick={() => handleEntrySubmit(section._id, type)}
                          className="bg-[#1a3a32] text-white p-2 rounded-lg hover:bg-black transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;