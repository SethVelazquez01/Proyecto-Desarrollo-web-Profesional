const { DataTypes } = require("sequelize")
const db = require("../config/database")
const Usuario = require("./Usuario")
const Vehiculo = require("./Vehiculo")
const Servicio = require("./Servicio")
const Empleado = require("./Empleado")

const Orden = db.define(
  "Orden",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "En Proceso", "Completado", "Cancelado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nombreCliente: {
      type: DataTypes.STRING,
      allowNull: true, // Para clientes no registrados
    },
    telefonoCliente: {
      type: DataTypes.STRING,
      allowNull: true, // Para clientes no registrados
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si el cliente no está registrado
      references: {
        model: Usuario,
        key: "id",
      },
    },
    vehiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vehiculo,
        key: "id",
      },
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null hasta que se asigne un empleado
      references: {
        model: Empleado,
        key: "id",
      },
    },
  },
  {
    tableName: "ordenes", // Especificar explícitamente el nombre de la tabla
  },
)

// Relaciones
Orden.belongsTo(Usuario, { foreignKey: "usuarioId", as: "cliente" })
Usuario.hasMany(Orden, { foreignKey: "usuarioId", as: "ordenes" })

Orden.belongsTo(Vehiculo, { foreignKey: "vehiculoId", as: "vehiculo" })
Vehiculo.hasMany(Orden, { foreignKey: "vehiculoId", as: "ordenes" })

Orden.belongsTo(Empleado, { foreignKey: "empleadoId", as: "empleado" })
Empleado.hasMany(Orden, { foreignKey: "empleadoId", as: "ordenes" })

// Tabla intermedia para la relación muchos a muchos entre Orden y Servicio
const OrdenServicio = db.define(
  "OrdenServicio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ordenservicios", // Especificar explícitamente el nombre de la tabla
  },
)

Orden.belongsToMany(Servicio, { through: OrdenServicio, as: "servicios", foreignKey: "OrdenId" })
Servicio.belongsToMany(Orden, { through: OrdenServicio, as: "ordenes", foreignKey: "ServicioId" })

module.exports = { Orden, OrdenServicio }





