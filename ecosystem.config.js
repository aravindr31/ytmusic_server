module.exports = {
  apps: [
    {
      name: "YTMSERVER",
      script: "./server.js",
      instances: "max",
      watch: true,
      // env: {
      //   NODE_ENV: "development",
      // },
      // env_production: {
      //   NODE_ENV: "production",
      // },
    },
  ],
};
