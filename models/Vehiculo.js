const { DataTypes } = require("sequelize")
const db = require("../config/database")
const Usuario = require("./Usuario")

const Vehiculo = db.define("Vehiculo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM("Sedan", "SUV", "Pickup", "Camioneta", "Motocicleta", "Otro"),
    allowNull: false,
    defaultValue: "Sedan",
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Usuario,
      key: "id",
    },
  },
})

// Relación con Usuario (opcional, puede ser null)
Vehiculo.belongsTo(Usuario, { foreignKey: "usuarioId", as: "propietario" })
Usuario.hasMany(Vehiculo, { foreignKey: "usuarioId", as: "vehiculos" })

module.exports = Vehiculo

