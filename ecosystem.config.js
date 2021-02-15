module.exports = {
  apps: [
    {
      name: "ecommerce-backend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      exp_backoff_restart_delay: 100,
    },
  ],
};
