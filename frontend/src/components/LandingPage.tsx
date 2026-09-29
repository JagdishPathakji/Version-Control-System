import { useNavigate } from "react-router-dom";
import { 
  GitBranch, Lock, Zap,
  History, RefreshCw, Layers,
  Database, Globe
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const girgitCommands = [
    { cmd: "girgit init", icon: <Database className="w-5 h-5" />, desc: "Initialize a fresh Girgit Hub repository in your folder." },
    { cmd: "girgit add", icon: <Layers className="w-5 h-5" />, desc: "Stage your local changes for the next commit." },
    { cmd: "girgit commit", icon: <Zap className="w-5 h-5" />, desc: "Capture a snapshot of your staged files permanently." },
    { cmd: "girgit push", icon: <Globe className="w-5 h-5" />, desc: "Synchronize local commits with your remote repository." },
    { cmd: "girgit save-version", icon: <RefreshCw className="w-5 h-5" />, desc: "Streamlined backup: init, add, commit, & push at once." },
    { cmd: "girgit clone", icon: <RefreshCw className="w-5 h-5" />, desc: "Download any public or private repository from the cloud." },
    { cmd: "girgit log", icon: <History className="w-5 h-5" />, desc: "Browse through your entire versioning history." }
  ];

  return (
    <div className="w-screen min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-[#d0d7de] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <GitBranch className="w-7 h-7 text-[#1f2328]" />
            <span className="text-xl font-bold text-[#1f2328] tracking-tight">
              Girgit Hub
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/login")}
              className="text-[#1f2328] text-sm font-semibold hover:text-[#0969da] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 border border-[#d0d7de] bg-white text-[#1f2328] text-sm font-semibold rounded-md hover:bg-[#f3f4f6] transition-colors shadow-sm"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight max-w-4xl">
          Let's build from here
        </h1>
        
        <p className="text-xl text-[#57606a] max-w-3xl mx-auto mb-10 leading-relaxed">
          The complete developer platform to build, scale, and deliver secure software. Complete with decentralized version control, ultra-fast syncing, and deep history tracing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto mb-20">
          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1f883d] text-white text-lg font-semibold rounded-md hover:bg-[#1a7f37] transition-colors shadow-sm"
          >
            Sign up for Girgit
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#d0d7de] text-[#1f2328] text-lg font-semibold rounded-md hover:bg-[#f3f4f6] transition-colors shadow-sm"
          >
            Explore features
          </button>
        </div>

        {/* Terminal / Code Preview */}
        <div className="w-full max-w-4xl mx-auto text-left shadow-2xl rounded-xl overflow-hidden border border-[#d0d7de] bg-[#0d1117]">
            <div className="flex bg-[#161b22] px-4 py-3 items-center gap-2 border-b border-[#30363d]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <span className="text-xs text-[#8b949e] font-mono ml-4">bash</span>
            </div>
            <div className="p-6 font-mono text-sm overflow-x-auto">
                <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0", margin: "0" }}>
{`$ girgit init my-project
Initialized empty Girgit repository in my-project/

$ girgit status
Untracked files:
  (use "girgit add <file>..." to include in what will be committed)
    index.ts
    package.json

$ girgit save-version
[+] Staging 2 files...
[+] Creating commit: Initial project setup
[+] Pushing to remote...
Done! Remote updated successfully.`}
                </SyntaxHighlighter>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="bg-white border-y border-[#d0d7de] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">The toolchain for modern development</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-xl hover:border-[#0969da] transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 bg-white border border-[#d0d7de] rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Zap className="w-6 h-6 text-[#1f883d]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-[#57606a] leading-relaxed">Highly optimized cryptographic hashing algorithms ensure your codebase is processed and synchronized in milliseconds.</p>
            </div>

            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-xl hover:border-[#0969da] transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 bg-white border border-[#d0d7de] rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Lock className="w-6 h-6 text-[#1f2328]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Storage</h3>
              <p className="text-[#57606a] leading-relaxed">Backed by AWS S3 with strict Content-Addressable Storage mechanisms, ensuring immutable history and Zero-Trust remote access.</p>
            </div>

            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-xl hover:border-[#0969da] transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 bg-white border border-[#d0d7de] rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <History className="w-6 h-6 text-[#0969da]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Immutable History</h3>
              <p className="text-[#57606a] leading-relaxed">Traverse your repository's entire timeline with rich logs, atomic commits, and full code-reversion capabilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CLI Reference Section */}
      <section id="commands" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight">Powerful CLI Interface</h2>
        <p className="text-[#57606a] text-center max-w-2xl mx-auto mb-16 text-lg">Everything you need to manage your version control right from your terminal.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {girgitCommands.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#d0d7de] p-5 rounded-lg flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="mt-1 text-[#57606a]">{item.icon}</div>
              <div>
                <h4 className="font-mono text-sm font-semibold text-[#0969da] mb-1">{item.cmd}</h4>
                <p className="text-sm text-[#57606a] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white border-t border-[#d0d7de] py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Ready to collaborate?</h2>
          <p className="text-xl text-[#57606a] mb-10">Join the platform where developers build the future.</p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 bg-[#1f883d] text-white text-lg font-semibold rounded-md hover:bg-[#1a7f37] transition-colors shadow-sm"
          >
            Create your account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f6f8fa] border-t border-[#d0d7de] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-6 h-6 text-[#57606a]" />
                <span className="font-bold text-[#1f2328]">Girgit Hub</span>
              </div>
              <p className="text-[#57606a] text-sm max-w-xs">
                The version control system designed for speed, security, and developer productivity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1f2328] mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-[#57606a]">
                <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-[#0969da]">Features</button></li>
                <li><button onClick={() => scrollToSection("commands")} className="hover:text-[#0969da]">CLI Reference</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-[#0969da]">Sign in</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#1f2328] mb-4 text-sm">Legal & Connect</h4>
              <ul className="space-y-3 text-sm text-[#57606a]">
                <li><a href="https://github.com/JagdishPathakji" target="_blank" rel="noreferrer" className="hover:text-[#0969da]">GitHub</a></li>
                <li><a href="#" className="hover:text-[#0969da]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#0969da]">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#d0d7de] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#57606a]">
            <p>&copy; {new Date().getFullYear()} Girgit Hub. Engineered by Jagdish Pathakji.</p>
            <div className="flex gap-4">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
