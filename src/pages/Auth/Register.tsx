/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { useRegisterMutation } from "../../redux/features/auth/authApi";
import GoogleAuthButton from "./GoogleAuthButton";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ✅ Define separate schemas
const emailRegisterSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const phoneRegisterSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailRegisterSchema>;
type PhoneFormData = z.infer<typeof phoneRegisterSchema>;

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();

  // ✅ Choose correct schema based on activeTab
  const schema = useMemo(() => {
    return (
      activeTab === "email" ? emailRegisterSchema : phoneRegisterSchema
    ) as ZodType<any, any, any>;
  }, [activeTab]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // ✅ Unified submit handler
  const onSubmit = async (data: EmailFormData | PhoneFormData) => {
    try {
       await register({
        ...data,
        method: activeTab,
      }).unwrap();
      
      if (activeTab === "phone") {
        navigate("/otp-verification-register", {
          state: {
            phone: (data as PhoneFormData).phone,
          },
        });
      } else {
        toast.success("Go to your email to verify your account");
        navigate("/verify/pending");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
      
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-600">Sign up to get started</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">
                {(error as any)?.data?.message || "Registration failed"}
              </span>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (val === "email" || val === "phone") {
                setActiveTab(val);
              }
            }}
          >
            <TabsList className="grid grid-cols-2 mx-auto">
              <TabsTrigger value="email">Signup with Email</TabsTrigger>
              <TabsTrigger value="phone">Signup with Phone</TabsTrigger>
            </TabsList>

            {/* --- Email Signup Form --- */}
            <TabsContent value="email">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                {/* Name */}
                <div>
                  <Label>Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      {...formRegister("name")}
                      className="pl-10"
                      placeholder="Full name"
                    />
                  </div>
                  {errors.name && typeof errors.name.message === "string" && (
                    <p className="text-red-600 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      {...formRegister("email")}
                      className="pl-10"
                      placeholder="Email"
                    />
                  </div>
                  {errors.email && typeof errors.email.message === "string" && (
                    <p className="text-red-600 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <PasswordFields
                  formRegister={formRegister}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  errors={errors}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            {/* --- Phone Signup Form --- */}
            <TabsContent value="phone">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                {/* Name */}
                <div>
                  <Label>Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      {...formRegister("name")}
                      className="pl-10"
                      placeholder="Full name"
                    />
                  </div>
                  {errors.name && typeof errors.name.message === "string" && (
                    <p className="text-red-600 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label>Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      {...formRegister("phone")}
                      className="pl-10"
                      placeholder="Enter your phone number ex. 01700000000"
                    />
                  </div>
                  {errors.phone && typeof errors.phone.message === "string" && (
                    <p className="text-red-600 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <PasswordFields
                  formRegister={formRegister}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  errors={errors}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>

                
              </form>
            </TabsContent>
          </Tabs>
          <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleAuthButton isLogin={false} />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
        </Card>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
};

// ✅ Shared password fields for both tabs
const PasswordFields = ({
  formRegister,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors,
}: any) => (
  <>
    <div>
      <Label>Password</Label>
      <div className="relative mt-1">
        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          {...formRegister("password")}
          type={showPassword ? "text" : "password"}
          className="pl-10"
          placeholder="Password"
        />
        <button
          type="button"
          className="absolute right-3 top-2.5"
          onClick={() => setShowPassword((prev: boolean) => !prev)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-600 text-sm">{errors.password.message}</p>
      )}
    </div>

    <div>
      <Label>Confirm Password</Label>
      <div className="relative mt-1">
        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          {...formRegister("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          className="pl-10"
          placeholder="Confirm password"
        />
        <button
          type="button"
          className="absolute right-3 top-2.5"
          onClick={() => setShowConfirmPassword((prev: boolean) => !prev)}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errors.confirmPassword && (
        <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
      )}
    </div>
  </>
);

export default Register;
