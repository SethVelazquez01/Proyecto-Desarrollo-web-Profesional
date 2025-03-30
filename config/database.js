const { Sequelize } = require("sequelize")

const sequelize = new Sequelize("autolavado_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
})

module.exports = sequelize

