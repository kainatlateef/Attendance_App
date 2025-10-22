import React, { useState } from "react";

const ForgotPasswordView = ({ onBackToLogin }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/abbey_app/Abbey_backend/forgot_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            console.error("Forgot password error:", error);
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow w-full max-w-sm">
                <h2 className="text-center text-xl font-bold mb-4">Forgot Password</h2>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white p-2 rounded"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="text-red-500 p-2"
                        >
                            Back
                        </button>
                    </div>
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

export default ForgotPasswordView;
