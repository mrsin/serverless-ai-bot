// Подключаем библиотеку для упрощения написания Telegram ботов
const { Telegraf } = require('telegraf');

// Переменная для хранения идентификатора Identity and Access Management облака Яндекс
let IAM_TOKEN = null;

// Функция для запроса в YandexGPT
async function YandexGPT(system, user) {
  const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + IAM_TOKEN,
      'x-folder-id': process.env.FOLDER_ID
    },
    body: JSON.stringify({
      'modelUri': 'gpt://' + process.env.FOLDER_ID + '/yandexgpt-lite',
      'completionOptions': {
        'stream': false,
        'temperature': 0.1,
        'maxTokens': '1000'
      },
      'messages': [
        {'role': 'system', 'text': system},
        {'role': 'user', 'text': user}
      ]
    }),
  });
  if (!response.ok) {
    return 'У нас проблема ' + await response.text();  
  }
  const json = await response.json();
  return json.result.alternatives[0].message.text;
}

// Создаём экземпляр объекта для общения с серверами Telegram, передаём идентификатор бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Назначаем обработчик старта диалога с ботом
bot.start(
  function(ctx) {
    ctx.reply(`Привет! Я бессерверный ИИ Бот.\nРаботаю в облаке Яндекс.`);
  }
);

// Назначаем обработчик каманды /help
bot.help(
  function(ctx) {
    ctx.reply(`Привет, ${ctx.message.from.username}.\nЯ умею отвечать на вопросы, переводить тексты, отвечать на голосовые сообщения.`);
  }
);    

// Назначаем обработчик каманды /translate
bot.command(
  'translate',
  async function(ctx) {
    ctx.reply(await YandexGPT('Переведи на английский', ctx.update.message.text));
  }
);

// Назначаем обработчик текстового сообщения
bot.on(
  'text',
  async function(ctx) {
    ctx.reply(await YandexGPT('Ты преподаватель университета, \
      всегда в конце сообщения добавляешь слово "товарищ",\
      можешь иногда пошутить, добавив ха-ха-ха. Ответь школьнику на вопрос.',
      ctx.update.message.text));
  }
);

// Назначаем обработчик голосового сообщения
bot.on(
  'voice',
  async function (ctx) {
    // Загружаем в память файл глосового сообщения с сервера Telegram
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    let response = await fetch(link.href);
    let buffer = await response.arrayBuffer();

    // Отправляем его на сервер Yandex Speech Kit для распознавания голоса и перевода в текст
    response = await fetch('https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?folderId=' +
      process.env.FOLDER_ID + '&lang=ru-RU&topic=general',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer ' + IAM_TOKEN,
      },        
      body: buffer
    });
    if (!response.ok) {
      return ctx.reply('У нас проблема ' + await response.text());  
    }
    const json = await response.json();

    // Передаем полученный текст Yandex GPT
    const reply = await YandexGPT('Ответь весело', json.result);

    // Отправляем ответ на сервер Yandex Speech Kit для синтеза речи
    response = await fetch('https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize?folderId=' + process.env.FOLDER_ID,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + IAM_TOKEN
      },        
      body: 'lang=ru-RU&voice=jane&text=' + encodeURI(reply)
    });
    if (!response.ok) {
      return ctx.reply('У нас проблема ' + await response.text());  
    }
    buffer = await response.arrayBuffer();

    // Отвечаем голосом
    ctx.replyWithVoice({source: Buffer.from(buffer)});
  }
);

// Экспортируем обработчик веб-хука бота Telegram
module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    AIM_TOKEN = context.token.access_token;
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};
