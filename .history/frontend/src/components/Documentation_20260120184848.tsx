import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import Navbar from "../components/Navbar"; // <-- added

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
    { id: "faq", label: "FAQ", icon: "❓" },
  ];

  const commands = [
    {
      cmd: "jvcs begin",
      desc: "Start authentication. It lets you login/signup for using JVCS commands. Must be run first before other commands.",
      example: "jvcs begin",
      notes: "You will be prompted to enter your email/password in terminal.",
    },
    {
      cmd: "jvcs init",
      desc: "Initialize a new repository in the current directory. Creates necessary metadata files.",
      example: "jvcs init my-project",
      notes: "Repository name should be unique within your account.",
    },
    {
      cmd: "jvcs add",
      desc: "Stage files or directories for commit. You can stage specific files or all changes.",
      example: "jvcs add .",
      notes: "Use 'jvcs unstage <file>' to remove files from staging.",
    },
    {
      cmd: "jvcs commit",
      desc: "Create a new commit for all staged changes. You should provide a descriptive message.",
      example: 'jvcs commit "Added authentication module"',
      notes: "Always write meaningful commit messages.",
    },
    {
      cmd: "jvcs push",
      desc: "Push local commits to remote repository.",
      example: "jvcs push",
      notes: "Make sure you are authenticated and have initialized the repo.",
    },
    {
      cmd: "jvcs clone",
      desc: "Clone a remote repository into a local directory.",
      example: "jvcs clone username/reponame",
      notes: "Clones the full repository history and sets up remote origin.",
    },
    {
      cmd: "jvcs status",
      desc: "View status of files in the repository, including staged, modified, and untracked files.",
      example: "jvcs status",
    },
    {
      cmd: "jvcs log",
      desc: "View commit history of the current repository.",
      example: "jvcs log",
    },
    {
      cmd: "jvcs unstage",
      desc: "Remove files from the staging area.",
      example: "jvcs unstage <file>",
    },
    {
      cmd: "jvcs revert",
      desc: "Undo commits and move repository back to a previous state.",
      example: "jvcs revert <commit-hash>",
      notes: "Use carefully! You can specify which commit to revert.",
    },
  ];

  const faq = [
    {
      q: "What's the difference between global and local installation?",
      a: "Global installation allows you to run JVCS from anywhere on your system without npx. Local installation is project-specific and requires using npx before commands.",
    },
    {
      q: "How do I authenticate?",
      a: "Run 'jvcs begin' to login or signup. It will prompt you in the terminal for credentials.",
    },
    {
      q: "Can I undo a commit?",
      a: "Yes, 'jvcs revert <commit-hash>' allows you to revert a commit.",
    },
    {
      q: "How do I make my repository public?",
      a: "Use the web dashboard to change repository visibility to 'public'.",
    },
    {
      q: "What if I staged the wrong files?",
      a: "Use 'jvcs unstage <file>' to remove files from staging before committing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      {/* Navbar */}
      <Navbar username="Jagdish" setIsAuthenticated={setIsAuthenticated} navigate={navigate} />

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? "block" : "hidden lg:block"} lg:col-span-1`}>
            <div className="sticky top-24 bg-[#1a1629]/95 border border-[#ff006e]/40 p-6 shadow-2xl shadow-[#ff006e]/5">
              <h3 className="text-sm font-bold text-[#ff006e] uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-gradient-to-b from-[#ff006e] to-[#00d9ff]"></span>
                Sections
              </h3>

              <nav className="space-y-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center gap-3 ${
                      activeSection === section.id
                        ? "bg-[#ff006e] text-white shadow-lg shadow-[#ff006e]/30"
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

          {/* Content */}
          <div className="lg:col-span-4 space-y-12">
            {/* Installation */}
            <section id="installation" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-6">
                Installation
              </h2>

              {[
                {
                  title: "Global Installation",
                  cmd: "npm install -g jvcs",
                  desc: "Install JVCS globally to use anywhere in your system.",
                  note: "Requires admin privileges on some systems.",
                },
                {
                  title: "Local Installation",
                  cmd: "npm install jvcs",
                  desc: "Install JVCS in the current project folder. Must use npx to run commands.",
                  note: "Useful for project-specific usage.",
                },
              ].map((inst, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d0221] border border-[#ff006e]/40 p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <h3 className="text-2xl font-bold text-[#ff006e] mb-2">
                    {inst.title}
                  </h3>
                  <p className="text-gray-300 mb-3">{inst.desc}</p>

                  <div className="relative mb-2">
                    <SyntaxHighlighter
                      language="bash"
                      style={tomorrow}
                      customStyle={{
                        backgroundColor: "#1a1629",
                        padding: "16px",
                      }}
                    >
                      {inst.cmd}
                    </SyntaxHighlighter>

                    <button
                      onClick={() => copyToClipboard(inst.cmd, `install-${idx}`)}
                      className="absolute top-4 right-4 p-2.5 hover:bg-[#ff006e]/20 transition-all"
                    >
                      {copied === `install-${idx}` ? (
                        <Check className="w-5 h-5 text-[#ffbe0b]" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>

                  <p className="text-yellow-400 text-sm">{inst.note}</p>
                </div>
              ))}
            </section>

            {/* Commands */}
            <section id="commands" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-6">Commands</h2>

              {commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d0221] border border-[#ff006e]/40 p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-[#ff006e]">
                      {cmd.cmd}
                    </h3>

                    <button
                      onClick={() =>
                        copyToClipboard(cmd.example, `cmd-${idx}`)
                      }
                      className="p-2 bg-[#ff006e]/20 hover:bg-[#ff006e]/40 transition-colors"
                    >
                      {copied === `cmd-${idx}` ? (
                        <Check className="text-[#ffbe0b]" />
                      ) : (
                        <Copy className="text-white" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-300 mb-3">{cmd.desc}</p>

                  <div className="overflow-hidden mb-2">
                    <SyntaxHighlighter
                      language="bash"
                      style={tomorrow}
                      customStyle={{
                        backgroundColor: "#1a1629",
                        padding: "16px",
                      }}
                    >
                      {cmd.example}
                    </SyntaxHighlighter>
                  </div>

                  {cmd.notes && (
                    <p className="text-yellow-400 text-sm">{cmd.notes}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Workflow */}
            <section id="workflow" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-6">
                Basic Workflow
              </h2>

              <p className="text-gray-300 mb-4">
                A typical JVCS workflow:
              </p>

              <div className="bg-[#0a0b0f] border border-[#1f2029] p-6 overflow-x-auto">
                <SyntaxHighlighter
                  language="bash"
                  style={tomorrow}
                  customStyle={{
                    backgroundColor: "#1a1629",
                    padding: "16px",
                  }}
                >
{`# 1. Authenticate
jvcs begin

# 2. Initialize repository
jvcs init my-project

# 3. Stage files
jvcs add .

# 4. Commit changes
jvcs commit "Initial commit"

# 5. Push to remote
jvcs push

# 6. View history
jvcs log`}
                </SyntaxHighlighter>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 space-y-6">
              <h2 className="text-4xl font-bold text-white mb-6">FAQ</h2>

              {faq.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d0221] border border-[#ff006e]/40 p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <h4 className="text-lg font-bold text-[#ff006e] mb-2">
                    ❓ {item.q}
                  </h4>
                  <p className="text-gray-300">{item.a}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
