const { getLinkPreview } = require("link-preview-js");
const dbFunction = require("./mongoFunctions");
const ydl = require("youtube-dl-exec");
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
  getSongMeta: (videoid) => {
    return new Promise(async (resolve, reject) => {
      const out = await ydl(`https://www.youtube.com/watch?v=${videoid}`, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        extractAudio: true,
      });
      resolve(out);
    });
  },
};
