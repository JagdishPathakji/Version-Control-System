import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code, GitBranch, Zap, Copy, Check, BookOpen, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";


export default function Documentation({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("installation");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  const sections = [
    { id: "installation", label: "Installation", icon: "⚙️" },
    { id: "commands", label: "Commands", icon: "🎯" },
    { id: "workflow", label: "Workflow", icon: "📊" },
    { id: "api", label: "API Reference", icon: "🔌" },
    { id: "faq", label: "FAQ", icon: "❓" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#ff006e]/20 bg-[#0d0221]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#ff006e]/10 rounded-lg transition-colors hidden sm:block"
            >
              <ArrowLeft className="w-5 h-5 text-[#ff006e]" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#00d9ff]" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                Documentation
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-[#ff006e]/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 ${
              sidebarOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-24 bg-gradient-to-b from-[#1a1629]/95 to-[#0d0221]/95 backdrop-blur-xl border border-[#ff006e]/40 rounded-2xl p-6 shadow-2xl shadow-[#ff006e]/5">
              <h3 className="text-sm font-bold text-[#ff006e] uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></span>
                Sections
              </h3>
              <nav className="space-y-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white shadow-lg shadow-[#ff006e]/30 scale-105"
                        : "text-gray-400 hover:bg-[#ff006e]/15 hover:text-[#ff006e] hover:translate-x-1"
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium text-sm">{section.label}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-[#ff006e]/20 space-y-3">
                <div className="bg-[#ff006e]/10 backdrop-blur rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#ff006e] uppercase">Total Commands</p>
                  <p className="text-2xl font-bold text-[#ff006e]">10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-12">
            {/* Installation Section */}
            <section id="installation" className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Installation</h2>
              </div>

              <div className="space-y-6">
                {/* Global Installation */}
                <div className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur-lg border border-[#ff006e]/40 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(255,0,110,0.15)] transition-all duration-300">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#ff006e] to-[#00d9ff] rounded-xl flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#ff006e]">Global Installation</h3>
                      <p className="text-sm text-gray-400 mt-1">Use JVCS anywhere on your system</p>
                    </div>
                  </div>
                  <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-xl p-5 overflow-x-auto mt-5">
                    <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
                      {`npm install -g jvcs`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyToClipboard("npm install -g jvcs", "install-global")}
                      className="absolute top-4 right-4 p-2.5 hover:bg-[#ff006e]/20 rounded-lg transition-all hover:scale-110"
                    >
                      {copied === "install-global" ? (
                        <Check className="w-5 h-5 text-[#ffbe0b]" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400 hover:text-[#ff006e]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Local Installation */}
                <div className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur-lg border border-[#00d9ff]/40 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(0,217,255,0.15)] transition-all duration-300">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00d9ff] to-[#ff006e] rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#00d9ff]">Local Installation</h3>
                      <p className="text-sm text-gray-400 mt-1">Use within a specific project</p>
                    </div>
                  </div>
                  <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-xl p-5 overflow-x-auto mt-5">
                    <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
                      {`npm install jvcs`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyToClipboard("npm install jvcs", "install-local")}
                      className="absolute top-4 right-4 p-2.5 hover:bg-[#00d9ff]/20 rounded-lg transition-all hover:scale-110"
                    >
                      {copied === "install-local" ? (
                        <Check className="w-5 h-5 text-[#ffbe0b]" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400 hover:text-[#00d9ff]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-gradient-to-r from-[#ffbe0b]/20 via-[#ff006e]/10 to-transparent border border-[#ffbe0b]/40 rounded-xl p-6 flex gap-4">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="text-lg font-bold text-[#ffbe0b]">Local Installation Note</p>
                    <p className="text-gray-300 mt-2">
                      When using local installation, prefix all commands with <span className="font-mono bg-[#1a1629] px-3 py-1 rounded text-[#00d9ff] font-semibold">npx</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2 font-mono">Example: <span className="text-[#ffbe0b]">npx jvcs init my-project</span></p>
                  </div>
                </div>
              </div>
            </section>

            {/* Commands Section */}
            <section id="commands" className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Commands</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { cmd: "jvcs begin", desc: "Initialize and authenticate", icon: "🔐", color: "from-[#ff006e] to-[#00d9ff]" },
                  { cmd: "jvcs init", desc: "Create a new repository", icon: "📦", color: "from-[#00d9ff] to-[#ffbe0b]" },
                  { cmd: "jvcs add", desc: "Stage files for commit", icon: "➕", color: "from-[#ffbe0b] to-[#ff006e]" },
                  { cmd: "jvcs commit", desc: "Create a commit", icon: "💾", color: "from-[#ff006e] to-[#ffbe0b]" },
                  { cmd: "jvcs push", desc: "Push to remote", icon: "📤", color: "from-[#00d9ff] to-[#ff006e]" },
                  { cmd: "jvcs status", desc: "Check file status", icon: "📊", color: "from-[#ffbe0b] to-[#00d9ff]" },
                  { cmd: "jvcs log", desc: "View commit history", icon: "📜", color: "from-[#ff006e] to-[#ffbe0b]" },
                  { cmd: "jvcs unstage", desc: "Remove from staging", icon: "➖", color: "from-[#00d9ff] to-[#ff006e]" },
                  { cmd: "jvcs clone", desc: "Clone a repository", icon: "🔀", color: "from-[#ffbe0b] to-[#ff006e]" },
                  { cmd: "jvcs revert", desc: "Undo commits", icon: "↩️", color: "from-[#ff006e] to-[#00d9ff]" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur border border-gray-700/30 hover:border-[#ff006e]/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,110,0.1)] hover:-translate-y-1"
                    onClick={() => copyToClipboard(item.cmd, `cmd-${idx}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono text-sm font-bold text-[#00d9ff] group-hover:text-[#ff006e] transition-colors break-all">
                          {item.cmd}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2">{item.desc}</p>
                      </div>
                      <Copy className="w-5 h-5 text-gray-500 group-hover:text-[#ffbe0b] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Workflow Section */}
            <section id="workflow" className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Basic Workflow</h2>
              </div>

              <div className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur-lg border border-[#ff006e]/40 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(255,0,110,0.15)] transition-all">
                <p className="text-gray-300 mb-6 text-lg">A typical JVCS workflow:</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-xl p-6 overflow-x-auto">
                  <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
                    {`# 1. Authenticate
jvcs begin

# 2. Create a new repository
jvcs init repo-name

# 3. Check status
jvcs status

# 4. Stage changes
jvcs add .

# 5. Commit changes
jvcs commit "Add app.js"

# 6. Push to remote
jvcs push

# 7. View history
jvcs log

# Get help with the --help flag:
jvcs --help
jvcs init --help
jvcs commit --help
`
}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => copyToClipboard("jvcs begin", "workflow")}
                    className="absolute top-4 right-4 p-2.5 hover:bg-[#ff006e]/20 rounded-lg transition-all hover:scale-110"
                  >
                    {copied === "workflow" ? (
                      <Check className="w-5 h-5 text-[#ffbe0b]" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400 hover:text-[#ff006e]" />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* API Reference Section
//             <section id="api" className="scroll-mt-20">
//               <div className="flex items-center gap-4 mb-8">
//                 <div className="w-2 h-10 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></div>
//                 <h2 className="text-4xl font-bold text-white">API Reference</h2>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur border border-[#00d9ff]/40 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(0,217,255,0.15)] transition-all">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-10 h-10 bg-gradient-to-br from-[#00d9ff] to-[#ff006e] rounded-lg flex items-center justify-center">
//                       <BookOpen className="w-5 h-5 text-white" />
//                     </div>
//                     <h3 className="text-xl font-bold text-[#00d9ff]">Web Interface</h3>
//                   </div>
//                   <ul className="space-y-4">
//                     {[
//                       { title: "Dashboard", desc: "View all repositories" },
//                       { title: "Repository Details", desc: "Browse commits and files" },
//                       { title: "Public Repos", desc: "Explore community repositories" },
//                     ].map((item, idx) => (
//                       <li key={idx} className="flex items-start gap-3 pb-4 border-b border-[#00d9ff]/20 last:pb-0 last:border-0">
//                         <span className="text-[#ff006e] font-bold mt-1">→</span>
//                         <div>
//                           <p className="font-semibold text-gray-200">{item.title}</p>
//                           <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur border border-[#ffbe0b]/40 rounded-2xl p-8 hover:shadow-[0_0_40px_rgba(255,190,11,0.15)] transition-all">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-10 h-10 bg-gradient-to-br from-[#ffbe0b] to-[#ff006e] rounded-lg flex items-center justify-center">
//                       <Code className="w-5 h-5 text-white" />
//                     </div>
//                     <h3 className="text-xl font-bold text-[#ffbe0b]">CLI Commands</h3>
//                   </div>
//                   <p className="text-gray-400 text-sm mb-5">Get help with the --help flag:</p>
//                   <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4 overflow-x-auto">
//                     <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
//                       {`jvcs --help
// jvcs init --help
// jvcs commit --help`}
//                     </SyntaxHighlighter>
//                   </div>
//                 </div>
//               </div>
//             </section> */}

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-[#ff006e] to-[#00d9ff] rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">FAQ</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "What's the difference between global and local installation?",
                    a: "Global installation makes jvcs available system-wide without npx prefix. Local is project-specific and requires npx.",
                  },
                  {
                    q: "How do I authenticate?",
                    a: "Run 'jvcs begin' to login/signup. It will ask for credentials in terminal itself.",
                  },
                  {
                    q: "Can I undo a commit?",
                    a: "Yes, use 'jvcs revert' to undo commits. You can choose which commits to revert.",
                  },
                  {
                    q: "How do I make my repository public?",
                    a: "Use the web dashboard to change repository visibility settings to 'public'.",
                  },
                  {
                    q: "What if I stage the wrong files?",
                    a: "Use 'jvcs unstage <file>' to remove files from staging before committing.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur border border-gray-700/30 hover:border-[#ff006e]/50 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,110,0.1)]"
                  >
                    <h4 className="text-lg font-bold text-[#ff006e] mb-3 flex items-center gap-2">
                      ❓ {item.q}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

           
            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
