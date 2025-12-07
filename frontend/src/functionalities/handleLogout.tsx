// handleLogout.ts
export default async function handleLogout(setIsAuthenticated, navigate) {
  try {
    const response = await fetch("https://version-control-system-mebn.onrender.com/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const res = await response.json();
    if (res.status === true) {
      alert(res.message);
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    } else {
      alert(`Logout Failed: ${res.message}`);
    }
  } catch (error) {
    console.log("Error during logout:", error);
    alert("Error occurred during logout");
  }
}
