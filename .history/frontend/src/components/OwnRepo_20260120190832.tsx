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
} from "lucide-react";
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
          setVisibility(data.repoObj.visibility)
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
        headers: {
          "Content-Type": "application/json"
        }
      })

      const data = await response.json()
      if (data.status === false) {
        alert(data.message)
      } else {
        setVisibility(data.visibility)
      }
    }
    catch (error) {
      console.error("Error in changing the visibility", error);
    }
  }

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
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      alert(error?.message || "Error while starring repo");
    }
  };

  // lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
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

  const FileTree: React.FC<{
    nodes: TreeNode[];
    level?: number;
    onFileClick: (driveId: string, name: string) => void;
  }> = ({ nodes, level = 0, onFileClick }) => {
    const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
    const toggleNode = (id: string) => setOpenNodes((p) => ({ ...p, [id]: !p[id] }));

    return (
      <div className="flex flex-col">
        {nodes.map((node) => (
          <div key={node.driveId}>
            <div
              className="flex items-center py-2 px-3 border-y border-[#1f2029] cursor-pointer hover:bg-[#0e1118] hover:border-[#00d9ff]/20 transition-all"
              style={{ paddingLeft: `${level * 1.2}rem` }}
              onClick={() =>
                node.type === "folder"
                  ? toggleNode(node.driveId)
                  : onFileClick(node.driveId, node.name)
              }
            >
              {node.type === "folder" ? (
                <>
                  {openNodes[node.driveId] ? (
                    <ChevronDown className="w-4 h-4 text-[#00d9ff] mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#00d9ff] mr-1" />
                  )}
                  <Folder className="w-4 h-4 text-[#00d9ff] mr-2" />
                </>
              ) : (
                <File className="w-4 h-4 text-[#00d9ff] mr-2 ml-[1.2rem]" />
              )}
              <span className="text-sm text-gray-300">{node.name}</span>
            </div>
            {node.children && openNodes[node.driveId] && (
              <FileTree nodes={node.children} level={level + 1} onFileClick={onFileClick} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-300 flex flex-col">
        <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff006e] mb-4"></div>
          <p>Loading repository...</p>
        </div>
      </div>
    );

  if (!repo)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-300">
        <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />
        <div className="text-center py-10 text-red-500 font-semibold text-lg">Repository not found</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200 flex flex-col">
      <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">

        {/* Repo Info */}
        <div className="grid grid-cols-12 gap-4 bg-[#1a1629]/90 border border-[#ff006e]/30 shadow-2xl transition-all duration-300">
          <div className="col-span-12 sm:col-span-8 px-6 py-6 border-r border-[#ff006e]/20">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-[#ff006e]" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent break-all">
                {repo.name}
              </h1>
            </div>
            <p className="text-gray-400 mt-4">
              {repo.description || "No description provided."}
            </p>
          </div>

          {/* Star + Visibility */}
          <div className="col-span-12 sm:col-span-4 px-6 py-6 flex flex-col gap-3">
            <div className="flex justify-between items-center border border-[#ff006e]/20 bg-[#0d0221]/60 px-4 py-3">
              <span className="text-gray-400 text-sm">Stars</span>
              <button
                onClick={() => toggleStar(repo._id)}
                className="flex items-center gap-2 text-[#ffbe0b] hover:text-[#ffd633] transition-all"
              >
                <Star className="w-4 h-4" />
                <span className="font-semibold">{star}</span>
              </button>
            </div>

            <div
              className="flex justify-between items-center border border-[#00d9ff]/20 bg-[#0d0221]/60 px-4 py-3 cursor-pointer"
              onClick={() => changeVisibility(repo.name)}
            >
              <span className="text-gray-400 text-sm">Visibility</span>
              <div className="flex items-center gap-2">
                {visibility === "public" ? (
                  <Eye className="w-4 h-4 text-[#00ffd5]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="capitalize font-semibold">{visibility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commit History */}
        <div className="bg-[#111217] border border-[#1f2029]">
          <div className="px-6 py-6 border-b border-[#1f2029]">
            <h2 className="text-lg font-bold text-[#00d9ff] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00d9ff]" /> Commit History
            </h2>
          </div>

          {repo.content.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No commits yet.</p>
          ) : (
            <div className="p-6 space-y-6">
              {repo.content.map((commit) => {
                const treeData = buildTree(commit.files);
                return (
                  <div key={commit._id} className="border border-[#22232c] bg-[#16181f] p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-[#00d9ff] text-sm">
                        Commit ID: <span className="text-gray-400">{commit.uuid}</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(commit.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#0a0b0f] border border-[#1f2029] p-4">
                      <FileTree nodes={treeData} onFileClick={fetchFileContent} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* File Preview Modal */}
        {showModal && selectedFile && (
        <div
          className="fixed inset-0 z-[999999] flex flex-col bg-[#0b0c10] text-white overflow-hidden w-screen h-screen m-0 p-0"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            zIndex: 999999,
          }}
          aria-modal="true"
          role="dialog"
        >
          {/* Header */}
          <div className="sticky top-0 flex justify-between items-center px-4 sm:px-6 py-3 border-b border-[#1f2029] bg-[#0f1114]/95 backdrop-blur-sm">
            <h3 className="text-[#00d9ff] font-semibold text-sm sm:text-base truncate max-w-[80%]">
              {selectedFile.name}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Close file preview"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-auto p-3 sm:p-6">
            <style>
              {`
                pre, code {
                  white-space: pre-wrap !important;
                  word-wrap: break-word !important;
                  overflow-x: hidden !important;
                  background: transparent !important;
                  max-width: 100% !important;
                }
                .token-line { background-color: transparent !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
              `}
            </style>

            <div className="rounded-xl border border-[#1f2029] bg-[#0a0b0f] shadow-[0_0_24px_rgba(0,255,213,0.12)] p-3 sm:p-5 overflow-auto no-scrollbar">
              <SyntaxHighlighter
                language={selectedFile.name.split(".").pop() || "text"}
                style={oneDark}
                showLineNumbers={true}
                wrapLongLines={true}
                customStyle={{
                  background: "transparent",
                  margin: 0,
                  padding: 0,
                  fontSize: "0.85rem",
                  width: "100%",
                  overflowX: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {selectedFile.content || "No content"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}


      </main>
    </div>
  );
}
