// Подключаем библиотеку для упрощения написания Telegram ботов
const { Telegraf } = require('telegraf');

// Переменная для хранения идентификатора Identity and Access Management облака Яндекс
let IAM_TOKEN = null;

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

// Назначаем обработчик каманды /eval
bot.command(
  'eval',
  function(ctx) {
    ctx.reply(eval(ctx.update.message.text));
  }
);

// Назначаем обработчик каманды /image
bot.command(
  'image',
  function(ctx) {
    ctx.replyWithPhoto({url: 'https://d5dlco8bnnshh9eeda53.apigw.yandexcloud.net/sayhello.png'});
  }
);

// Назначаем обработчик текстового сообщения
bot.on(
  'text',
  function(ctx) {
    ctx.reply(ctx.update.message.text);
  }
);

// Экспортируем обработчик веб-хука бота Telegram
module.exports.handler = async function (event, context) {
    const message = JSON.parse(event.body);
    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};
