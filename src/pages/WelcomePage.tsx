import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import {  Calendar } from "lucide-react"; // Using lucide for clean icons

const WelcomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-[#f3eee1] font-sans">
      
      {/* Institutional Header */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 border-b-[3px] border-[#d9b929] shadow-sm sticky top-0 z-50">
        <img 
          src="/JOB_LOGO.jpg" 
          alt="High Court of Kenya Logo" 
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
        />
        
        <div className="flex-1">
          <h1 className="text-[#25443c] font-serif text-sm sm:text-lg leading-tight font-bold uppercase tracking-tight">
            High Court of Kenya
          </h1>
          <p className="text-[#d9b929] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em]">
            Judicial Service Review Portal
          </p>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <p className="text-[#25443c] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden xs:block">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : "Roseline Korir"}
            </p>
            
            <button 
              onClick={() => dispatch(logout())}
              className="text-[#d9b929] hover:bg-[#d9b929] hover:text-white text-[9px] sm:text-[10px] font-black uppercase border-2 border-[#d9b929] px-3 py-1 rounded-sm transition-all active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-3xl w-full bg-white shadow-sm border border-slate-200/60 rounded-sm p-6 sm:p-12 relative overflow-hidden">
          
          {/* Subtle Background Mark */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <img src="/JOB_LOGO.jpg" alt="" className="w-32 h-32" />
          </div>

          {/* Top Label & Badge */}
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Office of the Principal Judge • Judiciary of Kenya
            </span>
            <div className="flex mt-3">
              <span className="bg-[#12110b] text-[#b48222] px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 bg-[#b48222] rounded-full animate-pulse"></span>
                Hon. Justice {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : "Roseline Korir"}
              </span>
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#12110b] mb-8 leading-snug border-l-4 border-[#b48222] pl-6">
            Invitation to Review: Draft Judicial Service <br className="hidden sm:block" /> Disciplinary Procedures Manual
          </h2>

          <div className="space-y-6 text-[#444] text-[15px] leading-relaxed font-serif italic">
            <p>Greetings from the Office of the Principal Judge.</p>
            <p>
              The Judicial Service Commission, in its meeting of <strong className="text-[#12110b] not-italic">7th January 2026</strong>, directed the circulation of the draft 
              Judicial Service Disciplinary Procedures Manual for review by the High Court.
            </p>
            <p className="not-italic text-slate-600">
              You are invited to examine the draft and submit your professional recommendations by <strong className="text-[#b48222]">6th March 2026</strong>. 
            </p>
          </div>

          {/* Areas of Focus Box */}
          <div className="mt-10 bg-[#f9f7f0] border border-[#e8e4d8] rounded-sm p-6 sm:p-8">
            <h4 className="text-[11px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-[#b48222]"></span> Areas of Focus
            </h4>
            <ul className="space-y-6">
              {[
                { label: "Action Recommendation", desc: "Provisions to amend, clarify, retain or delete." },
                { label: "Rationale / Justification", desc: "The legal reasoning behind your recommended action." },
                { label: "Legal References", desc: "Citations of the Constitution, Statutes, or Jurisprudence." },
                { label: "Drafting Wording", desc: "Clear suggestions for the final text of the manual." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#25443c] text-[#d9b929] rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-[14px] text-[#333]">
                    <span className="font-bold text-[#12110b]">{item.label}</span> — <span className="text-slate-600 italic">{item.desc}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Deadline Info */}
          <div className="mt-8 bg-[#fffde7] border border-[#fff59d] rounded-sm p-4 flex items-center gap-4">
             <div className="bg-[#facc15] p-2 rounded-full">
               <Calendar size={18} className="text-[#856404]" />
             </div>
             <p className="text-[13px] text-[#856404] font-medium leading-tight">
               Final submission deadline: <span className="font-bold underline">6th March 2026</span>. <br className="hidden sm:block" /> 
               Progress is auto-saved as you complete each section.
             </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate("/manuals")}
          className="mt-10 bg-[#25443c] text-[#d9b929] px-10 py-5 rounded-sm font-bold text-sm uppercase tracking-[0.2em] hover:bg-[#1a312b] transition-all shadow-xl flex items-center gap-4 group active:scale-95"
        >
          Begin Manual Review
          <span className="group-hover:translate-x-2 transition-transform">→</span>
        </button>
        
        <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Judicial service commission of kenya © 2026
        </p>
      </main>
    </div>
  );
};

export default WelcomePage;