const TelegramApi = require('node-telegram-bot-api')
const {constants} = require('./constants');
const {againOptions, gameOptions} = require('./options');
const db = require('./db/db')
const {UserModel} = require('./db/models')

const token = ''
const bot = new TelegramApi(token, { polling: true })
const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, constants.messages.thinkNumber)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, constants.messages.try, gameOptions)
}

const main = async () => {
    try {
        await db.authenticate()
        await db.sync()
    } catch (error) {
        console.log(`During connection to postgres something goes wrong. Error ${error}`)
    }

    bot.setMyCommands([
        { command: '/start', description: constants.commandDescriptions.start },
        { command: '/info', description: constants.commandDescriptions.info },
        { command: '/game', description: constants.commandDescriptions.game }
    ])

    bot.on('message', async (message) => {
        const text = message.text
        const chatId = message.chat.id
        const user = await UserModel.findOne({chatId})

        try {
            if (text === '/start') {
                if (!user) {
                    await UserModel.create({chatId})
                }
                await bot.sendSticker(chatId, constants.stickers.greeting)
                return bot.sendMessage(chatId, constants.messages.welcome)
            }
            if (text === '/info') {
                await bot.sendMessage(chatId, constants.messages.info.replace('%USER_NAME%', message.from.first_name))
                return bot.sendMessage(chatId, `Yoy have ${user.wins} wins and ${user.loses} loses.`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, constants.messages.unexpectedCommand)
        } catch (error) {
            return bot.sendMessage(chatId, `Something goes wrong: ${error}`)
        }
    })

    bot.on('callback_query', async message => {
        const data = message.data
        const chatId = message.message.chat.id

        if (data === '/again') {
            return startGame(chatId)
        }

        const user = await UserModel.findOne({chatId})

        if (parseInt(data) === chats[chatId]) {
            user.wins++
            await bot.sendMessage(chatId, constants.messages.win.replace('%NUMBER%', chats[chatId]), againOptions)
        } else {
            user.loses++
            await bot.sendMessage(chatId, constants.messages.lose.replace('%NUMBER%', chats[chatId]), againOptions)
        }
        await user.save()
    })
}

main()
