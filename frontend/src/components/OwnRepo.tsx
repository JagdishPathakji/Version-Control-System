import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  GitBranch,
  Star,
  Eye,
  EyeOff,
  Clock,
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Pencil,
  Check,
  X,
  FileText
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileItem {
  _id: string;
  name: string;
  driveId: string;
  parentId: string;
  type: "file" | "folder";
}

interface Content {
  _id: string;
  uuid: string;
  files: FileItem[];
  createdAt: string;
  updatedAt: string;
}

interface Repository {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  starred: number;
  owner: string;
  content: Content[];
  readme: string;
  createdAt: string;
}

interface TreeNode extends FileItem {
  children?: TreeNode[];
}

export default function OwnRepo({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const { repoName } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [repo, setRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [star, setStar] = useState<number>(0);

  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isStarred, setIsStarred] = useState<boolean | null>(null);
  const [visibility, setVisibility] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  
  // README States
  const [isEditingReadme, setIsEditingReadme] = useState(false);
  const [editedReadme, setEditedReadme] = useState("");

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await fetch(`https://version-control-system-mebn.onrender.com/getRepoByName/${repoName}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (data.status) {
          setRepo(data.repoObj);
          setStar(data.repoObj.starCount);
          setIsStarred(data.repoObj.isStarredByUser);
          setVisibility(data.repoObj.visibility);
          setEditedReadme(data.repoObj.readme || "");
        }
      } catch (err) {
        console.error("Error fetching repo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [repoName]);

  const changeVisibility = async (reponame: any) => {
    try {
      const response = await fetch(`https://version-control-system-mebn.onrender.com/updateVisibility/${reponame}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.status === false) alert(data.message);
      else setVisibility(data.visibility);
    } catch (error) {
      console.error("Error in changing the visibility", error);
    }
  };

  const toggleStar = async (repoId: string) => {
    try {
      const response = await fetch(`https://version-control-system-mebn.onrender.com/star/${repoId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status === true) {
        setStar(data.count);
        setIsStarred(data.starred);
      } else throw new Error(data.message);
    } catch (error: any) {
      alert(error?.message || "Error while starring repo");
    }
  };

  const handleSaveDescription = async () => {
    try {
      const response = await fetch(`https://version-control-system-mebn.onrender.com/updateRepo/${repoName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editedDescription }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.status) {
        if (repo) setRepo({ ...repo, description: editedDescription });
        setIsEditing(false);
      } else alert(data.message || "Failed to update repository description");
    } catch (error) {
      console.error("Error updating repository description:", error);
      alert("An error occurred while updating the repository description");
    }
  };

  const handleSaveReadme = async () => {
    try {
      const response = await fetch(`https://version-control-system-mebn.onrender.com/updateRepo/${repoName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme: editedReadme }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.status) {
        if (repo) setRepo({ ...repo, readme: editedReadme });
        setIsEditingReadme(false);
      } else alert(data.message || "Failed to update README");
    } catch (error) {
      console.error("Error updating README:", error);
      alert("An error occurred while updating the README");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDescription(repo?.description || "");
  };

  const startEditing = () => {
    setEditedDescription(repo?.description || "");
    setIsEditing(true);
  };

  const startEditingReadme = () => {
    setEditedReadme(repo?.readme || "");
    setIsEditingReadme(true);
  };

  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showModal]);

  const fetchFileContent = async (driveId: string, fileName: string) => {
    try {
      const res = await fetch(`https://version-control-system-mebn.onrender.com/getFileContent/${driveId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        setSelectedFile({ name: fileName, content: data.content });
        setShowModal(true);
      } else alert(data.message);
    } catch (err) {
      console.error("Error fetching file content:", err);
    }
  };

  const buildTree = (files: FileItem[]) => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];
    files
      .filter((f) => f.name !== "jvcs_hashcode.json" && f.name !== "meta.json")
      .forEach((f) => map.set(f.driveId, { ...f, children: [] }));
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) map.get(node.parentId)!.children!.push(node);
      else roots.push(node);
    });
    return roots;
  };

  const FileTree: React.FC<{ nodes: TreeNode[]; level?: number; onFileClick: (d: string, n: string) => void; }> = ({ nodes, level = 0, onFileClick }) => {
    const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
    const toggleNode = (id: string) => setOpenNodes((p) => ({ ...p, [id]: !p[id] }));
    return (
      <div className="flex flex-col">
        {nodes.map((node) => (
          <div key={node.driveId}>
            <div className="flex items-center py-2 px-3 border-y border-[#1f2029] cursor-pointer hover:bg-[#0e1118] hover:border-[#00d9ff]/20 transition-all" style={{ paddingLeft: `${level * 1.2}rem` }} onClick={() => node.type === "folder" ? toggleNode(node.driveId) : onFileClick(node.driveId, node.name)}>
              {node.type === "folder" ? (
                <>
                  {openNodes[node.driveId] ? <ChevronDown className="w-4 h-4 text-[#00d9ff] mr-1" /> : <ChevronRight className="w-4 h-4 text-[#00d9ff] mr-1" />}
                  <Folder className="w-4 h-4 text-[#00d9ff] mr-2" />
                </>
              ) : <File className="w-4 h-4 text-[#00d9ff] mr-2 ml-[1.2rem]" />}
              <span className="text-sm text-gray-300">{node.name}</span>
            </div>
            {node.children && openNodes[node.driveId] && <FileTree nodes={node.children} level={level + 1} onFileClick={onFileClick} />}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d0221] text-gray-300 flex flex-col">
      <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff006e] mb-4"></div>
        <p>Loading repository...</p>
      </div>
    </div>
  );

  if (!repo) return (
    <div className="min-h-screen bg-[#0d0221] text-gray-300">
      <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />
      <div className="text-center py-10 text-red-500 font-semibold text-lg">Repository not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200 flex flex-col">
      <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        
        {/* Repo Header */}
        <div className="grid grid-cols-12 gap-0 bg-[#1a1629]/90 border border-[#ff006e]/30 shadow-2xl">
          <div className="col-span-12 sm:col-span-8 px-8 py-8 border-r border-[#ff006e]/20">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-[#ff006e]" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent break-all italic tracking-tighter">
                {repo.name}
              </h1>
            </div>
            <div className="relative group mt-6">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="w-full bg-[#0d0221]/50 border border-[#ff006e]/30 p-4 rounded-none text-sm text-gray-200 focus:outline-none focus:border-[#ff006e]" rows={3} placeholder="Describe this repository..." />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleSaveDescription} className="px-4 py-2 bg-[#ff006e] text-white text-xs font-bold rounded-none hover:bg-[#ff006e]/80 transition-all"><Check className="w-4 h-4 inline mr-1" /> Save</button>
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-700 text-white text-xs font-bold rounded-none hover:bg-gray-600 transition-all"><X className="w-4 h-4 inline mr-1" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="text-gray-400 text-sm leading-relaxed flex-1 italic">{repo.description || "No description provided."}</p>
                  <button onClick={startEditing} className="p-2 text-gray-500 hover:text-[#ff006e] border border-transparent hover:border-[#ff006e]/20 transition-all"><Pencil className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 sm:col-span-4 p-8 flex flex-col gap-4 bg-[#0d0221]/40">
            <div className="flex justify-between items-center border border-[#ff006e]/20 bg-[#0d0221]/60 px-5 py-4">
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Stars</span>
              <button onClick={() => toggleStar(repo._id)} className="flex items-center gap-2 text-[#ffbe0b] hover:scale-110 transition-transform">
                <Star className="w-5 h-5" fill={isStarred ? "#ffbe0b" : "none"} />
                <span className="font-black text-lg">{star}</span>
              </button>
            </div>
            <div className="flex justify-between items-center border border-[#00d9ff]/20 bg-[#0d0221]/60 px-5 py-4 cursor-pointer hover:border-[#00d9ff]/60 transition-all" onClick={() => changeVisibility(repo.name)}>
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Access</span>
              <div className="flex items-center gap-2">
                {visibility === "public" ? <Eye className="w-5 h-5 text-[#00d9ff]" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
                <span className="capitalize font-black text-[#00d9ff]">{visibility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Repository README Section */}
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 shadow-2xl overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-[#ff006e]/20 flex justify-between items-center bg-[#0d0221]/40">
            <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
              <FileText className="w-4 h-4 text-[#ff006e]" />
              <span className="uppercase tracking-widest font-black text-[10px]">{repo.name} / README.md</span>
            </div>
            {!isEditingReadme && (
              <button onClick={startEditingReadme} className="text-[10px] font-black uppercase text-[#00d9ff] hover:text-[#ff006e] transition-colors border border-transparent hover:border-[#ff006e]/30 px-3 py-1">
                {repo.readme ? "Edit README" : "Add README"}
              </button>
            )}
          </div>
          <div className="p-8">
            {isEditingReadme ? (
              <div className="space-y-4">
                <textarea value={editedReadme} onChange={(e) => setEditedReadme(e.target.value)} className="w-full bg-[#0d0221]/50 border border-[#ff006e]/30 p-6 rounded-none text-sm text-gray-200 font-mono focus:outline-none focus:border-[#ff006e] transition-all" rows={14} placeholder="### Documentation... Use Markdown to describe your repository." />
                <div className="flex gap-2 justify-end">
                  <button onClick={handleSaveReadme} className="px-6 py-3 bg-[#ff006e] text-white text-xs font-black rounded-none hover:shadow-[0_0_20px_rgba(255,0,110,0.3)] transition-all">SAVE SNAPSHOT</button>
                  <button onClick={() => setIsEditingReadme(false)} className="px-6 py-3 bg-gray-800 text-white text-xs font-black rounded-none hover:bg-gray-700 transition-all">CANCEL</button>
                </div>
              </div>
            ) : (
              <div className="relative group prose prose-invert max-w-none text-gray-300 prose-headings:text-[#00d9ff] prose-a:text-[#ff006e] prose-strong:text-[#ffbe0b] prose-code:text-[#ff006e] prose-pre:bg-[#0d0221]/80 rounded-none">
                {repo.readme ? (
                  <>
                    <button onClick={startEditingReadme} className="absolute -top-4 -right-4 p-3 bg-[#0d0221] border border-[#ff006e]/30 text-gray-500 hover:text-[#ff006e] opacity-0 group-hover:opacity-100 transition-all rounded-none shadow-2xl" title="Edit README">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, "")}</SyntaxHighlighter>
                          ) : <code className={className} {...props}>{children}</code>;
                        },
                      }}
                    >
                      {repo.readme}
                    </ReactMarkdown>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[#ff006e]/20 bg-[#0d0221]/20">
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-6 italic">Repository has no overview documentation.</p>
                    <button onClick={startEditingReadme} className="px-8 py-3 border-2 border-[#ff006e] text-[#ff006e] text-xs font-black hover:bg-[#ff006e] hover:text-white transition-all tracking-widest">INITIALIZE README.md</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        <div className="bg-[#111217] border border-[#1f2029]">
          <div className="px-8 py-6 border-b border-[#1f2029] bg-[#1a1629]/40">
            <h2 className="text-sm font-black text-[#00d9ff] uppercase tracking-[0.3em] flex items-center gap-3">
              <Clock className="w-5 h-5" /> REPOSITORY TIMELINE
            </h2>
          </div>
          {repo.content.length === 0 ? <p className="text-gray-500 text-center py-20 italic">No temporal snapshots detected in this repository.</p> : (
            <div className="p-8 space-y-8">
              {repo.content.map((commit) => {
                const treeData = buildTree(commit.files);
                return (
                  <div key={commit._id} className="border border-white/5 bg-[#16181f] p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-[10px] text-[#00d9ff] uppercase tracking-widest">
                        COMMIT ID: <span className="text-gray-400 font-mono ml-2">{commit.uuid}</span>
                      </h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase italic">{new Date(commit.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#0a0b0f] border border-white/5">
                      <FileTree nodes={treeData} onFileClick={fetchFileContent} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Overlay */}
        {showModal && selectedFile && (
          <div className="fixed inset-0 z-[999999] flex flex-col bg-[#0b0c10] text-white w-screen h-screen">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#0f1114]">
              <h3 className="text-[#00d9ff] font-black text-xs uppercase tracking-widest truncate">{selectedFile.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <div className="border border-white/10 bg-[#0a0b0f] p-8 no-scrollbar">
                <SyntaxHighlighter language={selectedFile.name.split(".").pop() || "text"} style={oneDark} showLineNumbers={true} wrapLongLines={true} customStyle={{ background: "transparent", margin: 0, fontSize: "0.85rem" }}>
                  {selectedFile.content || "No content available."}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
