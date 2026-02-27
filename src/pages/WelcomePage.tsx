import { useAppSelector } from "../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-[#f3eee1]">
      {/* Institutional Header */}
      <header className="bg-[#12110b] px-8 py-4 flex items-center justify-between border-b-[3px] border-[#b48222]">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#b48222] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#12110b]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v2c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-serif text-lg leading-tight tracking-wide">OFFICE OF THE REGISTRAR HIGH COURT</h1>
            <p className="text-[#b48222] text-[9px] font-bold uppercase tracking-[0.1em]">
              Draft Disciplinary Procedures Manual — High Court Review Portal
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[#b48222] text-[10px] font-bold uppercase tracking-wider">
            Hon. Justice {user?.id || "Roseline Korir"}
          </span>
          <button className="text-white border border-white/20 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-white/10 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* Invitation Content */}
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-3xl w-full bg-white shadow-sm border border-slate-200/60 rounded-sm p-12 relative">
          
          {/* Top Label */}
          <div className="flex flex-col gap-1 mb-6">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
               Office of the Principal Judge • Judiciary of Kenya
             </span>
             <div className="flex mt-2">
                <span className="bg-[#12110b] text-[#b48222] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#b48222] rounded-full"></span>
                  Hon. Justice {user?.id || "Roseline Korir"}
                </span>
             </div>
          </div>

          <h2 className="font-serif text-3xl text-[#12110b] mb-6 leading-snug">
            Invitation to Review: Draft Judicial Service <br /> Disciplinary Procedures Manual
          </h2>

          <div className="space-y-6 text-[#444] text-[14px] leading-relaxed">
            <p>Greetings from the Office of the Principal Judge.</p>
            <p>
              The Judicial Service Commission, in its meeting of <strong>7th January 2026</strong>, directed the circulation of the draft 
              Judicial Service Disciplinary Procedures Manual for review.
            </p>
            <p>
              You are invited to examine the draft and submit your written comments by <strong>6th March 2026</strong>. Please focus on:
            </p>
          </div>

          {/* Areas of Focus Box */}
          <div className="mt-8 bg-[#f9f7f0] border border-[#e8e4d8] rounded-md p-8">
            <h4 className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-6">Areas of Focus</h4>
            <ul className="space-y-5">
              {[
                { label: "Provisions to amend, clarify, retain or delete", desc: "indicate the action you recommend for each provision." },
                { label: "Rationale or justification for each proposal", desc: "provide the reasoning behind your recommended action." },
                { label: "Relevant references", desc: "constitutional provisions, statutes including the Judicial Service Act, regulations, and jurisprudence." },
                { label: "Clear recommendations", desc: "including suggested wording where appropriate." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#b48222] text-[#12110b] rounded-full flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] text-[#333]">
                    <span className="font-bold">{item.label}</span> — {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Deadline Info */}
          <div className="mt-6 bg-[#fffde7] border border-[#fff59d] rounded-md p-4 flex items-center gap-3">
             <span className="text-xl">🗓️</span>
             <p className="text-[12px] text-[#856404] font-medium">
               Submission deadline: <span className="font-bold">6th March 2026</span>. Your responses are saved as you go.
             </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate("/manuals")}
          className="mt-8 bg-[#b48222] text-[#12110b] px-12 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#c59330] transition-all shadow-lg flex items-center gap-3 group"
        >
          Begin Reviewing Manual Sections
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </main>
    </div>
  );
};

export default WelcomePage;