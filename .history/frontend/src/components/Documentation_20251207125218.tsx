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
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                  Installation
                </span>
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#00d9ff] mb-3">Global Installation</h3>
                  <p className="text-gray-400 mb-4">Install JVCS globally to use it anywhere on your system.</p>
                  <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                    <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0" }}>
                      {`npm install -g jvcs`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyToClipboard("npm install -g jvcs", "install-global")}
                      className="absolute top-3 right-3 p-2 hover:bg-[#ff006e]/10 rounded transition-colors"
                    >
                      {copied === "install-global" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#00d9ff] mb-3">Local Installation</h3>
                  <p className="text-gray-400 mb-4">Install JVCS locally in your project using npm.</p>
                  <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                    <SyntaxHighlighter language="bash" style={oneDark} customStyle={{ background: "transparent", padding: "0" }}>
                      {`npm install jvcs`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyToClipboard("npm install jvcs", "install-local")}
                      className="absolute top-3 right-3 p-2 hover:bg-[#00d9ff]/10 rounded transition-colors"
                    >
                      {copied === "install-local" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1a1629]/60 border border-[#ffbe0b]/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="text-[#ffbe0b] font-semibold">Note:</span> For local installations, prefix all commands with <span className="font-mono text-[#00d9ff]">npx</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Commands Section */}
            <section id="commands" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                  Commands
                </span>
              </h2>

              <div className="space-y-4">
                {[
                  {
                    cmd: "jvcs begin",
                    desc: "Initialize and authenticate with JVCS",
                    usage: "Run this first to login or signup",
                  },
                  {
                    cmd: "jvcs init <repo-name>",
                    desc: "Create a new repository",
                    usage: "jvcs init my-project",
                  },
                  {
                    cmd: "jvcs add <paths>",
                    desc: "Stage files or folders for commit",
                    usage: "jvcs add . (all files) or jvcs add file.js",
                  },
                  {
                    cmd: "jvcs commit <message>",
                    desc: "Create a commit with a message",
                    usage: `jvcs commit "Add new feature"`,
                  },
                  {
                    cmd: "jvcs push",
                    desc: "Push commits to remote repository",
                    usage: "jvcs push",
                  },
                  {
                    cmd: "jvcs status",
                    desc: "Check the status of files",
                    usage: "jvcs status",
                  },
                  {
                    cmd: "jvcs log",
                    desc: "View commit history",
                    usage: "jvcs log",
                  },
                  {
                    cmd: "jvcs unstage <paths>",
                    desc: "Remove files from staging area",
                    usage: "jvcs unstage file.js",
                  },
                  {
                    cmd: "jvcs revert",
                    desc: "Undo commits",
                    usage: "jvcs revert",
                  },
                  {
                    cmd: "jvcs clone <repo-name>",
                    desc: "Clone a repository",
                    usage: "jvcs clone my-project",
                  },
                ].map((cmd, idx) => (
                  <div key={idx} className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-mono text-lg text-[#00d9ff] font-bold">{cmd.cmd}</h4>
                        <p className="text-gray-400 text-sm mt-1">{cmd.desc}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(cmd.cmd, `cmd-${idx}`)}
                        className="p-2 hover:bg-[#00d9ff]/10 rounded transition-colors"
                      >
                        {copied === `cmd-${idx}` ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="pt-3 border-t border-[#1f2029]">
                      <p className="text-xs text-gray-500 mb-2">Usage:</p>
                      <code className="text-sm text-[#ffbe0b] font-mono">{cmd.usage}</code>
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
