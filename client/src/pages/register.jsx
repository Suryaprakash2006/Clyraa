import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight, Plane, Globe2, Users, Hash } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, phone, password);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 rounded-2xl">

      {/* Left form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-cyan flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-800">Clyraa</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Join Clyraa</h1>
            <p className="text-gray-500 font-medium">Create your free account and start exploring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all shadow-sm"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all shadow-sm"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all shadow-sm"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-cyan/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-cyan via-blue-500 to-brand-purple items-center justify-center p-16 rounded-r-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-[80px]"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-white blur-[100px]"></div>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">Clyraa</span>
          </div>
          <h2 className="text-4xl font-black leading-tight mb-6">
            The world is waiting. Are you?
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Create your free account and tap into a global network of travelers, communities, and adventures.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Globe2, label: 'Global travel feed' },
              { icon: Users, label: 'Real-time group chat' },
              { icon: Hash, label: 'Niche communities' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;