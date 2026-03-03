"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
import { useAdminAuth } from "@/hooks/useStandardAuth";
import { useSocket } from "@/hooks/useSocket";
import { usePendingConsultations } from "@/hooks/admin/usePendingConsultations";
import { useConsultationSocket } from "@/hooks/useConsultationSocket";
import { NotificationDropdown } from "@/components/admin/NotificationDropdown";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Palette,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Image,
  BarChart3,
  Megaphone,
} from "lucide-react";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
  submenu?: { label: string; path: string }[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  // Sử dụng standardized admin authentication hook
  const { isAdminReady, logout: performLogout } = useAdminAuth();

  // Initialize Socket.IO for real-time notifications
  const { isConnected, unreadCount } = useSocket();

  // Get pending consultations count
  const { pendingCount, refetch: refetchPendingCount } =
    usePendingConsultations();

  // Listen for consultation socket events to refresh pending count
  useConsultationSocket({
    onConsultationUpdate: refetchPendingCount,
    enabled: isConnected,
  });

  // Generate sidebar items with realtime data
  const getSidebarItems = (): SidebarItem[] => [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: Package,
      label: "Danh sách sản phẩm",
      path: "/admin/products",
    },
    {
      icon: ShoppingCart,
      label: "Đơn hàng",
      path: "/admin/orders",
    },
    {
      icon: Users,
      label: "Khách hàng",
      path: "/admin/customers",
    },
    {
      icon: MessageSquare,
      label: "Tư vấn",
      path: "/admin/consultations",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      icon: Palette,
      label: "Màu sắc",
      path: "/admin/colors",
    },
    {
      icon: Layers,
      label: "Dung tích",
      path: "/admin/capacities",
    },
    {
      icon: Package,
      label: "Danh mục",
      path: "/admin/categories",
    },
    {
      icon: Image,
      label: "Hero Images",
      path: "/admin/hero-images",
    },
    {
      icon: Megaphone,
      label: "Banner quảng cáo",
      path: "/admin/promotional-banners",
    },
    {
      icon: BarChart3,
      label: "Thống kê",
      path: "/admin/statistics",
    },
    {
      icon: Settings,
      label: "Cấu hình Hiệu ứng",
      path: "/admin/settings",
    },
  ];

  const sidebarItems = getSidebarItems();

  // Authentication check is handled by useAdminAuth hook automatically
  // No need for manual redirect logic here

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (profileDropdownOpen && !target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
      if (
        notificationDropdownOpen &&
        !target.closest(".notification-dropdown")
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen, notificationDropdownOpen]);

  const handleLogout = async () => {
    await performLogout();
    // Redirect is handled automatically by the standardized hook
  };

  const toggleSubmenu = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
      return "Chào buổi sáng";
    } else if (hour >= 11 && hour < 14) {
      return "Chào buổi trưa";
    } else if (hour >= 14 && hour < 18) {
      return "Chào buổi chiều";
    } else if (hour >= 18 && hour < 22) {
      return "Chào buổi tối";
    } else {
      return "Chào đêm khuya";
    }
  };

  if (!isAdminReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.path}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? "bg-gray-700 text-white border-r-2 border-white"
                          : "text-white hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-white" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-gray-700 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                    {expandedItems.includes(item.path) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                              pathname === subItem.path
                                ? "bg-gray-700 text-white"
                                : "text-white hover:bg-gray-700"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? "bg-gray-700 text-white border-r-2 border-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-1 text-xs bg-gray-700 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-700"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {getGreeting()}
                </h2>
                <p className="text-sm text-white">{user?.name || "Admin"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                  className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  title={`${unreadCount} thông báo chưa đọc${
                    isConnected ? " (Real-time)" : " (Offline)"
                  }`}
                >
                  <Bell className="w-5 h-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-white text-black text-xs rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {!isConnected && (
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-gray-500 rounded-full"></span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={notificationDropdownOpen}
                  onClose={() => setNotificationDropdownOpen(false)}
                  unreadCount={unreadCount}
                />
              </div>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-white">
                    {user?.name || "Admin"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 rounded-lg border border-gray-700 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-white">
                          {user?.email || "admin@example.com"}
                        </p>
                      </div>

                      <Link
                        href="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-white" />
                        Hồ sơ cá nhân
                      </Link>

                      <Link
                        href="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-white" />
                        Cài đặt
                      </Link>

                      <div className="border-t border-gray-700 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-white" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-black">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
