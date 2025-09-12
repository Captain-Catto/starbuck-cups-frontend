export interface MessengerProductInfo {
  productName: string;
  productUrl: string;
  color?: string;
  capacity?: string;
  category?: string;
  quantity?: number;
}

export interface MessengerCartInfo {
  products: MessengerProductInfo[];
  totalItems: number;
}

/**
 * Generate pre-filled message for single product consultation
 */
export function generateProductMessage(product: MessengerProductInfo): string {
  const {
    productName,
    productUrl,
    color,
    capacity,
    category,
    quantity = 1,
  } = product;

  const message = `Xin chào! Tôi muốn tư vấn về sản phẩm:

📦 Sản phẩm: ${productName}
🔗 Link: ${productUrl}
${category ? `📂 Danh mục: ${category}` : ""}
${color ? `🎨 Màu sắc: ${color}` : ""}
${capacity ? `📏 Dung tích: ${capacity}` : ""}
${quantity > 1 ? `📊 Số lượng: ${quantity}` : ""}

Vui lòng tư vấn giá và thông tin chi tiết. Cảm ơn!`;

  return message;
}

/**
 * Generate pre-filled message for cart consultation
 */
export function generateCartMessage(cart: MessengerCartInfo): string {
  const { products, totalItems } = cart;

  let message = `Xin chào! Tôi muốn tư vấn báo giá cho ${totalItems} sản phẩm sau:\n\n`;

  products.forEach((product, index) => {
    message += `${index + 1}. ${product.productName}\n`;
    if (product.color) message += `   🎨 Màu: ${product.color}\n`;
    if (product.capacity) message += `   📏 Dung tích: ${product.capacity}\n`;
    if (product.quantity && product.quantity > 1)
      message += `   📊 SL: ${product.quantity}\n`;
    message += `   🔗 ${product.productUrl}\n\n`;
  });

  message += `Vui lòng tư vấn giá tổng và thông tin giao hàng. Cảm ơn!`;

  return message;
}

/**
 * Open Zalo with pre-filled message
 * Zalo URL scheme cho mobile và web
 */
export function openZalo(phoneNumber: string, message: string): void {
  const encodedMessage = encodeURIComponent(message);

  // Zalo URL schemes
  const zaloAppUrl = `zalo://conversation?phone=${phoneNumber}&message=${encodedMessage}`;
  const zaloWebUrl = `https://chat.zalo.me/${phoneNumber}`;

  // Copy message to clipboard first for better UX
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {
      console.warn("Could not copy message to clipboard");
    });
  }

  // Detect if mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Try opening Zalo app first on mobile
    const timeout = setTimeout(() => {
      // Fallback to web version if app doesn't open
      window.open(zaloWebUrl, "_blank");
    }, 2500);

    // Try to open app
    window.location.href = zaloAppUrl;

    // Clear timeout if app opens successfully
    const handleBlur = () => {
      clearTimeout(timeout);
      window.removeEventListener("blur", handleBlur);
    };
    window.addEventListener("blur", handleBlur);
  } else {
    // Desktop: open web version
    window.open(zaloWebUrl, "_blank");
  }
}

/**
 * Contact for single product via Zalo
 */
export function contactViaZalo(
  product: MessengerProductInfo,
  phoneNumber: string
): void {
  const message = generateProductMessage(product);
  openZalo(phoneNumber, message);
}

/**
 * Contact for entire cart via Zalo
 */
export function contactCartViaZalo(
  cart: MessengerCartInfo,
  phoneNumber: string
): void {
  const message = generateCartMessage(cart);
  openZalo(phoneNumber, message);
}
