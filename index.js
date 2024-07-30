const { Telegraf } = require('telegraf');

async function YandexGPT(system, user) {
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
        {"role": "system", "text": system},
        {"role": "user", "text": user}
      ]
    }),
  });
  const json = await response.json();
  return json.result.alternatives[0].message.text;
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply(`Привет! \nЯ бессервеный ИИ Бот\nРаботаю в облаке Яндекс.`))

bot.help((ctx) => ctx.reply(`Привет, ${ctx.message.from.username}.\nЯ умею отвечать на вопросы, переводить тексты, отвечать на голосовые сообщения`))

bot.command('translate', async function(ctx) {
  ctx.reply(await YandexGPT("Переведи на английский", ctx.update.message.text));
});

bot.on('text', async function(ctx) {
  ctx.reply(await YandexGPT("Ты преподаватель университета, всегда в конце сообщения добавляешь слово 'товарищ', можешь иногда пошутить, добавив ха-ха-ха. Ответь школьнику на вопрос.",
    ctx.update.message.text));
});

bot.on("voice", async ctx => {
  const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
  let response = await fetch(link.href);
  const buffer = await response.arrayBuffer();
  response = await fetch("https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?folderId=" + process.env.FOLDER_ID + "&lang=ru-RU&topic=general",
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/octet-stream",
        "Authorization": "Bearer " + process.env.AIM_TOKEN,
      },        
      body: buffer
    });
  const json = await response.json();
  ctx.reply(await YandexGPT("Ответь весело", json.result));
});

module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};
