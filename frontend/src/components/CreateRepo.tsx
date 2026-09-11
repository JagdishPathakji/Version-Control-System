import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { clearCache } from '../utils/apiCache';
import { BookOpen, Globe, Lock } from 'lucide-react';

const CreateRepo = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'user';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('https://version-control-system-mebn.onrender.com/repo/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, isPrivate }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (res.ok && data.status) {
                clearCache('user/repos');
                navigate(`/repo/${username}/${name}`);
            } else {
                setError(data.message || 'Failed to create repository');
            }
        } catch (err) {
            setError('Server error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
            <Navbar username={username} setIsAuthenticated={() => {}} navigate={navigate} />

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
                <div className="border-b border-[#d0d7de] pb-4 mb-6">
                    <h1 className="text-2xl font-semibold text-[#1f2328]">Create a new repository</h1>
                    <p className="text-xs text-[#57606a] mt-1">
                        A repository contains all project files, including the revision history.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-[#ffebe9] border border-[#ff8182] text-[#cf222e] rounded-md text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Owner / Repo Name Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 pb-6 border-b border-[#d0d7de]">
                        <div>
                            <label className="block text-xs font-semibold text-[#1f2328] mb-1">
                                Owner
                            </label>
                            <div className="px-3 py-1.5 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f] shadow-sm">
                                {username}
                            </div>
                        </div>

                        <span className="text-xl text-[#57606a] pb-1 hidden sm:inline">/</span>

                        <div className="flex-1">
                            <label htmlFor="repo-name" className="block text-xs font-semibold text-[#1f2328] mb-1">
                                Repository name <span className="text-[#cf222e]">*</span>
                            </label>
                            <input
                                id="repo-name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value.replace(/\s+/g, '-'))}
                                placeholder="my-awesome-project"
                                className="w-full bg-white border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pb-6 border-b border-[#d0d7de]">
                        <label htmlFor="repo-description" className="block text-xs font-semibold text-[#1f2328] mb-1">
                            Description <span className="text-[#57606a] font-normal">(optional)</span>
                        </label>
                        <input
                            id="repo-description"
                            name="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description of your repository"
                            className="w-full bg-white border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] shadow-sm transition-all"
                        />
                    </div>

                    {/* Visibility: Public / Private Radios */}
                    <div className="space-y-3 pb-6 border-b border-[#d0d7de]">
                        <div 
                            onClick={() => setIsPrivate(false)}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-white cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                name="visibility"
                                checked={!isPrivate}
                                onChange={() => setIsPrivate(false)}
                                className="mt-1"
                            />
                            <div className="flex items-start gap-2.5">
                                <Globe className="w-5 h-5 text-[#57606a] mt-0.5" />
                                <div>
                                    <div className="text-xs font-semibold text-[#1f2328]">Public</div>
                                    <p className="text-xs text-[#57606a]">
                                        Anyone on the internet can see this repository. You choose who can commit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => setIsPrivate(true)}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-white cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                name="visibility"
                                checked={isPrivate}
                                onChange={() => setIsPrivate(true)}
                                className="mt-1"
                            />
                            <div className="flex items-start gap-2.5">
                                <Lock className="w-5 h-5 text-[#57606a] mt-0.5" />
                                <div>
                                    <div className="text-xs font-semibold text-[#1f2328]">Private</div>
                                    <p className="text-xs text-[#57606a]">
                                        You choose who can see and commit to this repository.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-4 py-2 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating repository...' : 'Create repository'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateRepo;
