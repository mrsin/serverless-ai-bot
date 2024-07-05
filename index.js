const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply(`Hello. \nMy name Serverless AI Bot \nI'm working on Cloud Function in the Yandex Cloud.`))
bot.help((ctx) => ctx.reply(`Hello, ${ctx.message.from.username}.\nI can say Hello and nothing more`))

bot.command('translate', async function(ctx) {

  const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.AIM_TOKEN,
        "x-folder-id": process.env.FOLDER_ID
      },
      body: JSON.stringify({
        "modelUri": "gpt://" + process.env.FOLDER_ID + "/yandexgpt-lite",
        "completionOptions": {
          "stream": false,
          "temperature": 0.1,
          "maxTokens": "1000"
        },
        "messages": [
        {
          "role": "system",
          "text": "Переведи на английский"
        },
        {
          "role": "user",
          "text": ctx.update.message.text
        }
        ]
      }),
  });
  const json = await response.json();
  ctx.reply(json.result.alternatives[0].message.text);
});


bot.on('text', async function(ctx) {

  const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.AIM_TOKEN,
        "x-folder-id": process.env.FOLDER_ID
      },
      body: JSON.stringify({
        "modelUri": "gpt://" + process.env.FOLDER_ID + "/yandexgpt-lite",
        "completionOptions": {
          "stream": false,
          "temperature": 0.1,
          "maxTokens": "1000"
        },
        "messages": [
        {
          "role": "system",
          "text": "Ты преподаватель университета, всегда в конце сообщения добавляешь слово 'товарищ', можешь иногда пошутить, добавив ха-ха-ха. Ответь школьнику на вопрос."
        },
        {
          "role": "user",
          "text": ctx.update.message.text
        }
        ]
      }),
  });
  const json = await response.json();
  ctx.reply(json.result.alternatives[0].message.text);
});

bot.on("voice", async ctx => {
	ctx.reply("Обрабатываю голосовое сообщение...");
  ctx.reply(ctx.message.voice.file_id);
  const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
  ctx.reply(link.href);
  const response = await fetch(link.href);
  if (!response.ok) {
    ctx.reply("У нас проблема " + await response.text());  
  }
  const buffer = await response.arrayBuffer();
  ctx.reply("Скачали файл размером " + buffer.byteLength);
  const voice = await fetch("https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?folderId=" + process.env.FOLDER_ID + "&lang=ru-RU&topic=general",
    {
        method: 'POST',
        headers: {
          "Content-Type": "application/octet-stream",
          //"Content-Type": "audio/ogg; codec=opus",
          "Authorization": "Bearer " + process.env.AIM_TOKEN,
        },        
        data: buffer
      });
  ctx.reply(await voice.text());
  // TODO: проблема, возвращает {"error_code":"BAD_REQUEST","error_message":"audio should be not empty"}
});

module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};
