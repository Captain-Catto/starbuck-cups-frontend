import { Bell, MessageCircle, CheckCircle2 } from "lucide-react";

interface NotificationStatsProps {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  loading?: boolean;
}

export function NotificationStats({
  totalCount,
  unreadCount,
  readCount,
  loading = false,
}: NotificationStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <div>
                <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng thông báo",
      value: totalCount,
      icon: Bell,
    },
    {
      title: "Chưa đọc",
      value: unreadCount,
      icon: MessageCircle,
    },
    {
      title: "Đã đọc",
      value: readCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
