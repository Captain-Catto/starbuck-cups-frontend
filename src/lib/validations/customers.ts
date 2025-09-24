import { z } from 'zod';

// Vietnamese phone number validation
const vietnamesePhoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;

// Address validation schema
export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Nhãn địa chỉ là bắt buộc').max(50, 'Nhãn địa chỉ không được quá 50 ký tự'),
  streetAddress: z.string().min(1, 'Địa chỉ là bắt buộc').max(500, 'Địa chỉ không được quá 500 ký tự'),
  ward: z.string().max(100, 'Phường/Xã không được quá 100 ký tự').optional(),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc').max(100, 'Quận/Huyện không được quá 100 ký tự'),
  city: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc').max(100, 'Tỉnh/Thành phố không được quá 100 ký tự'),
  postalCode: z.string().max(20, 'Mã bưu điện không được quá 20 ký tự').optional(),
  isDefault: z.boolean().default(false),
});

// Social account validation schema
export const socialAccountSchema = z.object({
  id: z.string().optional(),
  platform: z.enum(['facebook', 'zalo']).refine(() => true, {
    message: 'Nền tảng không hợp lệ'
  }),
  accountIdentifier: z.string().min(1, 'Tài khoản là bắt buộc').max(255, 'Tài khoản không được quá 255 ký tự'),
  displayName: z.string().max(255, 'Tên hiển thị không được quá 255 ký tự').optional(),
});

// Customer validation schema
export const customerSchema = z.object({
  fullName: z.string().max(255, 'Họ tên không được quá 255 ký tự').optional(),
  phone: z.string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(vietnamesePhoneRegex, 'Số điện thoại không đúng định dạng Việt Nam')
    .max(20, 'Số điện thoại không được quá 20 ký tự'),
  email: z.string()
    .email('Email không đúng định dạng')
    .max(255, 'Email không được quá 255 ký tự')
    .optional()
    .or(z.literal('')),
  addresses: z.array(addressSchema)
    .min(1, 'Phải có ít nhất một địa chỉ')
    .max(5, 'Tối đa 5 địa chỉ cho mỗi khách hàng')
    .refine((addresses) => {
      const defaultAddresses = addresses.filter(addr => addr.isDefault);
      return defaultAddresses.length === 1;
    }, {
      message: 'Phải có chính xác một địa chỉ mặc định'
    }),
  socialAccounts: z.array(socialAccountSchema)
    .max(6, 'Tối đa 6 tài khoản mạng xã hội')
    .refine((accounts) => {
      // Check max 3 accounts per platform
      const platformCounts = accounts.reduce((acc, account) => {
        acc[account.platform] = (acc[account.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.values(platformCounts).every(count => count <= 3);
    }, {
      message: 'Tối đa 3 tài khoản cho mỗi nền tảng'
    })
    .refine((accounts) => {
      // Check unique account identifiers per platform
      const seen = new Set();
      for (const account of accounts) {
        const key = `${account.platform}:${account.accountIdentifier}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
      }
      return true;
    }, {
      message: 'Không được trùng lặp tài khoản trên cùng nền tảng'
    }),
});

// Create customer validation (stricter)
export const createCustomerSchema = customerSchema.extend({
  phone: z.string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(vietnamesePhoneRegex, 'Số điện thoại không đúng định dạng Việt Nam'),
});

// Update customer validation (more flexible)
export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().min(1, 'ID khách hàng là bắt buộc'),
});

// Customer filter validation
export const customerFilterSchema = z.object({
  search: z.string().max(255).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  createdBy: z.string().optional(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
});

// Types derived from schemas
export type CustomerFormData = z.infer<typeof customerSchema>;
export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterData = z.infer<typeof customerFilterSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type SocialAccountData = z.infer<typeof socialAccountSchema>;

// Validation helpers
export const validateCustomer = (data: unknown) => {
  return customerSchema.safeParse(data);
};

export const validateCreateCustomer = (data: unknown) => {
  return createCustomerSchema.safeParse(data);
};

export const validateUpdateCustomer = (data: unknown) => {
  return updateCustomerSchema.safeParse(data);
};

export const validateCustomerFilter = (data: unknown) => {
  return customerFilterSchema.safeParse(data);
};

export const validateAddress = (data: unknown) => {
  return addressSchema.safeParse(data);
};

export const validateSocialAccount = (data: unknown) => {
  return socialAccountSchema.safeParse(data);
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