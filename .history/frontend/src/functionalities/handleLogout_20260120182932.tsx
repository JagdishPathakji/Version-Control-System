// handleLogout.ts
export default async function handleLogout(setIsAuthenticated, navigate) {
  try {
    const response = await fetch("https://version-control-system-mebn.onrender.com/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const res = await response.json();
    return res
  } catch (error) {
    console.log("Error during logout:", error);
    
  }
}
