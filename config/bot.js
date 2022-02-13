require("dotenv").config();
const botFunction = require("../Functions/botFunctions");
const mongoFunction = require("../Functions/mongoFunctions");
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("stopBot", async (ctx) => {
  if (ctx.message.chat.id == "300646207") {
    ctx.reply("Stopping Bot... GoodBye");
    pm2.stop(0);
  } else {
    ctx.reply("Sorry!! Require Admin Previlages....");
  }
});

bot.command("restartBot", async (ctx) => {
  if (ctx.message.chat.id == process.env.ADMIN_ID) {
    ctx.reply("Restarting Bot...");
    pm2.restart(0, () => {
      console.log("Restart successfull");
    });
  } else {
    ctx.reply("Sorry!! Require Admin Previlages....");
  }
});

bot.start(async (ctx) => {
  let userChecker = await mongoFunction.userIdentifer(ctx.message.chat.id);
  if (!userChecker.status) {
    bot.telegram.sendMessage(ctx.chat.id, "Requesting Mobile Number", {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        remove_keyboard: true,
        keyboard: [
          [
            {
              text: "Share Number",
              request_contact: true,
            },
          ],
          ["Cancel"],
        ],
      },
    });
  } else if (userChecker.status) {
    ctx.reply(
      `Welcome Back ${ctx.message.chat.first_name} ${ctx.message.chat.last_name}`
    );
  }
});

bot.on("contact", async (ctx) => {
  let addNewUser = await mongoFunction.insertUser(ctx.message.contact);
  if (!addNewUser.status) {
    ctx.reply("You have already been registered in YT Music bot");
  } else if (addNewUser.status) {
    ctx.reply(
      `Welcome to YTMusic Bot, ${ctx.message.contact.first_name} ${ctx.message.contact.last_name}`
    );
  }
});

bot.command("deleteAll", async (ctx) => {
  let userId = ctx.message.chat.id;
  let del = await mongoFunction.deleteAll(userId);
  if (!del.status) {
    ctx.reply("No user account found ");
  } else {
    ctx.reply("DELETED");
  }
});

let storentData = {};
let splitedUrl = [];
let update;
bot.on("message", async (ctx) => {
  console.log(ctx.message.from);
  const userId = ctx.message.from.id;
  const url = ctx.message.text;
  splitedUrl = url.split("=");
  if (splitedUrl[0] == "https://www.youtube.com/watch?v") {
    if (splitedUrl[1].includes("&")) {
      storentData.videoId = splitedUrl[1].split("&")[0];
      storentData.title = await botFunction.gettitle(storentData.videoId);
      console.log(userId, storentData);
      update = await mongoFunction.updateMongo(userId, storentData);
    } else {
      storentData.videoId = splitedUrl[1];
      storentData.title = await botFunction.gettitle(storentData.videoId);
      console.log(storentData);
      update = await mongoFunction.updateMongo(userId, storentData);
    }
    if (!update.status) {
      ctx.reply(`Media already exits`);
    } else {
      ctx.reply(`Adding ${storentData.title} to your list`);
    }
  } else if (url.includes("youtu.be")) {
    splitedUrl = url.split("/");
    storentData.videoId = splitedUrl.slice(-1)[0];
    storentData.title = await botFunction.gettitle(storentData.videoId);
    update = await mongoFunction.updateMongo(userId, storentData);
    if (!update.status) {
      ctx.reply(`Media already exits`);
    } else {
      ctx.reply(`Adding ${storentData.title} to your list`);
    }
  } else {
    ctx.reply("Please provide a youtube video URL");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
