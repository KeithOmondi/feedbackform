import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { login } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [pj, setPj] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ pj }));
  };

  // ✅ REDIRECT LOGIC: Take the user to the Welcome Page upon successful login
  useEffect(() => {
    if (user) {
      navigate("/welcome"); // This matches the route for your new Invitation page
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f3eee1]">
      {/* 1. Black Institutional Header */}
      <header className="bg-[#12110b] px-6 py-4 flex items-center gap-4 border-b-[3px] border-[#b48222]">
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
      </header>

      {/* 2. Main Login Section */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[420px] w-full bg-white shadow-sm border border-slate-200/60 rounded-sm overflow-hidden flex flex-col items-center pt-12 pb-8 px-10">
          
          <div className="w-20 h-20 bg-[#12110b] rounded-full mb-8 shadow-inner flex items-center justify-center">
             <div className="w-16 h-16 border border-[#b48222]/30 rounded-full" />
          </div>

          <h2 className="font-serif text-[2.5rem] text-[#12110b] mb-2">Judges' Portal</h2>
          <p className="text-center text-[#666] text-[13px] leading-relaxed mb-10 px-4">
            Enter your PJ Service Number to access the Disciplinary Manual Review System
          </p>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#444] uppercase tracking-wider">
                PJ Service Number
              </label>
              <input
                type="text"
                required
                placeholder="Enter your PJ number"
                value={pj}
                onChange={(e) => setPj(e.target.value)}
                className="w-full bg-[#f9f7f0] border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#b48222] transition-colors placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3">
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-tight text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pj.trim()}
              className="w-full bg-[#12110b] text-white py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-black transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Verifying..." : (
                <>
                  Access Portal 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-1">
            <p className="text-[11px] font-medium text-slate-500">
              Access is restricted to serving High Court Judges.
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              Contact the Office of the Principal Judge for assistance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;