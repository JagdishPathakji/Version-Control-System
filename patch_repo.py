import sys

with open('frontend/src/components/RepositoryView.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

state_insertion = """    const [selectedBranch, setSelectedBranch] = useState<string>(targetOid ? targetOid.substring(0, 7) : 'master');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMerging, setIsMerging] = useState(false);

    const handleMerge = async () => {
        if (!confirm(`Are you sure you want to merge ${selectedBranch} into master?`)) return;
        setIsMerging(true);
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseBranch: 'master', compareBranch: selectedBranch }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                alert("Successfully merged into master!");
                clearCache(`/repo/${username}/${repoName}`);
                navigate(`/repo/${username}/${repoName}`);
                window.location.reload();
            } else {
                alert(data.message || "Failed to merge");
            }
        } catch (err: any) {
            alert(err.message || "Error merging");
        } finally {
            setIsMerging(false);
        }
    };"""

orig = orig.replace("    const [selectedBranch, setSelectedBranch] = useState<string>(targetOid ? targetOid.substring(0, 7) : 'master');\n    const [loading, setLoading] = useState(true);\n    const [error, setError] = useState('');", state_insertion)

button_target = """                                </div>
                                <button 
                                    onClick={() => navigate(`/repo/${username}/${repoName}/commits/${selectedBranch}`)}
                                    className="text-gray-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 transition-colors"
                                >"""

button_replacement = """                                </div>
                                <div className="flex gap-4">
                                    {selectedBranch !== 'master' && !targetOid && (
                                        <button 
                                            onClick={handleMerge}
                                            disabled={isMerging}
                                            className="px-3 py-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold text-sm rounded transition-colors"
                                        >
                                            {isMerging ? 'Merging...' : 'Merge into master'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/repo/${username}/${repoName}/commits/${selectedBranch}`)}
                                        className="text-gray-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 transition-colors"
                                    >"""

orig = orig.replace(button_target, button_replacement)

# Also close the flex gap-4 div
button_target_end = """                                    dY ' {commits.length} Commits &gt;
                                </button>
                            </div>"""

button_replacement_end = """                                    dY ' {commits.length} Commits &gt;
                                    </button>
                                </div>
                            </div>"""
orig = orig.replace(button_target_end, button_replacement_end)

with open('frontend/src/components/RepositoryView.tsx', 'w', encoding='utf-8') as f:
    f.write(orig)
