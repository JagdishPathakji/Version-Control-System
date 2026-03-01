import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Code, GitBranch, Users, Zap, Copy, Check,
  Terminal, History, Search, RefreshCw, Layers, ShieldCheck,
  Database, Globe
} from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function LandingPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const jvcsCommands = [
    { cmd: "jvcs begin", icon: <ShieldCheck className="w-5 h-5" />, desc: "Authentication: Login or Signup to sync with the cloud Space.", color: "text-[#00d9ff]" },
    { cmd: "jvcs init", icon: <Database className="w-5 h-5" />, desc: "Initialize: Create a new local repository metadata in current folder.", color: "text-[#ff006e]" },
    { cmd: "jvcs add", icon: <Layers className="w-5 h-5" />, desc: "Stage: Prepare files or entire folders for the next commit.", color: "text-[#ffbe0b]" },
    { cmd: "jvcs commit", icon: <Zap className="w-5 h-5" />, desc: "Snapshot: Permanently save staged changes with a message.", color: "text-[#00d9ff]" },
    { cmd: "jvcs unstage", icon: <Layers className="w-5 h-5" />, desc: "Unstage: Safely remove files from the staging area before committing.", color: "text-[#ff006e]" },
    { cmd: "jvcs status", icon: <Terminal className="w-5 h-5" />, desc: "Observer: Check which files are modified, staged, or untracked.", color: "text-[#ffbe0b]" },
    { cmd: "jvcs log", icon: <History className="w-5 h-5" />, desc: "History: Browse through the complete timeline of your commits.", color: "text-[#00d9ff]" },
    { cmd: "jvcs diff", icon: <Search className="w-5 h-5" />, desc: "Compare: Analyze line-by-line differences between states.", color: "text-[#ff006e]" },
    { cmd: "jvcs push", icon: <Globe className="w-5 h-5" />, desc: "Sync: Upload local commits to your remote repository on the server.", color: "text-[#ffbe0b]" },
    { cmd: "jvcs revert", icon: <History className="w-5 h-5" />, desc: "Rollback: Restore your working directory to a previous commit state.", color: "text-[#00d9ff]" },
    { cmd: "jvcs clone", icon: <RefreshCw className="w-5 h-5" />, desc: "Download: Pull an existing repository from the server to local.", color: "text-[#ff006e]" },
    { cmd: "jvcs save-version", icon: <RefreshCw className="w-5 h-5" />, desc: "Auto-Pilot: Combines init, add, commit, and push in one command.", color: "text-[#ffbe0b]" }
  ];

  return (
    <div className="w-screen min-h-screen bg-[#0d0221] text-gray-200 overflow-x-hidden selection:bg-[#ff006e]/30 selection:text-[#00d9ff]">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff006e]/20 via-transparent to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#ff006e]/30 bg-[#0d0221]/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="p-1 px-3 bg-gradient-to-br from-[#ff006e] to-[#00d9ff] rounded-none border border-white/20">
              <span className="text-xl font-black text-white italic">J</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent tracking-tighter">
              JVCS SPACE
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-bold text-[#00d9ff] hover:bg-[#00d9ff]/10 rounded-none border border-transparent hover:border-[#00d9ff]/30 transition-all"
            >
              LOGIN
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white text-sm font-bold rounded-none hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] transition-all"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 border border-[#ffbe0b]/50 bg-[#ffbe0b]/5 text-[#ffbe0b] text-[10px] font-black tracking-[0.3em] uppercase">
              Production Ready v2.0
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-none">
              <span className="text-white">TRACK YOUR</span>
              <br />
              <span className="bg-gradient-to-r from-[#ff006e] via-[#ffbe0b] to-[#00d9ff] bg-clip-text text-transparent italic">
                CODE HISTORY.
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-xl">
              A professional-grade version control system for local development. Track changes, manage repositories, and sync to the cloud with a minimal terminal footprint.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-4 bg-white text-[#0d0221] font-black rounded-none hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                DEPLOY NOW
              </button>
              <button
                onClick={() => scrollToSection("commands")}
                className="px-10 py-4 border-2 border-[#00d9ff]/50 text-[#00d9ff] font-black rounded-none hover:bg-[#00d9ff]/10 transition-all"
              >
                VIEW CMDS
              </button>
            </div>
          </div>

          <div className="bg-[#0a0b0f] border border-[#ff006e]/30 rounded-none p-2 shadow-[20px_20px_0px_rgba(255,0,110,0.1)]">
            <div className="bg-white/5 p-4 flex gap-2 border-b border-white/10">
              <div className="w-2 h-2 bg-red-500"></div>
              <div className="w-2 h-2 bg-yellow-500"></div>
              <div className="w-2 h-2 bg-green-500"></div>
            </div>
            <div className="p-8 font-mono text-sm overflow-x-auto min-h-[300px]">
              <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
{`$ jvcs status
 M frontend/App.tsx
 A backend/server.js

$ jvcs save-version
 [+] Checking for .jvcsignore... Found.
 [+] Staging changes... Done.
 [+] Committing: "Feature updated"...
 [+] Syncing to Space... Success.

$ jvcs log
 commit: a72b38 (Current)
 commit: 9f1e02 (2 hours ago)`}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </section>

      {/* Commands Grid */}
      <section id="commands" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 bg-white/[0.01]">
        <h2 className="text-3xl font-black text-white mb-16 tracking-tighter">
          THE <span className="text-[#00d9ff]">COMMAND</span> SUITE
        </h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-white/10 border border-white/10">
          {jvcsCommands.map((command, idx) => (
            <div 
              key={idx} 
              className="bg-[#0d0221] p-8 hover:bg-white/[0.03] transition-all group border border-transparent hover:border-[#00d9ff]/30"
            >
              <div className={`mb-4 ${command.color} group-hover:scale-110 transition-transform`}>
                {command.icon}
              </div>
              <h3 className="text-md font-black text-white mb-2 tracking-tight group-hover:text-[#00d9ff]">
                {command.cmd}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-wider">
                {command.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-b border-white/5">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="w-12 h-1 bg-[#ff006e]"></div>
            <h3 className="text-2xl font-black text-white">LOCAL FIRST</h3>
            <p className="text-gray-400 font-medium">Track versions even when you are offline. All snapshots are stored locally in your .jvcs directory.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-1 bg-[#00d9ff]"></div>
            <h3 className="text-2xl font-black text-white">SPACE SYNC</h3>
            <p className="text-gray-400 font-medium">One push moves your entire repository history to your remote dashboard. Access your code from anywhere.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-1 bg-[#ffbe0b]"></div>
            <h3 className="text-2xl font-black text-white">AUTO PIPELINE</h3>
            <p className="text-gray-400 font-medium">Use the save-version command to automate your deployment cycle. Perfect for rapid prototyping.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="bg-gradient-to-r from-[#ff006e]/10 to-[#00d9ff]/10 border border-white/10 p-16 text-center">
          <h2 className="text-5xl font-black text-white mb-8">READY TO SNAPSHOT?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-12 py-4 bg-[#ff006e] text-white font-black rounded-none hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] transition-all"
            >
              CREATE REPOS
            </button>
            <button
              onClick={() => navigate("/documentation")}
              className="px-12 py-4 border border-white/20 text-white font-black rounded-none hover:bg-white/10 transition-all"
            >
              READ DOCS
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0b0f] border-t border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6 font-black text-xl italic text-white">
              JVCS SPACE
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-loose">
              Advanced version control engine for elite developers. Built for performance.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="text-xs text-gray-500 space-y-2 font-bold uppercase">
              <li><button onClick={() => scrollToSection("commands")} className="hover:text-white transition-colors">All Commands</button></li>
              <li><button onClick={() => navigate("/documentation")} className="hover:text-white transition-colors">Documentation</button></li>
              <li><button onClick={() => navigate("/login")} className="hover:text-white transition-colors">User Login</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Connect</h4>
            <ul className="text-xs text-gray-500 space-y-2 font-bold uppercase">
              <li><a href="https://github.com/JagdishPathakji" className="hover:text-white transition-colors tracking-[0.2em]">Github</a></li>
              <li><a href="#" className="hover:text-white transition-colors tracking-[0.2em]">LinkedIn</a></li>
            </ul>
          </div>
          <div className="text-right">
             <p className="text-[#ff006e] font-black text-2xl italic tracking-tighter hover:text-white transition-colors cursor-default">JAGDISH PATHAKJI</p>
             <p className="text-[10px] text-gray-700 font-black tracking-widest mt-2 uppercase">Core Architect @ 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
