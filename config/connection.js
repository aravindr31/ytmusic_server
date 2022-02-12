require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
const username = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.CLUSTER_NAME;
module.exports.connect = function async(done) {
  const url = `mongodb+srv://${username}:${password}@cluster0.rsro3.mongodb.net/${cluster}?retryWrites=true&w=majority`;
  // const url = "mongodb://localhost:27017";
  const dbname = "YTM";
  // const dbname = "ytmusic";

  MongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};
