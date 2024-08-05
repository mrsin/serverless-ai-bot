module.exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        },
        body: '<h1>Привет мир!</h1> <img src="https://storage.yandexcloud.net/sinitsabacket/sayhello.png" />',
    };
};
