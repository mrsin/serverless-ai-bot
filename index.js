// Подключаем библиотеку для упрощения написания Telegram ботов
const { Telegraf } = require('telegraf');

// Создаём экземпляр объекта для общения с серверами Telegram, передаём идентификатор бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Назначаем обработчик старта диалога с ботом
bot.start(
  function(ctx) {
    ctx.reply(`Привет! Я бессерверный ИИ Бот.\nРаботаю в облаке Яндекс.`);
  }
);

bot.help(
  function(ctx) {
    ctx.reply(`Привет, ${ctx.message.from.username}.\nЯ умею отвечать на команды /double X, /image и посылать обратно текст.`);
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
