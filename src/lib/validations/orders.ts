import { z } from 'zod';

// Order item validation schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Sản phẩm là bắt buộc'),
  quantity: z.number()
    .min(1, 'Số lượng phải ít nhất 1')
    .max(1000, 'Số lượng không được quá 1000')
    .int('Số lượng phải là số nguyên'),
  unitPrice: z.number()
    .min(0, 'Giá không được âm')
    .max(100000000, 'Giá không được quá 100 triệu VND'),
  requestedColor: z.string().max(100, 'Tên màu không được quá 100 ký tự').optional(),
});

// Order validation schema
export const orderSchema = z.object({
  customerId: z.string().min(1, 'Khách hàng là bắt buộc'),
  orderType: z.enum(['custom', 'product']).refine(() => true, {
    message: 'Loại đơn hàng không hợp lệ'
  }),
  customDescription: z.string().max(5000, 'Mô tả không được quá 5000 ký tự').optional(),
  items: z.array(orderItemSchema).optional(),
  totalAmount: z.number()
    .min(0, 'Tổng tiền không được âm')
    .max(1000000000, 'Tổng tiền không được quá 1 tỷ VND'),
  shippingCost: z.number()
    .min(0, 'Phí vận chuyển không được âm')
    .max(10000000, 'Phí vận chuyển không được quá 10 triệu VND'),
  originalShippingCost: z.number()
    .min(0, 'Giá vận chuyển gốc không được âm')
    .max(10000000, 'Giá vận chuyển gốc không được quá 10 triệu VND'),
  isFreeShipping: z.boolean().default(false),
  deliveryAddressId: z.string().optional(),
  notes: z.string().max(1000, 'Ghi chú không được quá 1000 ký tự').optional(),
})
.refine((data) => {
  // Custom orders must have description
  if (data.orderType === 'custom') {
    return data.customDescription && data.customDescription.trim().length > 0;
  }
  return true;
}, {
  message: 'Đơn tùy chỉnh phải có mô tả chi tiết',
  path: ['customDescription']
})
.refine((data) => {
  // Product orders must have items
  if (data.orderType === 'product') {
    return data.items && data.items.length > 0;
  }
  return true;
}, {
  message: 'Đơn sản phẩm phải có ít nhất một sản phẩm',
  path: ['items']
})
.refine((data) => {
  // Free shipping means shipping cost should be 0
  if (data.isFreeShipping) {
    return data.shippingCost === 0;
  }
  return true;
}, {
  message: 'Miễn phí vận chuyển thì phí ship phải bằng 0',
  path: ['shippingCost']
})
.refine((data) => {
  // When free shipping is applied, original shipping cost should be preserved
  if (data.isFreeShipping) {
    return data.originalShippingCost > 0;
  }
  return true;
}, {
  message: 'Khi miễn phí vận chuyển, giá ship gốc phải được lưu lại',
  path: ['originalShippingCost']
});

// Create order validation (stricter)
export const createOrderSchema = orderSchema.extend({
  customerId: z.string().min(1, 'Khách hàng là bắt buộc'),
});

// Update order validation
export const updateOrderSchema = orderSchema.partial().extend({
  id: z.string().min(1, 'ID đơn hàng là bắt buộc'),
});

// Order status update validation
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'ID đơn hàng là bắt buộc'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).refine(() => true, {
    message: 'Trạng thái đơn hàng không hợp lệ'
  }),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
});

// Order filter validation
export const orderFilterSchema = z.object({
  search: z.string().max(255).optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  orderType: z.enum(['custom', 'product']).optional(),
  customerId: z.string().optional(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).refine((data) => {
    return new Date(data.from) <= new Date(data.to);
  }, {
    message: 'Ngày bắt đầu phải trước ngày kết thúc'
  }).optional(),
  amountRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine((data) => {
    return data.min <= data.max;
  }, {
    message: 'Giá trị tối thiểu phải nhỏ hơn hoặc bằng giá trị tối đa'
  }).optional(),
  freeShipping: z.boolean().optional(),
});

// Bulk operations validation
export const bulkUpdateStatusSchema = z.object({
  orderIds: z.array(z.string().min(1))
    .min(1, 'Phải chọn ít nhất một đơn hàng')
    .max(100, 'Tối đa 100 đơn hàng cho mỗi lần cập nhật'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
});

export const bulkDeleteSchema = z.object({
  orderIds: z.array(z.string().min(1))
    .min(1, 'Phải chọn ít nhất một đơn hàng')
    .max(50, 'Tối đa 50 đơn hàng cho mỗi lần xóa'),
});

// Status transition validation
const statusTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Final state
  cancelled: [], // Final state
};

export const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const allowedTransitions = statusTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

// Types derived from schemas
export type OrderFormData = z.infer<typeof orderSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderData = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterData = z.infer<typeof orderFilterSchema>;
export type OrderItemData = z.infer<typeof orderItemSchema>;
export type BulkUpdateStatusData = z.infer<typeof bulkUpdateStatusSchema>;
export type BulkDeleteData = z.infer<typeof bulkDeleteSchema>;

// Validation helpers
export const validateOrder = (data: unknown) => {
  return orderSchema.safeParse(data);
};

export const validateCreateOrder = (data: unknown) => {
  return createOrderSchema.safeParse(data);
};

export const validateUpdateOrder = (data: unknown) => {
  return updateOrderSchema.safeParse(data);
};

export const validateUpdateOrderStatus = (data: unknown) => {
  return updateOrderStatusSchema.safeParse(data);
};

export const validateOrderFilter = (data: unknown) => {
  return orderFilterSchema.safeParse(data);
};

export const validateOrderItem = (data: unknown) => {
  return orderItemSchema.safeParse(data);
};

export const validateBulkUpdateStatus = (data: unknown) => {
  return bulkUpdateStatusSchema.safeParse(data);
};

export const validateBulkDelete = (data: unknown) => {
  return bulkDeleteSchema.safeParse(data);
};

// Error message helpers
export const getFieldError = (error: z.ZodError, fieldPath: string): string | undefined => {
  const fieldError = error.issues.find(err => err.path.join('.') === fieldPath);
  return fieldError?.message;
};

export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.issues.forEach(err => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return errors;
};

// Business logic validation helpers
export const validateOrderBusinessRules = (orderData: OrderFormData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check if custom order has sufficient description
  if (orderData.orderType === 'custom' && orderData.customDescription) {
    if (orderData.customDescription.trim().length < 10) {
      errors.push('Mô tả đơn tùy chỉnh phải có ít nhất 10 ký tự');
    }
  }

  // Check if product order has valid items
  if (orderData.orderType === 'product' && orderData.items) {
    if (orderData.items.length === 0) {
      errors.push('Đơn sản phẩm phải có ít nhất một sản phẩm');
    }

    // Check total amount matches item calculations
    const calculatedTotal = orderData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
      errors.push('Tổng tiền không khớp với tính toán từ các sản phẩm');
    }
  }

  // Check reasonable total amounts
  if (orderData.totalAmount > 50000000) { // 50 million VND
    errors.push('Tổng tiền đơn hàng quá lớn, vui lòng kiểm tra lại');
  }

  // Check shipping cost reasonableness
  if (orderData.shippingCost > orderData.totalAmount * 0.5) {
    errors.push('Phí vận chuyển cao bất thường so với giá trị đơn hàng');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};