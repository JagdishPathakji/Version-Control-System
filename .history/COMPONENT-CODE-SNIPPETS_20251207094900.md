# Component Code Snippets - Ready to Replace

## This file contains complete updated code for each component

---

## 1. Navbar.tsx - Updated

```tsx
import { Code2, LogOut, User } from "lucide-react";
import handleLogout from "../functionalities/handleLogout";

interface NavbarProps {
  username?: string;
  setIsAuthenticated?: (value: boolean) => void;
  navigate?: any;
}

export default function Navbar({ username = "User", setIsAuthenticated, navigate }: NavbarProps) {
  return (
    <nav className="bg-[#0a0b0f] border-b border-[#1f2228] sticky top-0 z-50 shadow-lg shadow-[#5af0b1]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/dashboard")}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#5af0b1] to-[#3dd6ff] rounded-lg shadow-lg shadow-[#5af0b1]/30 group-hover:shadow-[0_0_20px_rgba(90,240,177,0.4)] transition-all duration-200 transform group-hover:scale-105">
              <Code2 className="w-6 h-6 text-[#0a0b0f]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-mono font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent group-hover:drop-shadow-lg transition-all">
              JVCS Space
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block hover:text-[#5af0b1] transition-colors cursor-pointer" onClick={() => navigate("/profile")}>
              {username}
            </span>
            <div 
              className="flex items-center justify-center w-10 h-10 bg-[#111217]/70 border border-[#2b2f35] rounded-full hover:border-[#5af0b1] transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(90,240,177,0.2)]"
              onClick={() => navigate("/profile")}
            >
              <User className="w-5 h-5 text-[#5af0b1] group-hover:text-[#3dd6ff] transition-colors" />
            </div>
            <button
              onClick={() => handleLogout(setIsAuthenticated, navigate)}
              className="text-gray-400 hover:text-[#ff6b6b] transition-colors duration-200 hover:scale-110 transform"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

## 2. Dashboard.tsx - Key Sections Updated

### My Repositories Section
```tsx
<section className="bg-[#111217]/80 border border-[#1f2029]/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(90,240,177,0.1)] transition-all">
  <div className="flex items-center gap-3 mb-8">
    <div className="p-2 bg-gradient-to-br from-[#5af0b1]/20 to-[#3dd6ff]/20 rounded-lg">
      <GitBranch className="w-6 h-6 text-[#5af0b1]" strokeWidth={2} />
    </div>
    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent">
      My Repositories
    </h2>
  </div>

  {userRepo.length === 0 ? (
    <div className="text-center py-12">
      <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
      <p className="text-gray-500 text-lg">You don't have any repositories yet.</p>
      <p className="text-gray-600 text-sm mt-1">Create your first repository to get started.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userRepo.map((repo) => (
        <div
          onClick={() => openOwnRepo(repo.name)}
          key={repo._id}
          className="group border border-[#22232c]/70 bg-gradient-to-br from-[#16181f]/80 to-[#0f1116]/80 rounded-xl p-6 hover:border-[#5af0b1] transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(90,240,177,0.15)] transform hover:scale-105"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <GitBranch className="w-5 h-5 text-[#5af0b1] flex-shrink-0" strokeWidth={2} />
              <h3 className="font-semibold text-[#5af0b1] group-hover:text-[#3dd6ff] transition-colors truncate">
                {repo.name}
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-[#0a0b0f]/80 text-gray-400 rounded-full border border-[#1f2029] flex-shrink-0">
              {repo.visibility}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{repo.description || "No description"}</p>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#1f2029]">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#ffd700]" fill="#ffd700" />
              {repo.starred.length}
            </span>
            <span className="opacity-60">Updated recently</span>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
```

---

## 3. Profile.tsx - Key Sections Updated

### Profile Header
```tsx
<div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start bg-gradient-to-br from-[#111217]/80 to-[#0f1116]/80 border border-[#1f2029]/70 backdrop-blur-xl rounded-2xl p-10 shadow-2xl hover:shadow-[0_0_40px_rgba(90,240,177,0.1)] transition-all">
  {/* Avatar */}
  <div className="flex flex-col items-center flex-shrink-0">
    <div className="bg-gradient-to-br from-[#5af0b1]/20 to-[#3dd6ff]/20 p-8 rounded-full border-2 border-[#5af0b1] shadow-[0_0_30px_rgba(90,240,177,0.2)]">
      <User className="w-16 h-16 text-[#5af0b1]" strokeWidth={1.5} />
    </div>
    <p className="text-xs text-gray-500 mt-3">
      Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
    </p>
  </div>

  {/* Profile Details */}
  <div className="flex-1 text-center sm:text-left">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent mb-2">
      {profile.username}
    </h1>
    <div className="flex items-center gap-2 text-gray-400 mb-4 justify-center sm:justify-start">
      <Mail className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{profile.email}</span>
    </div>
    <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-6">
      {profile.description || "No bio provided yet. Add one to tell the community about yourself."}
    </p>

    {/* Stats */}
    <div className="flex flex-wrap justify-center sm:justify-start gap-6 pt-6 border-t border-[#1f2029]">
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-[#5af0b1]" strokeWidth={2} />
        <span><span className="font-semibold text-[#5af0b1]">{profile.followedUser}</span> <span className="text-gray-500">Following</span></span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-[#3dd6ff] rotate-180" strokeWidth={2} />
        <span><span className="font-semibold text-[#3dd6ff]">{profile.followingUser}</span> <span className="text-gray-500">Followers</span></span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <GitBranch className="w-4 h-4 text-[#5af0b1]" strokeWidth={2} />
        <span><span className="font-semibold text-[#5af0b1]">{profile.repositories}</span> <span className="text-gray-500">Repos</span></span>
      </div>
    </div>
  </div>
</div>
```

---

## 4. OwnRepo.tsx - File Tree Section

```tsx
<div className="bg-[#111217]/80 border border-[#1f2029]/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
  <div className="bg-gradient-to-r from-[#5af0b1]/10 to-[#3dd6ff]/10 border-b border-[#1f2029] p-6">
    <h2 className="text-lg font-bold text-[#5af0b1] flex items-center gap-2">
      <Folder className="w-5 h-5 text-[#5af0b1]" strokeWidth={2} />
      Files & Commits
    </h2>
  </div>

  {repo.content.length === 0 ? (
    <div className="text-center py-12 px-6">
      <Folder className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
      <p className="text-gray-500">No commits yet.</p>
    </div>
  ) : (
    <div className="divide-y divide-[#1f2029]">
      {repo.content.map((commit) => (
        <div key={commit._id} className="p-6 hover:bg-[#0f1116]/50 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">
              {new Date(commit.createdAt).toLocaleDateString()} at {new Date(commit.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <FileTree nodes={buildTree(commit.files)} onFileClick={fetchFileContent} />
        </div>
      ))}
    </div>
  )}
</div>
```

---

## Implementation Instructions

1. **Copy the code** from the relevant section above
2. **Replace the entire section** in your component file
3. **Test in browser** to ensure it works correctly
4. **Commit changes** to git

## Color Reference (for copy-paste)

```
Primary BG:     #0a0b0f
Secondary BG:   #111217
Tertiary BG:    #0f1116
Card Border:    #1f2029
Accent 1:       #5af0b1 (cyan-green)
Accent 2:       #3dd6ff (light blue)
Text Primary:   text-gray-200
Text Secondary: text-gray-400
Text Muted:     text-gray-500
```

## Responsive Classes Cheat Sheet

```
Mobile-first: no prefix
Tablet+:      sm:
Laptop+:      md:
Desktop+:     lg:
Wide+:        xl:

Example: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```
