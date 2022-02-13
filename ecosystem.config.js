module.exports = {
  apps: [
    {
      name: "YTMSERVER",
      script: "./server.js",
      watch: true,
      env: {
        NODE_ENV: "development", // define env variables here
      },
    },
  ],
};
