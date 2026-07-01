module.exports = {
  apps: [
    {
      name: 'zehla-app',
      script: 'server.js',
      cwd: './.next/standalone',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
    },
  ],
};
