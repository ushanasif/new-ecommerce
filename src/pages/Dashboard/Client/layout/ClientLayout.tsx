import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Menu,
  X,
  LogOut,
  ListOrdered,
  Home,
  HandCoins,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../../redux/hooks";
import { logout } from "../../../../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { useLogoutUserMutation } from "../../../../redux/features/auth/authApi";


const sidebarItems = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
 
  {
    title: "My Orders",
    href: "/user/my-orders",
    icon: ListOrdered,
  },
  {
    title: "Refund Request",
    href: "/user/refund-request",
    icon: HandCoins
  },
  {
    title: "Settings",
    href: "/user/profile",
    icon: Settings,
  },
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
];

export function ClinetLayout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useAppDispatch();
  const [logoutUser] = useLogoutUserMutation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleLogout = async() => {
    dispatch(logout());
    await logoutUser();
    toast.success("Logged out successfully");
    localStorage.removeItem("cart");
    navigate("/login")
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Header with Toggle Button */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            className="mr-4"
          >
            {drawerOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h2 className="text-xl font-bold text-gray-800">User Dashboard</h2>
        </div>
      </div>

      {/* Sidebar/Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 
        w-64 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ease-in-out
        ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="pt-20 px-6">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleMenuItemClick}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start"
              
            >
              <LogOut className="mr-2 h-4 w-4"  />
              Logout
            </Button>
          </nav>
        </div>
      </div>

      {/* Overlay when drawer is open (mobile only) */}
      {drawerOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleDrawer}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto pt-16 transition-all duration-300 ${
          drawerOpen ? "lg:ml-64" : ""
        }`}
      >
        <div className="container mx-auto p-4 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
