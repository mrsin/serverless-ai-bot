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

// Назначаем обработчик команды /help
bot.help(
  function(ctx) {
    ctx.reply(`Привет, ${ctx.message.from.username}.\nЯ умею отвечать на команды /double X, /image, /translate Text и отвечать через YandexGPT.`);
  }
);    

// Назначаем обработчик команды /double
bot.command(
  'double',
  function(ctx) {
    // Преобразуем текст в число, умножаем на 2, сохраняем в переменную
    let x = ctx.update.message.text.substring(8);
    let result = parseInt(x) * 2; 
    ctx.reply(result);
  }
);

// Назначаем обработчик команды /image
bot.command(
  'image',
  function(ctx) {
    ctx.replyWithPhoto({url: 'https://d5dlco8bnnshh9eeda53.apigw.yandexcloud.net/sayhello.png'});
  }
);

// Назначаем обработчик команды /translate
bot.command(
  'translate',
  async function(ctx) {
    // Отрезаем команду /translate и пробел
    let x = ctx.update.message.text.substring(11);
    ctx.reply(await YandexGPT('Переведи на английский', x));
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

// Экспортируем обработчик веб-хука бота Telegram
module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    IAM_TOKEN = context.token.access_token;
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};
