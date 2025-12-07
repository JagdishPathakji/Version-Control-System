import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GitBranch, Star, Users } from "lucide-react";

type RepoFile = {
	path: string;
	type: "file" | "dir";
};

type Repo = {
	_id: string;
	name: string;
	description?: string;
	owner?: { username: string; email: string };
	starCount?: number;
	isStarredByUser?: boolean;
	visibility: string;
	content?: any[];
	driveId: string;
	parentId: string;
};

export default function GetPublicRepo() {
	const { repoName } = useParams();
	const [repo, setRepo] = useState<Repo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!repoName) {
			setLoading(false);
			setError("No repo name provided.");
			return;
		}

		const fetchRepo = async () => {
			try {
				setLoading(true);
				const res = await fetch(
					`https://version-control-system-mebn.onrender.com/repo/public/${repoName}`,
					{ credentials: "include" }
				);
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const data = await res.json();
				setRepo(data || null);
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Failed to load repository.");
			} finally {
				setLoading(false);
			}
		};

		fetchRepo();
	}, [repoName]);

	if (loading)
		return (
			<div className="min-h-[40vh] flex items-center justify-center text-gray-200">
				<div className="animate-pulse px-6 py-8 bg-[#1a1629]/80 border border-[#ff006e]/20 rounded-xl">
					Loading repository...
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-[40vh] flex items-center justify-center text-gray-200 px-4">
				<div className="bg-[#1a1629]/80 backdrop-blur rounded-xl p-6 border border-[#ff006e]/20">
					<p className="text-sm text-red-300">{error}</p>
					<Link to="/" className="text-sm text-[#00d9ff] hover:text-[#ffbe0b] mt-3 block">
						Back to home
					</Link>
				</div>
			</div>
		);

	if (!repo)
		return (
			<div className="min-h-[40vh] flex items-center justify-center text-gray-200">
				<div className="bg-[#1a1629]/80 rounded-xl p-6 border border-[#ff006e]/20">
					<p className="text-sm">Repository not found.</p>
					<Link to="/" className="text-sm text-[#00d9ff] hover:text-[#ffbe0b] mt-3 block">
						Back to home
					</Link>
				</div>
			</div>
		);

	return (
		<div className="px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-2xl p-6 shadow-lg">
					<div className="flex items-start gap-4">
						<div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#ff006e] to-[#00d9ff] flex items-center justify-center text-white shadow-md">
							<GitBranch className="w-6 h-6" />
						</div>

						<div className="flex-1">
							<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b]">
								{repo.name}
							</h2>
							<p className="text-sm text-gray-300 mt-1">{repo.description || "No description"}</p>

							<div className="mt-4 flex items-center gap-4 text-sm text-gray-200">
								<div className="inline-flex items-center gap-2">
									<Star className="w-4 h-4 text-[#ffbe0b]" />
									<span>{repo.starCount ?? 0} stars</span>
								</div>
								<div className="inline-flex items-center gap-2">
									<Users className="w-4 h-4 text-[#00d9ff]" />
									<span>{repo.content?.length ?? 0} commits</span>
								</div>
								{repo.owner && <span className="ml-2 text-xs text-gray-400">by {repo.owner.username}</span>}
							</div>
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-sm font-semibold text-gray-200 mb-3">Files</h3>
						<div className="grid grid-cols-1 gap-3">
							{repo.files && repo.files.length > 0 ? (
								repo.files.map((f, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between bg-[#0d0221]/40 border border-[#ff006e]/10 rounded-lg px-4 py-3 text-sm text-gray-100"
									>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-md bg-[#11101a]/60 flex items-center justify-center text-[#00d9ff]">
												{f.type === "dir" ? "📁" : "📄"}
											</div>
											<div className="truncate">{f.path}</div>
										</div>
										<div className="text-xs text-gray-400">{f.type}</div>
									</div>
								))
							) : (
								<div className="text-sm text-gray-400">No files to show.</div>
							)}
						</div>
					</div>

					<div className="mt-6 flex gap-3">
						<Link
							to="/"
							className="inline-block px-4 py-2 rounded-md bg-[#0d0221]/60 border border-[#ff006e]/20 text-[#00d9ff] hover:text-white hover:bg-gradient-to-r from-[#ff006e] to-[#00d9ff] transition-all"
						>
							Back
						</Link>

						<a
							href={`https://version-control-system-mebn.onrender.com/repo/public/${repoName}`}
							target="_blank"
							rel="noreferrer"
							className="inline-block px-4 py-2 rounded-md bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white font-semibold hover:opacity-95 transition-all"
						>
							View Raw
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

