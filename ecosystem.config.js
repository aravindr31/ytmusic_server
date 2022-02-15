module.exports = {
  apps: [
    {
      name: "YTMSERVER",
      script: "./server.js",
      instances: "max",
      watch: true,
    },
  ],
};
