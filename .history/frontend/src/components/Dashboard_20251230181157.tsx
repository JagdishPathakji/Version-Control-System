import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import getData from "../functionalities/getData";
import getRepo from "../functionalities/getRepo";
import getAllProfile from "../functionalities/getAllProfile";
import getAllRepo from "../functionalities/getAllRepo";

import Navbar from "./Navbar";
import { GitBranch, Star, Users, Bot, User } from "lucide-react";

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username") || "";

  // ✅ USER DATA
  const {
    data: userData,
    error: userError,
  } = useQuery({
    queryKey: ["user", email],
    queryFn: () => getData(email),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ✅ USER REPOS
  const {
    data: userRepo = [],
  } = useQuery({
    queryKey: ["myRepos"],
    queryFn: getRepo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ✅ PUBLIC REPOS
  const {
    data: publicRepos = [],
  } = useQuery({
    queryKey: ["publicRepos"],
    queryFn: getAllRepo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ✅ PUBLIC PROFILES
  const {
    data: publicProfiles = [],
  } = useQuery({
    queryKey: ["publicProfiles"],
    queryFn: getAllProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ✅ AUTH + USERNAME SIDE EFFECTS
  useEffect(() => {
    if (userError?.message === "login" || userData?.status === "login") {
      alert("Session expired. Please log in again.");
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }

    if (userData?.username) {
      localStorage.setItem("username", userData.username);
    }
  }, [userError, userData, navigate, setIsAuthenticated]);

  function openOwnRepo(repoName) {
    navigate(`/repo/${repoName}`);
  }

  function getPublicRepo(repoName) {
    navigate(`/repo/public/${repoName}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      <Navbar
        username={username}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      {/* 🔥 REST OF YOUR JSX IS 100% UNCHANGED 🔥 */}
      {/* (everything below this is already correct) */}
    </div>
  );
}
