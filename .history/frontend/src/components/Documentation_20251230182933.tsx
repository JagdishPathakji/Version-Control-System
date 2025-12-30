import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Documentation({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});

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
    { id: "overview", label: "Overview", icon: "📖" },
    { id: "installation", label: "Installation", icon: "⚙️" },
    { id: "commands", label: "Commands", icon: "🎯" },
    { id: "workflow", label: "Workflow", icon: "📊" },
    { id: "faq", label: "FAQ", icon: "❓" },
  ];

  const commands = [
    {
      cmd: "jvcs begin",
      desc: "Authenticate with JVCS. Prompts login/signup and stores credentials locally.",
      example: "jvcs begin",
      notes: "Required before performing other commands like init, commit, or push.",
    },
    {
      cmd: "jvcs init",
      desc: "Initialize a new repository in the current folder.",
      example: "jvcs init my-project",
      notes: "Creates a `.jvcs` folder to track commits locally.",
    },
    {
      cmd: "jvcs add",
      desc: "Stage files/folders for the next commit.",
      example: "jvcs add .",
      notes: "Use specific file names or `.` to stage all changes.",
    },
    {
      cmd: "jvcs commit",
      desc: "Create a commit with staged changes.",
      example: `jvcs commit "Initial commit"`,
      notes: "Always add a descriptive commit message.",
    },
    {
      cmd: "jvcs push",
      desc: "Push local commits to remote storage (Google Drive).",
      example: "jvcs push",
      notes: "Ensure you are authenticated before pushing.",
    },
    {
      cmd: "jvcs status",
      desc: "Check the current status of files in the repository.",
      example: "jvcs status",
      notes: "Shows staged, unstaged, and untracked files.",
    },
    {
      cmd: "jvcs log",
      desc: "View the commit history of the repository.",
      example: "jvcs log",
      notes: "Lists commits in reverse chronological order.",
    },
    {
      cmd: "jvcs unstage",
      desc: "Remove files from the staging area.",
      example: "jvcs unstage file.txt",
      notes: "Useful if you accidentally staged the wrong files.",
    },
    {
      cmd: "jvcs clone",
      desc: "Clone a repository from another user.",
      example: "jvcs clone username/repo-name",
      notes: "Downloads the repository to the current folder.",
    },
    {
      cmd: "jvcs revert",
      desc: "Undo commits and move the repository back to a previous state.",
      example: "jvcs revert <commit-id>",
      notes: "Careful: this will reset your changes to that commit.",
    },
  ];

  const faqs = [
    {
      q: "What's the difference between global and local installation?",
      a: "Global installation makes JVCS available system-wide without needing `npx`. Local installation is project-specific, requiring `npx` to run commands.",
    },
    {
      q: "How do I authenticate?",
      a: "Run `jvcs begin`. It will ask for credentials in the terminal itself and store them locally.",
    },
    {
      q: "Can I undo a commit?",
      a: "Yes, use `jvcs revert <commit-id>` to undo commits and return to a previous state.",
    },
    {
      q: "How do I make my repository public?",
      a: "Use the web dashboard and change repository visibility to 'public'.",
    },
    {
      q: "What if I staged the wrong files?",
      a: "Use `jvcs unstage <file>` to remove them from staging before committing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#ff006e]/20 bg-[#0d0221]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#ff006e]/10 rounded-lg transition-colors hidden sm:block">
              <ArrowLeft className="w-5 h-5 text-[#ff006e]" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#00d9ff]" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                JVCS Documentation
              </h1>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-[#ff006e]/10 rounded-lg transition-colors">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
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
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-12">
            {/* Overview */}
            <section id="overview" className="scroll-mt-20">
              <h2 className="text-4xl font-bold text-white mb-4">Overview</h2>
              <p className="text-gray-300 text-lg">
                JVCS is a lightweight CLI version control system. It allows you to manage projects, track changes, commit, push, and collaborate easily.
              </p>
            </section>

            {/* Installation */}
            <section id="installation" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">Installation</h2>

              {/* Global Installation */}
              <div>
                <h3 className="text-2xl font-bold text-[#ff006e] mb-2">Global Installation</h3>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  npm install -g jvcs
                </SyntaxHighlighter>
                <button onClick={() => copyToClipboard("npm install -g jvcs", "install-global")} className="mt-2 p-2 bg-[#ff006e]/20 rounded-lg">
                  {copied === "install-global" ? <Check /> : <Copy />}
                </button>
                <p className="text-gray-400 mt-1">Install globally to use JVCS anywhere on your system.</p>
              </div>

              {/* Local Installation */}
              <div>
                <h3 className="text-2xl font-bold text-[#00d9ff] mb-2">Local Installation</h3>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  npm install jvcs
                </SyntaxHighlighter>
                <button onClick={() => copyToClipboard("npm install jvcs", "install-local")} className="mt-2 p-2 bg-[#00d9ff]/20 rounded-lg">
                  {copied === "install-local" ? <Check /> : <Copy />}
                </button>
                <p className="text-gray-400 mt-1">
                  Use local installation with <code>npx jvcs</code> inside your project folder.
                </p>
              </div>
            </section>

            {/* Commands */}
            <section id="commands" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">Commands</h2>
              {commands.map((cmd, idx) => (
                <div key={idx} className="bg-[#1a1629]/90 border border-gray-700/30 rounded-xl p-6 hover:border-[#ff006e]/50 transition-all">
                  <h3 className="text-xl font-bold text-[#ff006e] mb-2">{cmd.cmd}</h3>
                  <p className="text-gray-300 mb-2">{cmd.desc}</p>
                  <SyntaxHighlighter language="bash" style={tomorrow}>
                    {cmd.example}
                  </SyntaxHighlighter>
                  {cmd.notes && <p className="text-gray-400 mt-2">{cmd.notes}</p>}
                  <button onClick={() => copyToClipboard(cmd.example, `cmd-${idx}`)} className="mt-2 p-2 bg-[#ff006e]/20 rounded-lg">
                    {copied === `cmd-${idx}` ? <Check /> : <Copy />}
                  </button>
                </div>
              ))}
            </section>

            {/* Workflow */}
            <section id="workflow" className="scroll-mt-20">
              <h2 className="text-4xl font-bold text-white mb-4">Workflow</h2>
              <SyntaxHighlighter language="bash" style={tomorrow}>
{`# Authenticate
jvcs begin

# Initialize repository
jvcs init my-project

# Stage all changes
jvcs add .

# Commit
jvcs commit "Initial commit"

# Push changes
jvcs push

# View commit history
jvcs log`}
              </SyntaxHighlighter>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-700/30 rounded-xl p-4 bg-[#1a1629]/90 cursor-pointer" onClick={() => setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] })}>
                  <h3 className="text-lg font-bold text-[#ff006e] flex justify-between items-center">
                    {faq.q}
                    <span>{faqOpen[idx] ? "−" : "+"}</span>
                  </h3>
                  {faqOpen[idx] && <p className="text-gray-300 mt-2">{faq.a}</p>}
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
