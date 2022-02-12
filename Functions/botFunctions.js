const { getLinkPreview } = require("link-preview-js");
const dbFunction = require("./mongoFunctions");
module.exports = {
  gettitle: (videoId) => {
    return new Promise(async (resolve, reject) => {
      const videoTitle = await getLinkPreview(
        `https://www.youtube.com/watch?v=${videoId}`
      ).then(async (data) => {
        return data.title;
      });
      resolve(videoTitle);
    });
  },
  generateOTP: (userId) => {
    return new Promise(async (resolve, reject) => {
      let digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      await dbFunction.insertOtp(userId, OTP);
      resolve(OTP);
    });
  },
};
