import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RegisterGoogle = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const token = response.credential;

      const verify = await fetch("https://air-invoice-server.vercel.app/auth/google/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await verify.json();

      if (!verify.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture,
      }));
      localStorage.setItem("userId", data.userId);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Registration Error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} />;
};

export default RegisterGoogle;
