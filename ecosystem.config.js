module.exports = {
  apps: [
    {
      name: "starbuck-frontend",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/root/starbuck-cups-frontend",
      node_args: "--max-old-space-size=1024",
      max_memory_restart: "1200M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
