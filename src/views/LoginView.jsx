import React, { useState } from "react";


const LoginView = ({ onSwitchToRegister, onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                onLoginSuccess(data.user); // ✅ call parent to switch to AdminPortal
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (forgotPassword) {
        return <ForgotPasswordView onBackToLogin={() => setForgotPassword(false)} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow w-full max-w-sm">
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="Abbey College Logo" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        placeholder="User name"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>




                {message && (
                    <p className={`mt-4 text-center ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginView;
