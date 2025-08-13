// ResetPasswordForm.tsx
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useResetPasswordMutation } from "../../redux/features/auth/authApi";
import { useLocation, useNavigate } from "react-router-dom";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  type PasswordFormType = z.infer<typeof passwordSchema>;

const ResetPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
  });
  const location = useLocation();
  const navigate = useNavigate();
  const identifier = location.state?.identifier.toString();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (data: PasswordFormType) => {
    try {
      await resetPassword({identifier: identifier, password: data.password }).unwrap();
      toast.success("Password reset successful");
      navigate('/login')
    } catch (error: any) {
      toast.error(error?.data?.message || "Password reset failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
