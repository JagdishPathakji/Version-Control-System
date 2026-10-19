# GIRGIT (गिरगिट) 🦎
### A Distributed Version Control System & Cloud-Native Repository Platform

[![Architecture](https://img.shields.io/badge/Architecture-CAS%20Merkle%20DAG-blue.svg)](#-core-architectural-foundations-under-the-hood)
[![Diff Engine](https://img.shields.io/badge/Diff%20Engine-Eugene%20Myers%20O(ND)-orange.svg)](#-algorithmic-diff-engine-eugene-myers-ond)
[![Cloud Storage](https://img.shields.io/badge/Storage-AWS%20S3%20Object%20Store-yellow.svg)](#-aws-s3-cloud-remote-synchronization)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%205-green.svg)](#-backend-api-architecture-backend1)
[![CLI Engine](https://img.shields.io/badge/CLI-Python%203.10%2B-blueviolet.svg)](#-cli-command-reference-girgit)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg)](#-web-repository-platform-girgit-hub-frontend)
[![Security Scanner](https://img.shields.io/badge/Security-14--Rule%20Secret%20Scanner-red.svg)](#-automated-secret--credential-leak-scanner)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 📑 Table of Contents
1. [Executive Summary & Project Overview](#-executive-summary--project-overview)
2. [Core Architectural Foundations (Under The Hood)](#-core-architectural-foundations-under-the-hood)
   - [Content-Addressable Storage (CAS)](#1-content-addressable-storage-cas)
   - [Hierarchical Merkle Trees](#2-hierarchical-merkle-trees)
   - [Directed Acyclic Graph (DAG) Commit History](#3-directed-acyclic-graph-dag-commit-history)
   - [References & Symbolic Pointers](#4-references--symbolic-pointers)
3. [Algorithmic Diff Engine: Eugene Myers' $O(ND)$](#-algorithmic-diff-engine-eugene-myers-ond)
4. [3-Way Lowest Common Ancestor (LCA) Merge Engine](#-3-way-lowest-common-ancestor-lca-merge-engine)
5. [AWS S3 Cloud Remote Synchronization](#-aws-s3-cloud-remote-synchronization)
6. [Automated Secret & Credential Leak Scanner](#-automated-secret--credential-leak-scanner)
7. [Multi-Contributor Collaboration & Access Control](#-multi-contributor-collaboration--access-control)
8. [CLI Command Reference (`girgit`)](#-cli-command-reference-girgit)
9. [Web Repository Platform (Girgit Hub Frontend)](#-web-repository-platform-girgit-hub-frontend)
10. [REST API Documentation (`backend1`)](#-rest-api-documentation-backend1)
11. [System Architecture & Data Flow Diagrams](#-system-architecture--data-flow-diagrams)
12. [Technology Stack](#-technology-stack)
13. [Installation & Local Setup Guide](#-installation--local-setup-guide)
14. [Environment Configuration Reference](#-environment-configuration-reference)
15. [Verification & Testing Guide](#-verification--testing-guide)
16. [Academic Credits & Team](#-academic-credits--team)

---

## 🔭 Executive Summary & Project Overview

**Girgit** (named after the chameleon, symbolizing dynamic adaptation, branching, and evolution) is an end-to-end distributed version control system (DVCS) and cloud repository hosting platform designed and engineered from the ground up.

Unlike standard applications that wrap the existing `git` binary, **Girgit independently implements the entire version control subsystem**, algorithms, data structures, and cryptographic protocols:

* **Low-Level Version Control Engine (CLI)**: Implemented in pure Python, providing a local content-addressable object store (`.girgit/objects/`), Merkle tree hierarchy, SHA-1 cryptographic integrity, Eugene Myers' $O(ND)$ diffing, DAG graph visualization via Graphviz, and 3-way LCA reconciliation.
* **AWS S3-Native Cloud Remote Sync**: Cloud synchronization engine mapping local CAS objects directly to AWS S3 bucket key topologies (`repos/<user>/<repo>/objects/` and `refs/heads/<branch>`), eliminating the need for custom daemon protocols like `git-daemon` or `sshd`.
* **Static Secret & Credential Leak Scanner**: Built-in AST/regex pattern detection evaluating 14 distinct security signatures (AWS keys, DB URIs, private keys, JWT secrets, `.env` variables) with automatic token redaction.
* **Full-Stack Cloud Repository Platform (Girgit Hub)**: A production-grade web application built with Express 5, React 18, TypeScript, Tailwind CSS, MongoDB, and Redis featuring repository file exploration, in-browser code editing, branch management, visual diff comparisons, collaborator invites, and security audit dashboards.

---

## 🏛 Core Architectural Foundations (Under The Hood)

```
                            WORKING DIRECTORY
                                   │
                           [ girgit add . ]
                                   ▼
                         STAGING AREA (INDEX)
                                   │
                      [ girgit commit -m "..." ]
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CONTENT-ADDRESSABLE STORAGE (CAS)                   │
│                                                                        │
│   ┌────────────────┐       ┌────────────────┐       ┌──────────────┐   │
│   │  COMMIT OBJECT │──────▶│  TREE OBJECT   │──────▶│ BLOB OBJECTS │   │
│   │                │       │                │       │              │   │
│   │ - tree oid     │       │ - mode type    │       │ Raw file     │   │
│   │ - parent oid(s)│       │ - filename     │       │ content with │   │
│   │ - author/date  │       │ - blob/tree oid│       │ SHA-1 header │   │
│   │ - commit msg   │       └────────────────┘       └──────────────┘   │
│   └────────────────┘                │                                  │
│           ▲                         ▼                                  │
│           │                ┌────────────────┐                          │
│   ┌────────────────┐       │ SUBTREE OBJECT │                          │
│   │   REFERENCES   │       └────────────────┘                          │
│   │                │                                                   │
│   │ HEAD -> master │                                                   │
│   │ refs/heads/*   │                                                   │
│   │ refs/tags/*    │                                                   │
│   └────────────────┘                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Content-Addressable Storage (CAS)

At the foundation of Girgit is an immutable, content-addressed object store housed within `.girgit/objects/`. Any file content, directory listing, or commit metadata is transformed into an object whose identifier (OID) is determined strictly by its cryptographic hash:

$$\text{OID} = \text{SHA-1}(\text{type} \parallel \text{"\x00"} \parallel \text{content})$$

* **Header Delimiter**: Objects are stored with a prepended null-byte (`\x00`) separating the human-readable object type descriptor (`blob`, `tree`, or `commit`) from the raw payload bytes.
* **Fan-Out Directory Partitioning**: To avoid file system performance degradation when storing hundreds of thousands of files in a single folder, Girgit uses a 2-character prefix fan-out:
  - Hash: `4b825dc642cb6eb9a060e54bf8d69288fbee4904`
  - Stored at: `.girgit/objects/4b/825dc642cb6eb9a060e54bf8d69288fbee4904`
* **Deduplication Efficiency**: If two identical files exist across different directories or commits, only a single blob object is created. Sequential commits with minor changes share identical subtree and blob hashes, achieving up to **85.5% storage deduplication** compared to naive file copy architectures.

### 2. Hierarchical Merkle Trees

Girgit represents directory structures as nested **Merkle Trees**:
* A `blob` object represents pure file bytes without metadata (file name, path, or permissions).
* A `tree` object acts as a directory index, containing ordered entries with format:
  ```
  <type> <oid> <filename>\n
  ```
  Where `<type>` is either `blob` (for regular files) or `tree` (for subdirectories).
* By hashing subtrees into parent trees recursively, the top-level root tree hash represents the entire state of the repository at a specific millisecond in time. If any byte of any file changes, the hash cascades up to the root, guaranteeing cryptographic tamper-evidence.

### 3. Directed Acyclic Graph (DAG) Commit History

Every commit in Girgit is an immutable text record containing:
```
tree <root-tree-oid>
parent <parent-commit-oid>
author <name> <<email>> <timestamp>

<commit message body>
```
* **Parent Linkages**: Merge commits contain multiple `parent` lines, establishing a Directed Acyclic Graph (DAG) of project history.
* **Graph Traversal**: Commands like `girgit log` and the web commit visualizer execute Breadth-First Search (BFS) and topological sorting across parent links to render linear or branching histories.

### 4. References & Symbolic Pointers

References are human-readable pointers stored as lightweight text files inside `.girgit/refs/`:
* **Branches**: `.girgit/refs/heads/<branch-name>` contains the 40-character SHA-1 commit hash of the branch tip.
* **Tags**: `.girgit/refs/tags/<tag-name>` contains the commit hash representing an immutable milestone.
* **HEAD**: `.girgit/HEAD` determines the active working context.
  - *Symbolic Reference*: `ref: refs/heads/master` (points to the branch reference; committing advances the branch).
  - *Detached HEAD*: Directly contains a 40-character SHA-1 commit hash (modifications do not advance any branch).

---

## ⚡ Algorithmic Diff Engine: Eugene Myers' $O(ND)$

Girgit includes an independent implementation of **Eugene Myers' $O(ND)$ Difference Algorithm** (`diff.py`, `Myers.py`, `Edit_Wrapper.py`).

```
         (x, y) Edit Graph
      (0,0)──▶ (1,0)──▶ (2,0)
        │        │        │
        ▼  \     ▼        ▼
      (0,1)──▶ (1,1)──▶ (2,1)
        │        │  \     │
        ▼        ▼        ▼
      (0,2)──▶ (1,2)──▶ (2,2)
```

### The Mathematics of Myers' Diff
Given two sequences $A$ of length $N$ and $B$ of length $M$:
1. The problem of computing the Shortest Edit Script (SES) is equivalent to finding the shortest path from $(0, 0)$ to $(N, M)$ on an edit grid.
2. A horizontal edge from $(x, y)$ to $(x+1, y)$ represents a **deletion** from sequence $A$.
3. A vertical edge from $(x, y)$ to $(x, y+1)$ represents an **insertion** from sequence $B$.
4. A diagonal edge from $(x, y)$ to $(x+1, y+1)$ exists whenever $A[x+1] == B[y+1]$ (matching lines) and represents a **free move** (weight 0, called a *snake*).

Myers' algorithm searches diagonals $k = x - y$. For each edit distance $D \in [0, N + M]$ and diagonal $k \in [-D, D]$ with step 2:
$$x = \max\left(V[k - 1] + 1, \; V[k + 1]\right)$$
$$y = x - k$$

While $x < N$ and $y < M$ and $A[x + 1] == B[y + 1]$, both $x$ and $y$ are incremented along the diagonal snake.

### Performance Benchmark Comparison
| Metric / Parameter | Naive Matrix DP (LCS) | Eugene Myers' Algorithm (Girgit) |
|---|---|---|
| **Time Complexity** | $O(N \cdot M) \approx O(N^2)$ | $O(N \cdot D)$ (where $D \ll N$ in version control) |
| **Space Complexity**| $O(N \cdot M)$ matrix | $O(D^2)$ frontier vectors |
| **Operations ($N=2000, D=200$)** | $4,000,000$ operations | **$400,000$ operations (90% reduction)** |
| **Hunk Formatting** | Requires post-pass alignment | Direct SES generation with unified context (`@@ -l,s +l,s @@`) |

---

## 🔀 3-Way Lowest Common Ancestor (LCA) Merge Engine

When integrating divergent branches ($A$ and $B$), Girgit executes a true **3-Way Merge Algorithm**:

```
             O (Lowest Common Ancestor / Base)
            / \
           /   \
          ▼     ▼
         A       B
          \     /
           \   /
             ▼
          M (Merge Commit)
```

1. **Topological LCA Discovery**:
   - Computes commit reachability sets for both branches using DAG backward traversal.
   - Finds the Lowest Common Ancestor commit $O$ representing the point of divergence.
2. **Three-Way Comparison**:
   - For every file present across $O$, $A$, and $B$:
     - If file unchanged in $A$ and modified in $B \implies$ Automatically take $B$.
     - If file unchanged in $B$ and modified in $A \implies$ Automatically take $A$.
     - If file modified identically in both $A$ and $B \implies$ Automatically take $A$.
     - If non-overlapping line hunks were modified in $A$ and $B \implies$ Interleave and auto-merge.
     - If overlapping lines were modified with differing text $\implies$ Flag a **Merge Conflict** and write standard conflict markers into the file:
       ```
       <<<<<<< HEAD (Current Branch)
       Local change from branch A
       =======
       Incoming change from branch B
       >>>>>>> incoming-branch
       ```

---

## ☁️ AWS S3 Cloud Remote Synchronization

Girgit replaces heavy Git daemon servers with a serverless, object-storage synchronization architecture on **Amazon S3**:

### S3 Key Topology
```
s3://<bucket-name>/
└── repos/
    └── <username>/
        └── <repoName>/
            ├── HEAD                         # Plain text "ref: refs/heads/master"
            ├── refs/
            │   └── heads/
            │       ├── master               # 40-char SHA-1 hash of latest master commit
            │       └── feature-login        # 40-char SHA-1 hash of latest feature commit
            └── objects/
                ├── 4b/
                │   └── 825dc642cb6eb9a060e54bf8d69288fbee4904
                ├── 8a/
                │   └── c3125e89d1b0d5c80d56fb3f9f4a760c6d701a
                └── ...
```

### Push Protocol Workflow (`girgit push <remote> <branch>`)
1. **Local Object Collection**: Traverses the local commit history and Merkle trees to find all objects associated with the branch that do not yet exist on the remote.
2. **Cloud Transmission**: Sends missing objects encoded as base64 blobs via an authorized HTTP POST to the backend (`/cli/push`).
3. **Atomic S3 PutObject**: The backend writes the objects to S3 under `repos/<username>/<repoName>/objects/xx/yyyy...`.
4. **Reference Pointer Advance**: Updates `repos/<username>/<repoName>/refs/heads/<branch>` to point to the new commit SHA-1.

---

## 🛡 Automated Secret & Credential Leak Scanner

Girgit includes an automated, built-in **Security & Credential Leak Scanner** (`secretScanner.js`). It prevents developers from accidentally committing credentials, secrets, and private keys into repositories.

### The 14 Active Security Signatures
The scanner executes high-precision regular expression static analysis across all committed blobs and repository trees:

| # | Credential Category | Regex Pattern / Heuristic | Masked Redaction Example |
|---|---|---|---|
| 1 | **AWS Access Key ID** | `(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIP[A-Z0-9])[A-Z0-9]{16}` | `AKIA****************` |
| 2 | **AWS Secret Access Key** | `(?i)aws_secret_access_key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})` | `wJal************************************` |
| 3 | **Generic API Keys** | `(?i)(?:api_key|apikey|secret_key|app_secret)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{16,64})` | `api_****************` |
| 4 | **Passwords in URIs** | `[a-zA-Z]{3,10}://[^/\s:@]+:([^/\s:@]{4,})@[^/\s]+` | `postgres://user:********@host` |
| 5 | **Bearer Authorization Tokens** | `(?i)bearer\s+([a-zA-Z0-9_\-\.]){20,}` | `Bearer ********************` |
| 6 | **Private Cryptographic Keys** | `-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----` | `-----BEGIN PRIVATE KEY----- [MASKED]` |
| 7 | **Slack Webhooks & Bot Tokens** | `xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*` | `xoxb-**********-**********-****` |
| 8 | **GitHub Personal Access Tokens** | `gh[pousr]_[A-Za-z0-9_]{36,}` | `ghp_********************************` |
| 9 | **Google Cloud Platform API Keys**| `AIza[0-9A-Za-z\\-_]{35}` | `AIza***********************************` |
| 10| **Stripe API Keys (Live/Test)** | `[rs]k_(live|test)_[0-9a-zA-Z]{24,}` | `sk_live_************************` |
| 11| **Database Connection Strings** | `mongodb(\+srv)?://.*|postgres://.*|mysql://.*|redis://.*` | `mongodb+srv://root:********@cluster` |
| 12| **Committed `.env` Files** | Direct match on `.env`, `.env.local`, `.env.production` | *Full content scanned for KEY=VALUE pairs* |
| 13| **JWT Secret Keys** | `(?i)jwt_secret(?:_key)?\s*[:=]\s*['"]?([^\s'"]{6,})` | `jwt_secret_key=********` |
| 14| **Generic Passwords in Code** | `(?i)(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{6,})['"]` | `password="********"` |

### Automated Redaction Mechanism
When leaks are detected:
- The scanner reports the exact file name, line number, rule identifier, and severity level (`CRITICAL` or `HIGH`).
- Secret values are masked in the UI and API responses (e.g., `AKIAIOSFODNN7EXAMPLE` $\to$ `AKIA**************LE`), ensuring that inspecting an audit report does not expose the leaked credential in plain text.

---

## 👥 Multi-Contributor Collaboration & Access Control

Girgit features a complete multi-user collaboration engine:
* **Role-Based Access Control (RBAC)**:
  - **Owner**: Full administrative rights (delete repo, toggle visibility, manage collaborators, direct push).
  - **Collaborator**: Push and branch creation access; permission to propose and merge branches.
  - **Reader / Public**: Read-only clone, branch browsing, and diff inspection for public repositories.
* **Granular Push Verification**:
  - The CLI and Web push pipelines cryptographically verify the user's JWT identity and check collaborator privileges against the MongoDB repository document before allowing any S3 reference updates.
* **Invite Workflow**:
  - Owners can invite collaborators by username directly via the repository dashboard.

---

## 💻 CLI Command Reference (`girgit`)

The `girgit` CLI provides 16 primary subcommands for local and remote operations:

### 1. `girgit begin`
* **Description**: Interactive terminal authentication. Prompts for username and password, authenticates against the backend, and stores a secure session token in `~/.girgit_credentials`.
* **Usage**:
  ```bash
  girgit begin
  ```

### 2. `girgit init`
* **Description**: Initializes an empty Girgit repository in the current working directory. Creates `.girgit/`, `.girgit/objects/`, `.girgit/refs/heads/`, and configures `HEAD` to `ref: refs/heads/master`.
* **Usage**:
  ```bash
  girgit init
  ```

### 3. `girgit add <path>`
* **Description**: Reads files from the working directory, hashes them into `blob` objects in `.girgit/objects/`, and records their path and OID in the staging index.
* **Usage**:
  ```bash
  girgit add .
  girgit add src/index.js
  ```

### 4. `girgit commit -m "<message>"`
* **Description**: Traverses the staged index, writes hierarchical `tree` objects, records a new `commit` object referencing the root tree and current parent commit(s), and advances the active branch pointer.
* **Usage**:
  ```bash
  girgit commit -m "Implement authentication middleware"
  ```

### 5. `girgit status`
* **Description**: Compares the working directory against the staging index, and the staging index against `HEAD`. Displays staged, unstaged, untracked, and modified files with ANSI color coding.
* **Usage**:
  ```bash
  girgit status
  ```

### 6. `girgit log [oid]`
* **Description**: Performs a breadth-first search (BFS) traversal of the commit DAG starting from `HEAD` (or an optional commit OID), outputting commit hashes, author details, dates, and messages.
* **Usage**:
  ```bash
  girgit log
  girgit log a3f8b1c
  ```

### 7. `girgit branch [branch_name] [-d]`
* **Description**: Lists all local branch references. If `branch_name` is provided, creates a new branch pointer at `HEAD`. With `-d`, deletes the specified branch (with safety checks preventing deletion of the active branch).
* **Usage**:
  ```bash
  girgit branch                     # List branches
  girgit branch feature-payment     # Create branch
  girgit branch -d feature-payment  # Delete branch
  ```

### 8. `girgit checkout <name>`
* **Description**: Switches the active branch or checks out a specific commit (detached HEAD). Performs dirty-tree validation to prevent overwriting uncommitted working tree changes.
* **Usage**:
  ```bash
  girgit checkout master
  girgit checkout feature-payment
  girgit checkout 4b825dc
  ```

### 9. `girgit diff [commit1] [commit2]`
* **Description**: Executes Eugene Myers' $O(ND)$ Difference Algorithm between two commits, or between the working tree and `HEAD`. Renders colored unified diff hunks (`+` green additions, `-` red deletions).
* **Usage**:
  ```bash
  girgit diff
  girgit diff 9a1c2d3 b4e5f6a
  ```

### 10. `girgit merge <branch>`
* **Description**: Finds the Lowest Common Ancestor (LCA) between `HEAD` and the specified branch, performing an automated 3-way merge or generating conflict markers in the event of collisions.
* **Usage**:
  ```bash
  girgit merge feature-payment
  ```

### 11. `girgit reset <commit_oid>`
* **Description**: Moves the current branch reference pointer directly to `<commit_oid>`.
* **Usage**:
  ```bash
  girgit reset e2d1c0b
  ```

### 12. `girgit tag <tag_name> [commit_oid]`
* **Description**: Creates a lightweight tag reference under `.girgit/refs/tags/<tag_name>` pointing to the specified commit (or `HEAD` by default).
* **Usage**:
  ```bash
  girgit tag v1.0.0
  ```

### 13. `girgit k`
* **Description**: Traverses the repository commit DAG and reference pointers, generates a Graphviz DOT representation, and compiles an interactive graphical diagram of the commit tree.
* **Usage**:
  ```bash
  girgit k
  ```

### 14. `girgit push <remote> <branch>`
* **Description**: Packages all missing local objects, authenticates with the remote API, uploads objects to S3, and updates the remote branch reference pointer.
* **Usage**:
  ```bash
  girgit push origin master
  ```

### 15. `girgit fetch <remote>`
* **Description**: Downloads all new objects and remote reference pointers from the cloud remote into the local repository without modifying the active working tree.
* **Usage**:
  ```bash
  girgit fetch origin
  ```

### 16. `girgit pull / clone <repo_url>`
* **Description**: Clones a remote repository or pulls changes from the tracking branch, synchronizing objects from S3 and updating the local working tree.
* **Usage**:
  ```bash
  girgit clone http://localhost:5000/user/repo
  ```

---

## 🌐 Web Repository Platform (Girgit Hub Frontend)

The **Girgit Hub** frontend (`frontend/`) is a responsive single-page web application replicating the GitHub workflow:

| View / Page | Component | Key Features & Interactions |
|---|---|---|
| **Landing Page** | `LandingPage.tsx` | Hero presentation, terminal simulation, command interactive copy-to-clipboard, architecture feature cards, CTA buttons. |
| **Authentication** | `Login.tsx`, `Register.tsx`, `VerifyOtp.tsx` | Clean input forms with validation, automated redirection, toast notifications, Brevo 6-digit OTP email verification code verification. |
| **User Dashboard** | `Dashboard.tsx` | Quick repository switcher, search bar with client-side filtering, user profile widget, public repository feed, recent activity feed. |
| **Repository Explorer** | `RepositoryView.tsx` | File tree explorer with directory navigation, branch switcher dropdown, clone URL pill, ZIP download trigger, security scan tab, collaborator manager, README markdown preview. |
| **File Viewer & Editor** | `FileView.tsx` | Breadcrumb file navigation, syntax-highlighted code viewer, raw file view, in-browser code editor with direct commit submission to S3. |
| **Commit History** | `CommitHistory.tsx` | Chronological commit timeline, relative timestamps, author avatars, SHA copy button, "Browse at this point" code view, "View Diff" button. |
| **Commit Diff Viewer** | `CommitDiff.tsx` | Side-by-side split and unified diff views powered by `react-diff-viewer-continued`, line additions/deletions stats, modified file list. |
| **Profile & Social** | `Profile.tsx`, `PublicProfile.tsx` | Editable bio, markdown profile README, repository tab with privacy filters, follow/unfollow system with real-time counters. |
| **Security Center** | *Integrated in Repo View* | Real-time secret audit dashboard displaying detected credential leaks, line numbers, severity tags, and masked secret values. |

---

## 📡 REST API Documentation (`backend1`)

The backend exposes a structured Express 5 REST API:

### Authentication & User Endpoints (`/`)
* `POST /signup` — Register user, validate input, hash password via bcrypt, generate OTP, cache in Redis, trigger Brevo email.
* `POST /verifyOtp` — Validate 6-digit OTP from Redis; create MongoDB user record.
* `POST /login` — Authenticate credentials; return HTTP-only JWT cookie (web) or JSON JWT (CLI).
* `POST /logout` — Invalidate session by clearing HTTP-only JWT cookie.
* `POST /verifyToken` — Verify active session validity for client route guarding.
* `GET /getOwnProfile` — Retrieve authenticated user profile, linked repos, and stats.
* `GET /getUserProfile/:email` — Retrieve profile data by email address.
* `GET /getPublicProfile/:username` — Public profile endpoint with follow state.
* `GET /getAllUsers` — Retrieve user directory for social discovery.
* `PATCH /updateProfile` — Update bio description or profile markdown README.
* `DELETE /deleteProfile` — Delete account and associated session credentials.
* `POST /follow/:targetUsername` — Toggle follow/unfollow relationship between users.

### Repository Management Endpoints (`/repo`)
* `POST /repo/create` — Initialize a new repository record in MongoDB and create root S3 branch refs.
* `GET /repo/:username/:repoName` — Fetch repository metadata, file tree for active branch, and latest commit info.
* `GET /repo/:username/:repoName/blob` — Fetch raw or decoded content of a specific file blob via its OID or branch path.
* `GET /repo/:username/:repoName/commits` — Fetch commit history list for a branch with author and message details.
* `GET /repo/:username/:repoName/commit/:oid/diff` — Compute Myers diff between commit `:oid` and its parent.
* `GET /repo/:username/:repoName/zip` — Stream a `.zip` archive of the repository contents using `archiver`.
* `POST /repo/:username/:repoName/edit` — In-browser file edit: constructs new blob, updates tree recursively, creates commit on S3.
* `POST /repo/:username/:repoName/merge` — Trigger 3-way LCA branch merge on S3; returns merge status or conflict details.
* `GET /repo/:username/:repoName/security-scan` — Execute secret leak scan across all repository files and return flagged leaks.
* `GET /user/repos` — List all repositories belonging to the authenticated user.

### Collaborator Endpoints
* `GET /repo/:username/:repoName/collaborators` — List current repository collaborators.
* `POST /repo/:username/:repoName/collaborators` — Add a user as a collaborator.
* `DELETE /repo/:username/:repoName/collaborators/:targetUsername` — Remove a collaborator.

### CLI Synchronization Endpoints (`/cli`)
* `POST /cli/login` — Authenticate CLI client; returns a persistent JWT token.
* `POST /cli/push` — Ingests base64-encoded Git objects, writes to S3, and updates branch ref.
* `GET /cli/clone` — Bundles remote objects and refs for local CLI unpacking.

---

## 📐 System Architecture & Data Flow Diagrams

### Service Architecture
```mermaid
flowchart TD
    subgraph Client Layer
        CLI["Girgit CLI (Python 3.10+)"]
        Browser["Girgit Hub Web (React + TS)"]
    end

    subgraph API & Application Layer
        Express["Express 5 REST API (backend1)"]
        Scanner["Secret Scanner (14 Rules)"]
        S3Helper["S3 Git Helper (Tree/Commit Engine)"]
    end

    subgraph Data & Cloud Storage
        S3[("AWS S3 Object Store\n(Blobs, Trees, Commits, Refs)")]
        Mongo[("MongoDB Atlas\n(Users, Repos, Metadata)")]
        Redis[("Redis Cloud\n(OTPs, Rate Limiting)")]
        Brevo["Brevo Email API\n(OTP Delivery)"]
    end

    CLI -->|HTTP REST / JWT| Express
    Browser -->|HTTP REST / Cookies| Express
    Express --> Scanner
    Express --> S3Helper
    S3Helper <--> S3
    Express <--> Mongo
    Express <--> Redis
    Express --> Brevo
```

### CLI Push Data Flow
```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant CLI as Girgit CLI
    participant API as Express API (backend1)
    participant S3 as AWS S3 Storage
    participant DB as MongoDB

    Dev->>CLI: girgit push origin master
    CLI->>CLI: Identify unpushed commits, trees, blobs
    CLI->>API: POST /cli/push (Header: Bearer Token, Body: Objects & Ref)
    API->>DB: Verify user identity & collaborator access
    DB-->>API: Authorized
    loop For each object
        API->>S3: PutObject (repos/user/repo/objects/xx/yyyy...)
    end
    API->>S3: PutObject (repos/user/repo/refs/heads/master)
    API-->>CLI: 200 OK (Branch updated)
    CLI-->>Dev: [Internals] Push completed successfully
```

---

## 🛠 Technology Stack

| Domain | Technology / Library | Version | Purpose |
|---|---|---|---|
| **CLI Engine** | Python | `3.10+` | Core DVCS implementation (`girgit`) |
| **CLI Hashing** | `hashlib` (SHA-1) | Standard Lib | Content-addressable object hashing |
| **CLI Graphing** | `graphviz` | `^0.20` | DAG commit graph rendering (`girgit k`) |
| **CLI Networking**| `requests` | `^2.31` | Remote HTTP communication with backend API |
| **Backend Server**| Node.js / Express | `^5.1.0` | High-performance asynchronous REST API |
| **Cloud Storage** | AWS SDK for JS v3 (`@aws-sdk/client-s3`) | `^3.1115.0` | Git object & reference storage on AWS S3 |
| **Database** | MongoDB / Mongoose | `^8.19.2` | Users, repository metadata, permissions |
| **Cache / Rate Limit** | Redis | `^5.8.3` | OTP storage, signup caching, rate limiting |
| **Email Service** | Brevo API (`@getbrevo/brevo`) | `^3.0.1` | Transactional OTP email dispatch |
| **Security / Auth**| `jsonwebtoken`, `bcrypt` | `^9.0.2`, `^6.0.0` | Password hashing (10 salt rounds) and JWT |
| **Archive Bundler**| `archiver` | `^8.0.0` | On-the-fly streaming ZIP downloads |
| **Frontend Core** | React / Vite / TypeScript | `^18.3.1` | Fast single-page client interface |
| **Styling** | Tailwind CSS / Lucide React | `^3.4`, `^0.460` | Dark-mode and GitHub-inspired UI components |
| **Diff Visualizer**| `react-diff-viewer-continued` | `^3.4.0` | Split / unified side-by-side code diffing |
| **Server State** | `@tanstack/react-query` | `^5.56.2` | Client-side caching and background refetching |

---

## 🚀 Installation & Local Setup Guide

### Prerequisites
* **Python**: `3.10` or higher
* **Node.js**: `18.0.0` or higher (`npm` included)
* **MongoDB**: A running MongoDB instance or MongoDB Atlas URI
* **Redis**: A running local Redis instance or Redis Cloud instance
* **AWS S3**: An AWS account with an active S3 bucket and IAM programmatic credentials

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/JagdishPathakji/Version-Control-System.git
cd Version-Control-System
```

---

### Step 2: Configure and Start the Backend (`backend1`)
```bash
cd backend1
npm install
```

Create a `.env` file in `backend1/` (refer to [Environment Configuration](#-environment-configuration-reference)):
```env
PORT=5000
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/girgit
REDIS_URL=redis://default:<password>@<host>:<port>
JWT_SECRET_KEY=your_jwt_super_secret_key_here
FRONTEND_URL=http://localhost:5173

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-girgit-s3-bucket-name

# Brevo (Sendinblue) Email API
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your-verified-sender@domain.com
```

Start the backend server:
```bash
npm start
# Server listening on http://localhost:5000
```

---

### Step 3: Configure and Start the Frontend (`frontend`)
```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
# Vite server running at http://localhost:5173
```

---

### Step 4: Install the CLI Tool (`girgit`)
From the root repository directory:
```bash
pip install -e ./girgit
```
Verify the installation:
```bash
girgit --help
```

---

## ⚙️ Environment Configuration Reference

### Backend (`backend1/.env`)
| Variable | Description | Required | Example |
|---|---|:---:|---|
| `PORT` | HTTP server port | Yes | `5000` |
| `MONGODB_URL` | MongoDB connection connection string | Yes | `mongodb://localhost:27017/girgit` |
| `REDIS_URL` | Redis connection URI | Yes | `redis://localhost:6379` |
| `JWT_SECRET_KEY` | Secret key for JWT signing | Yes | `b3f8...91a2` |
| `FRONTEND_URL` | Allowed CORS origin for frontend | Yes | `http://localhost:5173` |
| `AWS_ACCESS_KEY_ID` | IAM Access Key with S3 read/write | Yes | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Access Key | Yes | `wJal...` |
| `AWS_REGION` | AWS Region of the S3 bucket | Yes | `ap-south-1` |
| `S3_BUCKET_NAME` | Name of the S3 storage bucket | Yes | `girgit-objects-prod` |
| `BREVO_API_KEY` | Brevo API key for transactional emails | Yes | `xkeysib-...` |
| `EMAIL_USER` | Verified sender email address | Yes | `noreply@girgit.io` |

---

## 🧪 Verification & Testing Guide

### 1. Test CLI Local Flow
```bash
# 1. Create a test directory
mkdir girgit-demo && cd girgit-demo

# 2. Initialize
girgit init

# 3. Create sample files
echo "print('Hello Girgit')" > main.py
echo "Version 1.0" > README.txt

# 4. Stage and commit
girgit add .
girgit commit -m "Initial commit"

# 5. Check status and log
girgit status
girgit log

# 6. Make modifications and test Myers diff
echo "print('Hello Girgit Distributed')" > main.py
girgit diff
```

### 2. Test Branching and 3-Way LCA Merge
```bash
# Create and switch to feature branch
girgit branch feature-auth
girgit checkout feature-auth

# Commit change on feature branch
echo "def login(): pass" >> main.py
girgit add main.py
girgit commit -m "Add login stub"

# Switch back to master and commit distinct change
girgit checkout master
echo "# License: MIT" >> README.txt
girgit add README.txt
girgit commit -m "Add license line"

# Execute 3-way merge
girgit merge feature-auth
# Automatically resolves non-overlapping changes and creates merge commit
```

### 3. Test Security Scanner
1. In the Web UI, open any repository and click the **Security** tab.
2. The scanner will parse all files in the current commit tree and display any exposed keys with automated redaction masks.

---

## 👥 Academic Credits & Team

This project was engineered as a capstone project at **Birla Vishwakarma Mahavidyalaya (BVM) Engineering College**, Information Technology Department.

### Project Guide
* **Prof. Disha Panchal** — Assistant Professor, Department of Information Technology, BVM Engineering College

### Engineering Team
* **Jagdish Pathakji** — *Team Lead & Architecture*
  - GitHub: [@JagdishPathakji](https://github.com/JagdishPathakji)
  - LinkedIn: [Jagdish Pathakji](https://www.linkedin.com/in/jagdishpathakji)
* **Rudra Gohil** — *Core DVCS Engine & Merkle Tree Subsystems*
* **Yug Dholakiya** — *Cloud Remote Synchronization & API Pipelines*
* **Harsh Tandel** — *UI/UX Platform & Security Analysis Engine*

---

<p align="center">
  <b>GIRGIT HUB © 2026 — Engineered with ❤️ for the Global Developer Community.</b>
</p>

