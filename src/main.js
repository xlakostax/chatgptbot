import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));
bot.on(message("voice"), async (context) => {
  try {
    const link = await context.telegram.getFileLink(context.message.voice.file_id)
    await context.reply(JSON.stringify(link, null, 2))
  } catch (error) {
    consolr.log(`Error while running: ${error.message}`)    
  }
});
bot.command("start", async (context) => {
  await context.reply(JSON.stringify(context.message, null, 2))
})
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))