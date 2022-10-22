const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'tg_db',
    'postgres',
    '12345',
    {
        host: '127.0.0.1',
        port: 5432,
        dialect: 'postgres'
    }
)
