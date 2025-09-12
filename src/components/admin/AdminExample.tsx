// Example usage trong admin component
import { useAdminAuth } from "@/hooks/useAuthRefresh";

export default function AdminExample() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <div>Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <div>Chuyển hướng đến trang đăng nhập...</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Token sẽ được tự động refresh khi cần thiết</p>
    </div>
  );
}
