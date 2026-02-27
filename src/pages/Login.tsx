import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { login } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [pj, setPj] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ pj, password }));
  };

  useEffect(() => {
    if (user) {
      navigate("/manuals");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60">
        
        {/* Institutional Branding */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#1a3a32] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/20">
            <svg className="w-6 h-6 text-[#b48222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1a3a32] uppercase tracking-tighter">Login</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2"></p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-[#1a3a32] uppercase tracking-widest ml-1 mb-2 block">Personnel ID (PJ)</label>
              <input
                type="text"
                required
                placeholder="Enter PJ Number"
                value={pj}
                onChange={(e) => setPj(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#b48222]/5 focus:border-[#b48222]/40 transition-all text-sm font-medium"
              />
            </div>
            
            <div>
              <label className="text-[9px] font-black text-[#1a3a32] uppercase tracking-widest ml-1 mb-2 block">Security Credential</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#b48222]/5 focus:border-[#b48222]/40 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl text-white bg-[#1a3a32] hover:bg-[#112621] focus:outline-none focus:ring-4 focus:ring-emerald-900/10 transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/10"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Authorize Session"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
           
            <span className="text-[#b48222]">Kindly login to access the portal</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;