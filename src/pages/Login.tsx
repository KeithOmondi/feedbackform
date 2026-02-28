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
     {/* HEADER */}
        <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-[3px] border-[#d9b929] shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Logo */}
            <img 
              src="/JOB_LOGO.jpg" 
              alt="High Court of Kenya Logo" 
              className="h-10 w-10 sm:h-14 sm:w-14 object-contain" 
            />
            
            {/* Title Group */}
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

      {/* 2. Main Login Section */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[420px] w-full bg-white shadow-sm border border-slate-200/60 rounded-sm overflow-hidden flex flex-col items-center pt-12 pb-8 px-10">
          
          <div className="w-20 h-20 bg-[#fff] rounded-full mb-8 shadow-inner flex items-center justify-center">
              <img 
              src="/JOB_LOGO.jpg" 
              alt="High Court of Kenya Logo" 
              className="h-10 w-10 sm:h-14 sm:w-14 object-contain" 
            />
          </div>

          <h2 className="font-serif text-[2.5rem] text-[#12110b] mb-2">Judges' Portal</h2>
          <p className="text-center text-[#666] text-[13px] leading-relaxed mb-10 px-4">
            Enter your PJ Number to access the Disciplinary Manual Review System
          </p>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#444] uppercase tracking-wider">
                PJ Number
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
               Contact the Office of the Registrar High Court  for assistance
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;