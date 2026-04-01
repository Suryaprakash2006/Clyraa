// import { Github, Twitter, Linkedin, MapPin, Mail, Phone, Heart } from "lucide-react";
import { MapPin, Mail, Phone, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative w-screen -ml-[50vw] left-1/2 bg-dark-bg border-t border-dark-border mt-auto overflow-hidden z-10 pt-16 mt-24">
      
      {/* Background Decorators */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
          
          {/* Brand & Intro */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-brand-cyan/20 transition-all duration-300">
                C
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-white tracking-tight">Clyraa</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The ultimate connected ecosystem for digital nomads, communities, and modern group travel coordination. Stop managing chaos, start exploring.
            </p>
            {/* <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-slate-400 hover:text-brand-purple hover:border-brand-purple/50 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-slate-400 hover:border-white transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/communities" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Explore Communities</Link></li>
              <li><Link to="/groups" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Group Chats</Link></li>
              <li><Link to="/feed" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Social Feed</Link></li>
              <li><Link to="/profile" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Your Profile</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Community Standards</a></li>
              <li><a href="#" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 text-sm hover:text-brand-cyan transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin className="w-5 h-5 text-brand-cyan shrink-0" />
                <span>123 Nomad Valley,<br/>San Francisco, CA 94103</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-5 h-5 text-brand-purple shrink-0" />
                <span>hello@clyraa.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="w-5 h-5 text-green-400 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-dark-border py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Clyraa inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Build with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1" /> for travelers worldwide.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
