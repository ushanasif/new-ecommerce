import type React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, User, Lock } from "lucide-react";
import toast from "react-hot-toast";

import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
} from "../../../redux/features/auth/authApi";
import { useAppSelector } from "../../../redux/hooks";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { skipToken } from "@reduxjs/toolkit/query";


// Schema definitions
const updateProfileSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImg: z.string().optional(),
});


const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdateProfileData = z.infer<typeof updateProfileSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
 
  const { user } = useAppSelector((state) => state.auth);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    data: userData,
    isLoading: isUserLoading
  } = useGetProfileQuery(user?._id ?? skipToken);
 

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      profileImg: ""
    },
  });

  const {
    reset: resetProfileForm,
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 🛠️ Sync form with userData
  useEffect(() => {
    if (userData && !isDirty) {
      resetProfileForm({
        name: userData?.data?.name,
        email: userData?.data?.email,
        phone: userData.data?.phone || "",
        address: userData.data?.address || "",
        profileImg: userData.data?.profileImg || ""
      });
    }
  }, [userData, isDirty, resetProfileForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
      if (!user?._id) {
    toast.error("User ID not found");
    return;
  }
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    formData.append("id", user?._id)
    
    try {
      await uploadImage(formData).unwrap();
      toast.success("Profile image updated successfully");
      
      setImageFile(null);
      setImagePreview(null);
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const onProfileSubmit = async (data: UpdateProfileData) => {
  try {
    const filteredData = Object.fromEntries(
      Object.entries({ ...data, id: user?._id }).filter(([_, value]) => value !== undefined)
    );

    await updateProfile(filteredData).unwrap();
    toast.success("Profile updated successfully");
  } catch {
    toast.error("Failed to update profile");
  }
};

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    try {
      const updatedData = {...data, id:user?._id}
      await changePassword(updatedData).unwrap();
      toast.success("Password changed successfully");
      resetPasswordForm();
    } catch {
      toast.error("Failed to change password");
    }
  };

  const currentUser = userData?.data?.name;

  if(isUserLoading){
      return <p>Loading...</p>
  }
  

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Profile Image
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...registerProfile("name")} placeholder="Enter your full name" />
                    {profileErrors.name && <p className="text-sm text-red-500">{profileErrors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...registerProfile("email")} placeholder="Enter your email" />
                    {profileErrors.email && <p className="text-sm text-red-500">{profileErrors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...registerProfile("phone")} placeholder="Enter your phone number" />
                    {profileErrors.phone && <p className="text-sm text-red-500">{profileErrors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...registerProfile("address")} placeholder="Enter your address" />
                  {profileErrors.address && <p className="text-sm text-red-500">{profileErrors.address.message}</p>}
                </div>
                <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                  {passwordErrors.currentPassword && <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                  {passwordErrors.newPassword && <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} />
                  {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={isChangingPassword} className="w-full md:w-auto">
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Upload Tab */}
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Upload a new profile image. Images will be processed by our backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={imagePreview || userData?.data?.profileImg} alt={currentUser || "Profile"} />
                  <AvatarFallback className="text-2xl">
                    {currentUser?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors">
                      <Camera className="h-4 w-4" />
                      <span>Choose Image</span>
                    </div>
                  </Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF (max 5MB)</p>
                </div>

                {imageFile && (
                  <div className="flex space-x-2">
                    <Button onClick={handleImageUpload} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
