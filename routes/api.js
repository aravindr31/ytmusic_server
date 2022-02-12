const express = require("express");
const botFunction = require("../Functions/botFunctions");
const mongoFunction = require("../Functions/mongoFunctions");
const router = express.Router();
const { Telegraf } = require("telegraf");
const jwt = require("jsonwebtoken");
const bot = new Telegraf(process.env.BOT_TOKEN);

const generateToken = (id) => {
  console.log("--generateToken Flag", id);
  return jwt.sign({ id }, process.env.JWT_ACCESSTOKEN_SECRET, {
    expiresIn: "2d",
  });
};

const jwtValidate = (req, res, next) => {
  console.log("--validate flag");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_ACCESSTOKEN_SECRET, async (err, id) => {
    let checkInDB = await mongoFunction.userIdentifer(id.id);
    if (!err && checkInDB.status) {
      req.id = id;
      next();
    }
    if (err || !checkInDB.status) {
      if (err) console.log("--jwt validation flag");
      if (!checkInDB.status) console.log("--user Not found flag");
      req.error = true;
      next();
    }
  });
};
let refreshTokens = [];

router.get("/validateToken", jwtValidate, (req, res) => {
  if (!req.error) res.json(req.id.id);
  if (req.error) res.json({ error: true });
});

router.post("/getaccess", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const acccessToken = generateToken({ name: user.name });
    res.json(acccessToken);
  });
});

router.post("/requestOtp", async (req, res) => {
  let mNumber = req.body.id;
  let checkuser = await mongoFunction.userIdentiferWithMNumber(mNumber);
  if (checkuser.status) {
    let otp = await botFunction.generateOTP(checkuser.chatId);
    await bot.telegram.sendMessage(
      checkuser.chatId,
      `${otp} is the One Time Password for YTMusic`
    );
    res.send(true);
  } else {
    res.send(false);
  }
});

router.post("/validateOtp", async (req, res) => {
  let jsonData = JSON.parse(req.body.data);
  let checkuser = await mongoFunction.userIdentiferWithMNumber(jsonData.Number);
  if (checkuser.status) {
    let validateData = await mongoFunction.validateOTP(
      checkuser.chatId,
      jsonData.otp
    );
    console.log(validateData);
    let accessToken = null;
    if (validateData) {
      accessToken = generateToken(JSON.stringify(checkuser.chatId));
      console.log(accessToken);
    }
    // const refreshToken = jwt.sign(user, process.env.JWT_REFRESHTOKEN_SECRET);
    // else
    res.json({ status: validateData, accessToken, userId: checkuser.chatId });
  }
});

router.post("/getSongs", async (req, res) => {
  let userId = req.body.data;

  let checkuser = await mongoFunction.userIdentifer(userId);
  if (checkuser.status) {
    let userSongs = await mongoFunction.getUserSongs(checkuser.chatId);
    res.json(userSongs);
  }
});

router.post("/deleteSong", async (req, res) => {
  // console.log("inside Del song");
  console.log(req.body);
  let userId = req.body.data.uid;
  let videoId = req.body.data.vid;
  let checkuser = await mongoFunction.userIdentifer(userId);
  if (checkuser.status) {
    // console.log("here");
    let deleteStatus = await mongoFunction.deleteIndSong(userId, videoId);
    if (deleteStatus.status) res.json(deleteStatus);
    else res.json({ status: false });
  }
});

module.exports = router;
