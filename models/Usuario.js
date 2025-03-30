const { DataTypes } = require("sequelize")
const bcrypt = require("bcrypt")
const db = require("../config/database")

const Usuario = db.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10)
          usuario.password = await bcrypt.hash(usuario.password, salt)
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed("password")) {
          const salt = await bcrypt.genSalt(10)
          usuario.password = await bcrypt.hash(usuario.password, salt)
        }
      },
    },
  },
)

// Método para verificar contraseña
Usuario.prototype.verificarPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = Usuario

