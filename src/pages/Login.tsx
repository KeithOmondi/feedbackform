import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { login, clearError } from "../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [pj, setPj] = useState("");

  // 1. Clear errors when component mounts to prevent showing old error messages
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 2. ✅ ROLE-AWARE REDIRECT LOGIC
  useEffect(() => {
    if (user) {
      // Check if there was an intended destination from ProtectedRoute
      const intendedPath = (location.state as any)?.from?.pathname;

      if (intendedPath) {
        // If they were trying to go somewhere specific, send them there
        navigate(intendedPath, { replace: true });
      } else {
        // Default branching based on the verified role
        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/welcome", { replace: true });
        }
      }
    }
  }, [user, navigate, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pj.trim()) {
      dispatch(login({ pj: pj.trim() }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3eee1]">
      {/* INSTITUTIONAL HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-[3px] border-[#d9b929] shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src="/JOB_LOGO.jpg" 
            alt="High Court Logo" 
            className="h-10 w-10 sm:h-14 sm:w-14 object-contain" 
          />
          <div>
            <h1 className="text-[#25443c] font-serif text-base sm:text-xl leading-tight font-bold uppercase tracking-tight">
              High Court of Kenya
            </h1>
            <p className="text-[#d9b929] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] leading-none mt-1">
              Draft Disciplinary Procedures Manual <span className="hidden md:inline">— Review Portal</span>
            </p>
          </div>
        </div>
      </header>

      {/* LOGIN CARD */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[420px] w-full bg-white shadow-sm border border-slate-200/60 rounded-sm overflow-hidden flex flex-col items-center pt-12 pb-8 px-10 relative">
          
          {/* Decorative Seal / Logo */}
          <div className="w-20 h-20 bg-[#fff] rounded-full mb-8 shadow-inner flex items-center justify-center border border-slate-100">
            <img 
              src="/JOB_LOGO.jpg" 
              alt="Logo" 
              className="h-12 w-12 object-contain" 
            />
          </div>

          <h2 className="font-serif text-[2.5rem] text-[#12110b] mb-2 text-center leading-tight">Judges' Portal</h2>
          <p className="text-center text-[#666] text-[13px] leading-relaxed mb-10 px-4">
            Authorized Personnel only. Please enter your PJ Number to access the review system.
          </p>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#444] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#d9b929]" /> PJ Number
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="Enter your PJ number"
                value={pj}
                onChange={(e) => setPj(e.target.value)}
                className="w-full bg-[#f9f7f0] border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#25443c] transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-tight">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pj.trim()}
              className="w-full bg-[#12110b] text-white py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-black transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Access Portal 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 text-center space-y-2">
            
            <p className="text-[11px] font-medium text-slate-500 leading-snug">
              Access is restructed to serving High Court Judges <br /> 
              <span className="text-[11px] font-medium text-slate-500 leading-snug cursor-help">
                Contact the Office of the Registrar High Court fo assistance
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;