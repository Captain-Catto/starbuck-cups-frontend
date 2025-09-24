export interface NotificationData {
  id: string;
  type: "consultation" | "order" | "user" | "system" | "payment" | "inventory";
  title: string;
  message: string;
  data?:
    | ConsultationData
    | OrderData
    | UserData
    | SystemData
    | PaymentData
    | InventoryData;
  timestamp: string;
  read?: boolean;
}

export interface ConsultationData {
  consultationId: string;
  customerName: string;
  items: number;
}

export interface OrderData {
  orderId: string;
  customerName: string;
  totalAmount: number;
}

export interface UserData {
  userId: string;
  userName: string;
  action: "registered" | "updated" | "deleted";
}

export interface SystemData {
  level: "info" | "warning" | "error";
  module: string;
  details?: string;
}

export interface PaymentData {
  orderId: string;
  amount: number;
  status: "success" | "failed" | "pending";
  customerName: string;
}

export interface InventoryData {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  action: "low_stock" | "out_of_stock" | "restocked";
}

export interface ConsultationNotification extends NotificationData {
  type: "consultation";
  data: ConsultationData;
}

export interface OrderNotification extends NotificationData {
  type: "order";
  data: OrderData;
}

export interface UserNotification extends NotificationData {
  type: "user";
  data: UserData;
}

export interface SystemNotification extends NotificationData {
  type: "system";
  data: SystemData;
}

export interface PaymentNotification extends NotificationData {
  type: "payment";
  data: PaymentData;
}

export interface InventoryNotification extends NotificationData {
  type: "inventory";
  data: InventoryData;
}

export type NotificationPayload =
  | ConsultationNotification
  | OrderNotification
  | UserNotification
  | SystemNotification
  | PaymentNotification
  | InventoryNotification;

export interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
}
