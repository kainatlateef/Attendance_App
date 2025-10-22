import React, { useState } from "react";
import LoginView from "./views/LoginView";

import AdminPortal from "./AdminPortal";

const AuthContainer = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [view, setView] = useState(user ? "app" : "login");

    const handleLogout = () => {
        setUser(null);
        setView("login");
    };

    return (
        <>
            {view === "login" && (
                <LoginView
                    onSwitchToRegister={() => setView("register")}
                    onLoginSuccess={(loggedUser) => {
                        setUser(loggedUser);
                        setView("app");
                        localStorage.setItem("user", JSON.stringify(loggedUser));
                    }}
                />
            )}

            {view === "app" && <AdminPortal user={user} onLogout={handleLogout} />}
        </>
    );
};

export default AuthContainer;
