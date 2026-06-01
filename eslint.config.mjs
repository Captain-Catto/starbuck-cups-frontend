import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/api",
              message: "Use '@/lib/client-api' in browser code or '@/lib/server-api' in server/API code.",
            },
            {
              name: "@/lib/apiWithAuth",
              message: "Use '@/lib/client-api' instead.",
            },
            {
              name: "@/lib/api-config",
              message: "Use '@/lib/server-api' in server/API code or client-specific helpers in browser code.",
            },
            {
              name: "@/lib/api/upload",
              message: "Use '@/lib/client-upload-api' instead.",
            },
            {
              name: "@/lib/api/dashboard",
              message: "Use '@/lib/client-dashboard-api' instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "src/store/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/server-api",
              message: "Client-side code must call relative '/api/...' helpers via client API modules, not backend URLs.",
            },
          ],
          patterns: [
            {
              group: ["@/lib/api", "@/lib/api/*", "@/lib/api-config", "@/lib/apiWithAuth"],
              message: "Legacy API helpers are removed. Use client API modules.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".claude/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
