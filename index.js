const TelegramApi = require('node-telegram-bot-api')
const {constants} = require('./constants');
const {againOptions, gameOptions} = require('./options');

const token = '5406502471:AAHW8-THUotj8gOm2dXWEhkPQB-j9YovI7U'
const bot = new TelegramApi(token, { polling: true })
const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, constants.messages.thinkNumber)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, constants.messages.try, gameOptions)
}

const main = () => {
    bot.setMyCommands([
        { command: '/start', description: constants.commandDescriptions.start },
        { command: '/info', description: constants.commandDescriptions.info },
        { command: '/game', description: constants.commandDescriptions.game }
    ])

    bot.on('message', async (message) => {
        const text = message.text
        const chatId = message.chat.id

        if (text === '/start') {
            await bot.sendSticker(chatId, constants.stickers.greeting)
            return bot.sendMessage(chatId, constants.messages.welcome)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, constants.messages.info.replace('%USER_NAME%', message.from.first_name))
        }
        if (text === '/game') {
            return startGame(chatId)
        }
        return bot.sendMessage(chatId, constants.messages.unexpectedCommand)
    })

    bot.on('callback_query', async message => {
        const data = message.data
        const chatId = message.message.chat.id

        if (data === '/again') {
            return startGame(chatId)
        }

        if (data === chats[chatId]) {
            await bot.sendMessage(chatId, constants.messages.win.replace('%NUMBER%', chats[chatId]), againOptions)
        }
        await bot.sendMessage(chatId, constants.messages.lose.replace('%NUMBER%', chats[chatId]), againOptions)
    })
}

main()
