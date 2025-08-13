/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useNavigate } from "react-router-dom";

import { useForgotPasswordMutation } from "../../redux/features/auth/authApi";

import {Mail, AlertCircle } from "lucide-react";


import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required").trim(),
});

type formData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
 
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: formData) => {
  
    try {
      await forgotPassword(data).unwrap();
      

      navigate("/otp-verification", {
          state: {
            identifier: (data as formData).identifier,
          },
      });

     
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error("Login failed");
    }
  };

  return (
    
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8">
            <div className="text-center">
            
              <p className="mt-2 text-sm text-gray-600">
                Enter Email or Phone
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">
                  {(error as any)?.data?.message || "Login failed"}
                </span>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identifier">Email or Phone</Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register("identifier")}
                      type="text"
                      className="pl-10"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                
              </div>

              

              <div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Sending otp..." : "Send OTP"}
                </Button>
              </div>


              

              
            </form>

            
          </Card>
        </div>
      </div>
   
  );
};

export default ForgotPassword;
