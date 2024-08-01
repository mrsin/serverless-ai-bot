// Подключаем библиотеку для упрощения написания Telegram ботов
const { Telegraf } = require('telegraf');

// Создаём экземпляр объекта для общения с серверами Telegram, передаём идентификатор бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Назначаем обработчик старта диалога с ботом
bot.start(
  function(ctx) {
    ctx.reply(`Привет! Я бессерверный эхо Бот.\nРаботаю в облаке Яндекс.`);
  }
);

// Назначаем обработчик каманды /help
bot.help(
  function(ctx) {
    ctx.reply(`Привет, ${ctx.message.from.username}.\nЯ простой эхо бот.`);
  }
);    

// Назначаем обработчик текстового сообщения
bot.on(
  'text',
  async function(ctx) {
    ctx.reply(ctx.update.message.text));
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
