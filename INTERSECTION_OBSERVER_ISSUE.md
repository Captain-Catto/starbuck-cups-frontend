# Intersection Observer với Dynamic Content - Giải pháp cho vấn đề Animation không hoạt động

## 📝 Tóm tắt vấn đề

Khi implement scroll-triggered animations sử dụng Intersection Observer trong React component có dynamic content (fetch data từ API), thường gặp vấn đề animations không hoạt động khi:

1. **Lần đầu load page**: Products được fetch nhưng không hiển thị
2. **Khi thay đổi category**: Click category mới, products được fetch nhưng không hiển thị animation
3. **Timing issue**: Intersection Observer setup trước khi DOM elements được render

## 🔍 Nguyên nhân

### 1. **Race Condition giữa Observer và DOM Rendering**

```typescript
// ❌ Problematic code
useEffect(() => {
  const observer = new IntersectionObserver(/* config */);

  // DOM chưa sẵn sàng tại thời điểm này
  const rowElements = document.querySelectorAll("[data-row]");
  // rowElements.length = 0

  rowElements.forEach((el) => observer.observe(el)); // Không observe được gì
}, [products.length]); // Chỉ trigger khi length thay đổi
```

### 2. **Dependency Array không đầy đủ**

```typescript
// ❌ Problematic dependency
useEffect(() => {
  // Setup observer...
}, [products.length]); // Thiếu selectedCategory
```

Khi `selectedCategory` thay đổi nhưng `products.length` vẫn giữ nguyên (36 products), Observer không được re-initialize.

### 3. **State Reset không đồng bộ**

```typescript
// ❌ Manual reset không hiệu quả
const handleCategorySelect = (categorySlug: string | null) => {
  setSelectedCategory(categorySlug);
  setVisibleRows(new Set()); // Reset thủ công, không đồng bộ với Observer
};
```

## ✅ Giải pháp

### 1. **Implement Retry Mechanism**

```typescript
useEffect(() => {
  // Reset state khi setup observer mới
  setVisibleRows(new Set());

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rowIndex = parseInt(
            entry.target.getAttribute("data-row") || "0"
          );
          setVisibleRows((prev) => new Set([...prev, rowIndex]));
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px 0px -50px 0px",
    }
  );

  // 🎯 Retry mechanism
  const observeRows = (retryCount = 0) => {
    const rowElements = document.querySelectorAll("[data-row]");

    if (rowElements.length > 0) {
      rowElements.forEach((el) => observer.observe(el));
    } else if (retryCount < 10) {
      // Retry tối đa 10 lần (2 giây)
      setTimeout(() => observeRows(retryCount + 1), 200);
    }
  };

  // Delay ban đầu + retry mechanism
  const timeoutId = setTimeout(() => observeRows(), 300);

  return () => {
    clearTimeout(timeoutId);
    const rowElements = document.querySelectorAll("[data-row]");
    rowElements.forEach((el) => observer.unobserve(el));
  };
}, [products.length, selectedCategory]); // 🎯 Thêm selectedCategory vào dependencies
```

### 2. **Cải thiện State Management**

```typescript
// ✅ Auto-reset thông qua Observer useEffect
const handleCategorySelect = (categorySlug: string | null) => {
  setSelectedCategory(categorySlug);
  // Không cần manual reset - Observer sẽ tự reset khi re-run
};
```

### 3. **Đảm bảo DOM Structure đúng**

```tsx
{
  productRows.map((row, rowIndex) => (
    <div
      key={rowIndex}
      data-row={rowIndex} // 🎯 Attribute quan trọng cho Observer
      className={`transition-all duration-1000 ${
        visibleRows.has(rowIndex)
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
    >
      {/* Product items */}
    </div>
  ));
}
```

## 🚀 Kết quả

**Trước khi fix:**

- `Found row elements: 0` → Animation không hoạt động
- Click category → Products fetch nhưng không hiển thị
- Animation chỉ chạy lần đầu

**Sau khi fix:**

- `Found row elements: 6` → Observer tìm thấy elements
- `Row visible: 0, 1, 2...` → Animation trigger đúng
- Category switching → Smooth animations
- Retry mechanism đảm bảo Observer luôn tìm được elements

## 🎯 Best Practices

### 1. **Luôn implement retry mechanism cho dynamic content**

```typescript
const observeWithRetry = (observer, maxRetries = 10, delay = 200) => {
  const tryObserve = (retryCount = 0) => {
    const elements = document.querySelectorAll("[data-row]");

    if (elements.length > 0) {
      elements.forEach((el) => observer.observe(el));
    } else if (retryCount < maxRetries) {
      setTimeout(() => tryObserve(retryCount + 1), delay);
    }
  };

  return tryObserve;
};
```

### 2. **Dependencies đầy đủ trong useEffect**

```typescript
// ✅ Include tất cả các state ảnh hưởng đến DOM structure
useEffect(() => {
  // Observer setup...
}, [products.length, selectedCategory, filterState, sortOrder]);
```

### 3. **Cleanup đúng cách**

```typescript
useEffect(() => {
  // Setup...

  return () => {
    clearTimeout(timeoutId);
    // Unobserve tất cả elements
    document.querySelectorAll("[data-row]").forEach((el) => {
      observer.unobserve(el);
    });
  };
}, [dependencies]);
```

### 4. **State reset tự động**

```typescript
useEffect(() => {
  // Tự động reset state khi setup observer mới
  setVisibleRows(new Set());

  // Observer setup...
}, [dependencies]);
```

## 📚 Tham khảo

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React useEffect Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [Timing Issues in React](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)

## 🏷️ Tags

`intersection-observer` `react` `dynamic-content` `scroll-animation` `timing-issue` `nextjs` `typescript`
