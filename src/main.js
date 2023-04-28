import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ogg } from "./ogg.js";
import config from "config";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.on(message("voice"), async (context) => {
  try {
    const link = await context.telegram.getFileLink(context.message.voice.file_id);
    const userId = String(context.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    await context.reply(JSON.stringify(link, null, 2))
  } catch (error) {
    console.log(`Error while running: ${error.message}`)    
  }
});

bot.on(message("text"), async (context) => {
  try {
    await context.reply(JSON.stringify(context.message.text, null, 2))
  } catch (error) {
    console.log(`Error while running: ${error.message}`)    
  }
});

bot.command("start", async (context) => {
  await context.reply(JSON.stringify('', null, 2))
})
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))