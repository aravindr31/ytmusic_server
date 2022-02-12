require("dotenv").config();
const db = require("../config/connection");
const bcrypt = require("bcrypt");

module.exports = {
  userIdentifer: (uid) => {
    console.log(uid, "<<<<<<<<<<>>>>>>>>>>>");
    return new Promise(async (resolve, reject) => {
      let userCheck = await db
        .get()
        ?.collection(process.env.DB_COLLECTION)
        .findOne({ id: parseInt(uid) });
      // console.log(userCheck);
      if (userCheck == null) {
        console.log("failed here");
        resolve({ status: false });
      } else {
        resolve({ status: true, chatId: userCheck.id });
      }
    });
  },
  userIdentiferWithMNumber: (id) => {
    console.log(">>>>>" + id);
    return new Promise(async (resolve, reject) => {
      let userCheck = await db
        .get()
        ?.collection("songs")
        .findOne({ phone: id });
      // console.log(userCheck);
      if (userCheck == null) {
        console.log("falied");
        resolve({ status: false });
      } else {
        resolve({ status: true, chatId: userCheck.id });
      }
    });
  },
  insertOtp: (userId, otp) => {
    return new Promise(async (resolve, reject) => {
      let encryptedOtp = await bcrypt.hash(
        otp,
        parseInt(process.env.saltRound)
      );
      console.log(">>>>>>><<<<<<<<<<" + userId, encryptedOtp);
      await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .updateOne({ id: userId }, { $set: { Eotp: encryptedOtp } });
      resolve(true);
    });
  },
  validateOTP: (id, otp) => {
    return new Promise(async (resolve, reject) => {
      let eOtp = await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .aggregate([
          {
            $match: { id: id },
          },
          {
            $project: {
              Eotp: 1,
              _id: 0,
            },
          },
        ])
        .toArray();
      console.log(eOtp[0].Eotp);
      let validate = await bcrypt.compare(otp, eOtp[0].Eotp);
      console.log(validate);
      resolve(validate);
    });
  },
  insertUser: (data) => {
    return new Promise(async (resolve, reject) => {
      let userCheck = await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .findOne({ id: data.user_id });
      if (userCheck != null) {
        console.log("user already exist" + userCheck);
        resolve({ status: false });
      } else {
        await db
          .get()
          .collection(process.env.DB_COLLECTION)
          .insertOne({
            id: data.user_id,
            phone: data.phone_number,
            username: `${data.first_name} ${data.last_name}`,
            data: [],
            Eotp: "",
          });
        resolve({ status: true });
      }
    });
  },

  updateMongo: async (userId, data) => {
    return new Promise(async (resolve, reject) => {
      let userCheck = await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .findOne({ id: userId });
      if (userCheck) {
        let videoExistCheck = userCheck?.data.findIndex(
          (videoData) => videoData?.videoId == data?.videoId
        );
        if (videoExistCheck != -1) {
          resolve({ status: false });
        } else {
          await db
            .get()
            .collection(process.env.DB_COLLECTION)
            .updateOne({ id: userId }, { $push: { data: data } });
          resolve({ status: true });
        }
      } else {
        await db
          .get()
          .collection(process.env.DB_COLLECTION)
          .insertOne({ id: userId, data: [data] });
        resolve();
      }
    });
  },
  deleteAll: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userCheck = await db
        .get()
        ?.collection(process.env.DB_COLLECTION)
        .findOne({ id: userId });
      if (userCheck != null) {
        await db
          .get()
          .collection(process.env.DB_COLLECTION)
          .updateOne({ id: userId }, { $set: { data: [] } });
        resolve({ status: true });
      } else {
        resolve({ status: false });
      }
    });
  },
  getUserSongs: (id) => {
    return new Promise(async (resolve, reject) => {
      let songData = await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .aggregate([
          {
            $match: {
              id: id,
            },
          },
          {
            $project: {
              _id: 0,
              data: 1,
            },
          },
        ])
        .toArray();
      console.log(songData);
      resolve(songData);
    });
  },
  deleteIndSong: (uid, vid) => {
    console.log(uid, vid);
    return new Promise(async (resolve, reject) => {
      let newData = await db
        .get()
        .collection(process.env.DB_COLLECTION)
        .updateOne(
          { id: parseInt(uid) },
          { $pull: { data: { videoId: vid } } }
        );
      // console.log(newData);
      resolve({ status: true });
    });
  },
};
