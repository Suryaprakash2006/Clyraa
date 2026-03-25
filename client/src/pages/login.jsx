import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border-t border-white/10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-fuchsia inline-block mb-2">Welcome Back</h1>
          <p className="text-slate-400">Enter your credentials to access Clyraa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-8"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400">
          Don't have an account? <Link to="/register" className="text-brand-cyan hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
