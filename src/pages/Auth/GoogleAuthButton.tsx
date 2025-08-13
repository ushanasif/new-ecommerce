/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuthMutation } from "../../redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/features/auth/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/card";

const GoogleAuthButton = ({ isLogin = true }: { isLogin?: boolean }) => {
  const [googleAuth] = useGoogleAuthMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/'

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google");
      }

      

      const response = await googleAuth({
        authCode: credentialResponse.credential, // This is actually the ID token
      });

      // Handle error response
      if ('error' in response) {
        const error = response.error as FetchBaseQueryError;
        let errorMessage = "Google authentication failed";
        
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data as any;
          errorMessage = errorData?.message || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle success response
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const { success, data } = response.data;
      
      if (!success || !data) {
        throw new Error("Authentication failed - missing required fields");
      }

      const { user, accessToken } = data;

      if (!user || !accessToken) {
        throw new Error("Authentication failed - missing user or token");
      }

      dispatch(
        setUser({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            profileImg: user.profileImg || "",
            phone: user.phone || "",
            address: user.address || "",
            googleId: user.googleId || ""
          },
          token: accessToken
        })
      );

      toast.success("Google authentication successful!");
       setTimeout(() => {
        navigate(from, {replace: true})
      }, 5)
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorMessage = err?.message || "Google login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="flex justify-center p-4">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.error("Google login failed");
          toast.error("Google login failed. Please try again.");
        }}
        useOneTap={false} // Disable one-tap for debugging
        text={isLogin ? "signin_with" : "signup_with"}
        shape="pill"
        size="large"
        theme="outline"
      />
    </Card>
  );
};

export default GoogleAuthButton;