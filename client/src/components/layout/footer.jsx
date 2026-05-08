import {
  Globe,
  Mail,
  Heart,
  ArrowUpRight,
  Sparkles,
  Code,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative mt-auto overflow-hidden bg-white border-t border-gray-100">

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 border-b border-gray-100">

          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-cyan/20 group-hover:shadow-brand-cyan/30 transition-all">
                C
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Clyraa
                </h2>
                <p className="text-xs font-bold text-brand-cyan uppercase tracking-[0.18em]">
                  Travel • Community • Connection
                </p>
              </div>
            </Link>

            <p className="text-gray-500 leading-relaxed text-sm max-w-sm mb-6">
              Clyraa is a modern social travel ecosystem built for explorers,
              communities, and digital collaboration. Designed to simplify
              group travel, real-time interaction, and global connections —
              all within one unified platform.
            </p>

            <div className="flex items-start gap-2.5 text-sm text-gray-600 font-medium bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 max-w-sm">
              <Sparkles className="w-4 h-4 text-brand-cyan mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                Built with ambition, curiosity, and late-night coding sessions.
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <p className="text-gray-900 font-black text-xs uppercase tracking-[0.2em] mb-6">
              Platform
            </p>

            <div className="space-y-1">
              {[
                { name: "Communities", path: "/communities" },
                { name: "Groups", path: "/groups" },
                { name: "Global Feed", path: "/feed" },
                { name: "Profile", path: "/profile" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200"
                >
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                    {item.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-brand-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Developer Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-4 h-4 text-brand-purple" />
              <p className="text-gray-900 font-black text-xs uppercase tracking-[0.2em]">
                Developer
              </p>
            </div>

            <div className="border border-gray-100 rounded-[2rem] p-6 bg-gray-50 shadow-sm">

              <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                Ullamparthi Surya Prakash
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Data Science student and full-stack developer passionate about
                building scalable community-driven platforms and meaningful
                digital experiences.
              </p>

              <div className="space-y-3">

                <a
                  href="https://github.com/Suryaprakash2006"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-brand-cyan/30 group-hover:shadow-md transition-all shrink-0">
                    <Globe className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900">GitHub</p>
                    <p className="text-xs text-gray-400">github.com/Suryaprakash2006</p>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/surya-prakash-ullamparthi-9787092b8/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-brand-purple/30 group-hover:shadow-md transition-all shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900">LinkedIn</p>
                    <p className="text-xs text-gray-400">Connect professionally</p>
                  </div>
                </a>

                <a
                  href="mailto:ullamparthisuryaprakash@gmail.com"
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-brand-cyan/30 group-hover:shadow-md transition-all shrink-0">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900">Email</p>
                    <p className="text-xs text-gray-400 break-all">ullamparthisuryaprakash@gmail.com</p>
                  </div>
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-medium text-center md:text-left">
            © {new Date().getFullYear()} Clyraa. Designed & developed by Ullamparthi Surya Prakash.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            Crafted with <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" /> for builders, travelers, and communities.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;