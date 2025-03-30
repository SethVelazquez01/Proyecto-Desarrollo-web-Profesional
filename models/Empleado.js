const { DataTypes } = require("sequelize")
const bcrypt = require("bcrypt")
const db = require("../config/database")

const Empleado = db.define(
  "Empleado",
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
    rol: {
      type: DataTypes.ENUM("admin", "empleado"),
      allowNull: false,
      defaultValue: "empleado",
    },
  },
  {
    hooks: {
      beforeCreate: async (empleado) => {
        if (empleado.password) {
          const salt = await bcrypt.genSalt(10)
          empleado.password = await bcrypt.hash(empleado.password, salt)
        }
      },
      beforeUpdate: async (empleado) => {
        if (empleado.changed("password")) {
          const salt = await bcrypt.genSalt(10)
          empleado.password = await bcrypt.hash(empleado.password, salt)
        }
      },
    },
  },
)

// Método para verificar contraseña
Empleado.prototype.verificarPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = Empleado

