import { useNavigate } from "react-router-dom";
import { ArrowRight, Code, GitBranch, Users, Lock, Zap, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#ff006e]/20 bg-[#0d0221]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#ff006e]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
              JVCS
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-[#00d9ff] hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold">
            <span className="bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b] bg-clip-text text-transparent">
              JVCS
            </span>
            <br />
            <span className="text-gray-300">Your Personal Version Control System</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A lightweight, powerful version control system that works like Git. Track your code changes, manage repositories, and collaborate with a beautiful CLI and web interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-8 py-3 border border-[#00d9ff]/50 text-[#00d9ff] font-semibold rounded-lg hover:bg-[#00d9ff]/10 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Init Command */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(255,0,110,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#ff006e]/20 rounded-lg">
                <GitBranch className="w-6 h-6 text-[#ff006e]" />
              </div>
              <h3 className="text-xl font-bold text-[#ff006e]">Initialize</h3>
            </div>
            <p className="text-gray-400 mb-4">Create a new repository</p>
            <div className="relative">
              <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                {`jvcs init my-repo`}
              </SyntaxHighlighter>
              <button
                onClick={() => copyToClipboard("jvcs init my-repo", "init")}
                className="absolute top-0 right-0 p-2 hover:bg-[#ff006e]/10 rounded transition-colors"
              >
                {copied === "init" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Add Command */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#00d9ff]/20 rounded-lg">
                <Code className="w-6 h-6 text-[#00d9ff]" />
              </div>
              <h3 className="text-xl font-bold text-[#00d9ff]">Stage Files</h3>
            </div>
            <p className="text-gray-400 mb-4">Add files to staging area</p>
            <div className="relative">
              <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                {`jvcs add . \njvcs add file.js`}
              </SyntaxHighlighter>
              <button
                onClick={() => copyToClipboard("jvcs add .", "add")}
                className="absolute top-0 right-0 p-2 hover:bg-[#00d9ff]/10 rounded transition-colors"
              >
                {copied === "add" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Commit Command */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ffbe0b]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(255,190,11,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#ffbe0b]/20 rounded-lg">
                <Zap className="w-6 h-6 text-[#ffbe0b]" />
              </div>
              <h3 className="text-xl font-bold text-[#ffbe0b]">Commit</h3>
            </div>
            <p className="text-gray-400 mb-4">Create a checkpoint with message</p>
            <div className="relative">
              <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                {`jvcs commit "Add new feature"`}
              </SyntaxHighlighter>
              <button
                onClick={() => copyToClipboard(`jvcs commit "Add new feature"`, "commit")}
                className="absolute top-0 right-0 p-2 hover:bg-[#ffbe0b]/10 rounded transition-colors"
              >
                {copied === "commit" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Push Command */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(255,0,110,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#ff006e]/20 rounded-lg">
                <ArrowRight className="w-6 h-6 text-[#ff006e]" />
              </div>
              <h3 className="text-xl font-bold text-[#ff006e]">Push</h3>
            </div>
            <p className="text-gray-400 mb-4">Push changes to remote</p>
            <div className="relative">
              <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                {`jvcs push`}
              </SyntaxHighlighter>
              <button
                onClick={() => copyToClipboard("jvcs push", "push")}
                className="absolute top-0 right-0 p-2 hover:bg-[#ff006e]/10 rounded transition-colors"
              >
                {copied === "push" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* More Commands */}
        <div className="bg-[#0a0b0f] border border-[#00d9ff]/30 rounded-xl p-8">
          <h4 className="text-lg font-bold text-[#00d9ff] mb-6">Additional Commands</h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm font-mono">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs log</span>
                <span className="text-gray-500">View commit history</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs status</span>
                <span className="text-gray-500">Check file status</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs unstage</span>
                <span className="text-gray-500">Remove from staging</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs clone</span>
                <span className="text-gray-500">Clone a repository</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs revert</span>
                <span className="text-gray-500">Undo commits</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-[#ffbe0b]">jvcs begin</span>
                <span className="text-gray-500">Login/Signup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
            Powerful Features
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(255,0,110,0.15)] transition-all">
            <div className="p-4 bg-[#ff006e]/20 rounded-lg w-fit mb-4">
              <GitBranch className="w-8 h-8 text-[#ff006e]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Repository Management</h3>
            <p className="text-gray-400">Create, manage, and organize your repositories with ease. Full control over your code versioning.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all">
            <div className="p-4 bg-[#00d9ff]/20 rounded-lg w-fit mb-4">
              <Code className="w-8 h-8 text-[#00d9ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Commit History</h3>
            <p className="text-gray-400">Track every change with detailed commit history. Browse files at any point in time with full context.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ffbe0b]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(255,190,11,0.15)] transition-all">
            <div className="p-4 bg-[#ffbe0b]/20 rounded-lg w-fit mb-4">
              <Lock className="w-8 h-8 text-[#ffbe0b]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Public & Private Repos</h3>
            <p className="text-gray-400">Control your repository visibility. Share public repos or keep them private with secure authentication.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(255,0,110,0.15)] transition-all">
            <div className="p-4 bg-[#ff006e]/20 rounded-lg w-fit mb-4">
              <Users className="w-8 h-8 text-[#ff006e]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">User Profiles</h3>
            <p className="text-gray-400">Create beautiful profiles, showcase your work, and connect with other developers in the community.</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all">
            <div className="p-4 bg-[#00d9ff]/20 rounded-lg w-fit mb-4">
              <Zap className="w-8 h-8 text-[#00d9ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-time Sync</h3>
            <p className="text-gray-400">Instant synchronization between CLI and web interface. Never miss an update, always stay in sync.</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ffbe0b]/30 rounded-xl p-8 hover:shadow-[0_0_30px_rgba(255,190,11,0.15)] transition-all">
            <div className="p-4 bg-[#ffbe0b]/20 rounded-lg w-fit mb-4">
              <ArrowRight className="w-8 h-8 text-[#ffbe0b]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Contribution Tracking</h3>
            <p className="text-gray-400">View your contribution streak after every push you make.</p>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
            Get Started
          </span>
        </h2>

        {/* Installation Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Global Installation */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ff006e]/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#ff006e]/20 rounded-lg">
                <Zap className="w-6 h-6 text-[#ff006e]" />
              </div>
              <h3 className="text-2xl font-bold text-[#ff006e]">Global Installation</h3>
            </div>
            <p className="text-gray-400 mb-6">Install JVCS globally to use it anywhere on your system. Recommended for regular usage.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#00d9ff] font-semibold mb-2">Install Command:</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                  <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
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
                <p className="text-sm text-[#00d9ff] font-semibold mb-2">Usage Example:</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                  <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                    {`# Commands work directly without npx
jvcs begin
jvcs init my-project
jvcs add .
jvcs commit "Initial commit"
jvcs push`}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => copyToClipboard("jvcs begin", "usage-global")}
                    className="absolute top-3 right-3 p-2 hover:bg-[#ff006e]/10 rounded transition-colors"
                  >
                    {copied === "usage-global" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Local Installation */}
          <div className="bg-[#1a1629]/90 backdrop-blur border border-[#00d9ff]/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#00d9ff]/20 rounded-lg">
                <Code className="w-6 h-6 text-[#00d9ff]" />
              </div>
              <h3 className="text-2xl font-bold text-[#00d9ff]">Local Installation</h3>
            </div>
            <p className="text-gray-400 mb-6">Install JVCS locally in your project. Useful for team projects.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#00d9ff] font-semibold mb-2">Install Command:</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                  <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
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

              <div>
                <p className="text-sm text-[#00d9ff] font-semibold mb-2">Usage Example (with npx):</p>
                <div className="relative bg-[#0a0b0f] border border-[#1f2029] rounded-lg p-4">
                  <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
                    {`# Commands must be preceded with npx
npx jvcs begin
npx jvcs init my-project
npx jvcs add .
npx jvcs commit "Initial commit"
npx jvcs push`}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => copyToClipboard("npx jvcs begin", "usage-local")}
                    className="absolute top-3 right-3 p-2 hover:bg-[#00d9ff]/10 rounded transition-colors"
                  >
                    {copied === "usage-local" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-[#1a1629]/90 backdrop-blur border border-[#ffbe0b]/30 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-[#ffbe0b] mb-8">Quick Setup Guide</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff006e] flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <p className="font-semibold text-white mb-1">Create Your Account</p>
                  <p className="text-sm text-gray-400">Sign up on JVCS web interface to get started</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00d9ff] flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <p className="font-semibold text-white mb-1">Choose Installation Method</p>
                  <p className="text-sm text-gray-400">Global for standalone use, local for projects</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffbe0b] flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <p className="font-semibold text-white mb-1">Run <span className="text-[#00d9ff]">jvcs begin</span></p>
                  <p className="text-sm text-gray-400">Initialize and authenticate with your account</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff006e] flex items-center justify-center font-bold text-lg">4</div>
                <div>
                  <p className="font-semibold text-white mb-1">Start Versioning</p>
                  <p className="text-sm text-gray-400">Initialize repos and track your code changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Project Example */}
        <div className="bg-[#0a0b0f] border border-[#00d9ff]/30 rounded-xl p-8">
          <h4 className="text-lg font-bold text-[#00d9ff] mb-6">Complete Project Example</h4>
          <div className="relative bg-[#1a1629]/50 border border-[#1f2029] rounded-lg p-6 overflow-x-auto">
            <SyntaxHighlighter language="bash" style={tomorrow} customStyle={{ background: "transparent", padding: "0" }}>
              {`# Initialize JVCS (login/signup)
jvcs begin

# Create a new repository
jvcs init my-awesome-project

# Check status of files
jvcs status

# Stage all files
jvcs add .

# Make your first commit
jvcs commit "Initial commit: Add project files"

# Push to remote
jvcs push

# View commit history
jvcs log

# Check status again
jvcs status`}
            </SyntaxHighlighter>
            <button
              onClick={() => copyToClipboard(`jvcs begin\njvcs init my-awesome-project`, "example")}
              className="absolute top-3 right-3 p-2 hover:bg-[#00d9ff]/10 rounded transition-colors"
            >
              {copied === "example" ? <Check className="w-4 h-4 text-[#ffbe0b]" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-[#1a1629]/90 backdrop-blur border border-gradient-to-r from-[#ff006e]/50 to-[#00d9ff]/50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join developers using JVCS. Sign up now and start managing your code with our lightweight version control system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] transition-all"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 border border-[#00d9ff]/50 text-[#00d9ff] font-semibold rounded-lg hover:bg-[#00d9ff]/10 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ff006e]/20 bg-[#0d0221]/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-[#ff006e]" />
                <span className="font-bold text-[#ff006e]">JVCS</span>
              </div>
              <p className="text-sm text-gray-400">Personal Version Control System for developers.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-[#00d9ff] transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection("features")} className="hover:text-[#00d9ff] transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection("installation")} className="hover:text-[#00d9ff] transition-colors">Installation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#00d9ff] transition-colors">License</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#ff006e]/20 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 JVCS. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
