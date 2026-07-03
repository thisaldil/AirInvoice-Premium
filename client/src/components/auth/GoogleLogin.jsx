import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";
import { saveGuidePreference } from "../../utils/onboarding";

const LoginGoogle = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
            navigate("/dashboard");
        }
    }, []);

    const handleSuccess = async (response) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/google/callback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential }),
            });

            if (res.status === 404) {
                localStorage.clear();
                sessionStorage.clear();
                toast.info("Account not registered. Please register first.");
                return;
            }

            if (!res.ok) throw new Error("Failed to authenticate");

            const data = await res.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        name: data.user.name,
                        picture: data.user.picture,
                        email: data.user.email,
                    })
                );
                localStorage.setItem("userId", data.userId);
                saveGuidePreference(data);
                setIsAuthenticated(true);
                window.location.href = "/dashboard";
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Login failed. Please try again.");
        }
    };

    return (
        <GoogleOAuthProvider clientId="536656085214-lflgf5vpabtlh57mt6jj5f4v2qpdu6o0.apps.googleusercontent.com">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.error("Google Login Failed")}
            />
        </GoogleOAuthProvider>
    );
};

export default LoginGoogle;
