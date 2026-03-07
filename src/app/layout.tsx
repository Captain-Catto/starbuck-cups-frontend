import "./globals.css";

// Root layout - minimal pass-through
// html/body tags are provided by [locale]/layout.tsx and admin/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
