import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code, GitBranch, Zap, Copy, Check, BookOpen, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
                <div className="bg-[#00d9ff]/10 backdrop-blur rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#00d9ff] uppercase">Sections</p>
                  <p className="text-2xl font-bold text-[#00d9ff]">5</p>
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
                    <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
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
                    <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
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
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                  Basic Workflow
                </span>
              </h2>

              <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-lg p-6">
                <p className="text-gray-400 mb-6">A typical JVCS workflow looks like this:</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-6">
                  <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0" }}>
                    {`# 1. Authenticate
jvcs begin

# 2. Create a new repository
jvcs init my-project
cd my-project

# 3. Create/modify files
echo "console.log('Hello');" > app.js

# 4. Check status
jvcs status

# 5. Stage changes
jvcs add .

# 6. Commit changes
jvcs commit "Add app.js"

# 7. Push to remote
jvcs push

# 8. View history
jvcs log`}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => copyToClipboard("jvcs begin", "workflow")}
                    className="absolute top-3 right-3 p-2 hover:bg-[#ff006e]/10 rounded transition-colors"
                  >
                    {copied === "workflow" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </section>

            {/* API Reference Section */}
            <section id="api" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                  API Reference
                </span>
              </h2>

              <div className="space-y-6">
                <div className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#00d9ff] mb-4">Web Interface</h3>
                  <p className="text-gray-400 mb-4">Access JVCS features through the web dashboard after logging in:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-[#ff006e]" />
                      <span><strong className="text-[#ffbe0b]">Dashboard:</strong> View all repositories</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-[#ff006e]" />
                      <span><strong className="text-[#ffbe0b]">Repository Details:</strong> Browse commits and files</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#ff006e]" />
                      <span><strong className="text-[#ffbe0b]">Public Repos:</strong> Explore community repositories</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ffbe0b]/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#ffbe0b] mb-4">CLI Commands</h3>
                  <p className="text-gray-400 mb-4">All commands support help with the <code className="text-[#00d9ff] font-mono">--help</code> flag:</p>
                  <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                    <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0" }}>
                      {`jvcs --help
jvcs init --help
jvcs commit --help`}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "What's the difference between global and local installation?",
                    a: "Global installation makes jvcs available system-wide without npx prefix. Local installation is project-specific and requires npx prefix but is better for team projects.",
                  },
                  {
                    q: "How do I authenticate?",
                    a: "Run 'jvcs begin' to login/signup. It will open a browser window to authenticate with your JVCS account.",
                  },
                  {
                    q: "Can I undo a commit?",
                    a: "Yes, use 'jvcs revert' to undo commits. You can choose which commits to revert.",
                  },
                  {
                    q: "How do I make my repository public?",
                    a: "Use the web dashboard to change repository visibility settings to 'public'. Then others can discover and clone your repo.",
                  },
                  {
                    q: "What happens if I stage the wrong files?",
                    a: "Use 'jvcs unstage <file>' to remove files from the staging area before committing.",
                  },
                  {
                    q: "How do I clone someone's public repository?",
                    a: "Use 'jvcs clone <repo-name>' to clone a public repository. You can find repos on the web dashboard.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[#ff006e] mb-3">{item.q}</h4>
                    <p className="text-gray-400">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips Section */}
            <section className="bg-gradient-to-r from-[#ff006e]/10 to-[#00d9ff]/10 border border-[#ff006e]/30 rounded-xl p-8">
              <h3 className="text-xl font-bold text-[#ffbe0b] mb-4">💡 Pro Tips</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>• Use descriptive commit messages to make history easier to understand</li>
                <li>• Run 'jvcs status' frequently to stay aware of file changes</li>
                <li>• Push regularly to ensure your work is backed up remotely</li>
                <li>• Explore public repositories to learn from others' projects</li>
                <li>• Make your project public to share with the community</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
