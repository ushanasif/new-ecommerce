import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../MainLayout/MainLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyAccount from "../pages/Auth/VerifyAccount";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import PrivateRoute from "./PrivateRoute";
import OtpVerification from "../pages/Auth/OtpVerification";
import OtpVerificationReg from "../pages/Auth/OtpVerificationReg";
import Pending from "../pages/Auth/Pending";
import ProfilePage from "../pages/Dashboard/Common/ProfilePage";
import { ClinetLayout } from "../pages/Dashboard/Client/layout/ClientLayout";
import ClientDashboard from "../pages/Dashboard/Client/layout/ClientDashboard";
import MyOrders from "../pages/Dashboard/Client/myorders/MyOrders";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/Products/ProductDetails";
import Wishlist from "../pages/wishlist/wishlist";
import CheckoutForm from "../pages/checkout/Checkout";
import PaymentSuccess from "../pages/Payment/PaymentSuccess";
import PaymentFailed from "../pages/Payment/PaymentFailed";
import RefundList from "../pages/Dashboard/Client/refund/RefundList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "/products/:id",
        element: <ProductDetails />,
      },
      {
        path: "wishlist",
        element: <Wishlist />,
      },
      {
         path: "checkout",
         element: <CheckoutForm />
      },
      {
        path: "/payment/success/:tranId",
        element: <PaymentSuccess />
      },
      {
        path: "/payment/failed/:tranId",
        element: <PaymentFailed />
      }
    ],
  },

  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false} >
        <Login />
      </ProtectedRoute>
    ),
  },
   {
    path: "/unauthorized",
    element: <div>Unauthorized Access</div>,
  },

  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/otp-verification-register",
    element: <OtpVerificationReg />
  },
  {
    path: "/otp-verification",
    element: <OtpVerification />
  },
  {
    path: "/verify/pending",
    element: <Pending />
  },
  {
    path: "/user/verify/:token",
    element: <VerifyAccount />,
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
 



{
  path: "/user",
  element: <PrivateRoute allowedRoles={["user"]} />,
  children: [
    {
      path: "",
      element: <ClinetLayout />,
      children: [
        {
          index: true, // ✅ default route
          element: <ClientDashboard />
        },
        {
          path: "profile",
          element: <ProfilePage />
        },
        {
          path: "my-orders",
          element: <MyOrders />
        },
        {
          path: "refund-request",
          element: <RefundList />
        }
      ]
    }
  ]
}


]);

export default router;
