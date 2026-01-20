import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Menu,
  X,
  BookOpen,
  GitBranch,
  Code,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
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
    <div>Hello world</div>
  );
}