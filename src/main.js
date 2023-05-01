import { Telegraf, session } from "telegraf";
import { code } from "telegraf/format";
import { message } from "telegraf/filters";
import { ogg } from "./ogg.js";
import { openai } from "./openAi.js";
import config from "config";

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("new", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Awaiting of your text or voice message...")
})

bot.command("start", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Awaiting of your text or voice message...")
})

bot.on(message("voice"), async (context) => {
  context.session ??= INITIAL_SESSION;
  try {
    await context.reply(code("Message accepted. Please, await a response from the server..."))
    const link = await context.telegram.getFileLink(context.message.voice.file_id);
    const userId = String(context.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const text = await openai.transcription(mp3Path);
    await context.reply(code(`Your response: ${text}`));
    context.session.messages.push({ 
      content: text, 
      role: openai.roles.USER 
    });
    const response = await openai.chat(context.session.messages);
    context.session.messages.push({ 
      content: text, 
      role: openai.roles.ASSISTANT 
    });
    await context.reply(response.content);
  } catch (error) {
    console.log(`Error while processing voice message: ${error.message}`); 
  }
});

bot.on(message('text'), async (context) => {
  context.session ??= INITIAL_SESSION;
  try {
    await context.reply(code(`Your message "... ${context.message.text} ..." has been accepted. Please, await a response from the server...`))
    context.session.messages.push({ 
      role: openai.roles.USER,
      content: context.message.text, 
    });
    const response = await openai.chat(context.session.messages);
    context.session.messages.push({ 
      role: openai.roles.ASSISTANT,
      content: response.content, 
    });
    await context.reply(response.content);
  } catch (error) {
    console.log(`Error while processing text message: ${error.message}`); 
  }
})

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))