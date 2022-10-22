const sequelize = require('./db')
const {DataTypes} = require('sequelize')

module.exports.UserModel = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    wins: {type: DataTypes.INTEGER, defaultValue: 0},
    loses: {type: DataTypes.INTEGER, defaultValue: 0}
})
