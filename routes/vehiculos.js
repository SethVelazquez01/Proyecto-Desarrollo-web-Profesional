const express = require("express")
const router = express.Router()
const vehiculoController = require("../controllers/vehiculoController")
const { isAuthenticated } = require("../middlewares/auth")
const Vehiculo = require("../models/Vehiculo") // Import the Vehiculo model

// Rutas públicas
router.get("/registro", vehiculoController.showRegistroForm)
router.post("/registro", vehiculoController.registrarVehiculo)

// Rutas que requieren autenticación
router.get("/mis-vehiculos", isAuthenticated, vehiculoController.misVehiculos)
router.get("/editar/:id", isAuthenticated, vehiculoController.showEditarForm)
router.post("/editar/:id", isAuthenticated, vehiculoController.actualizarVehiculo)
router.get("/eliminar/:id", isAuthenticated, vehiculoController.eliminarVehiculo)

// Alias para la ruta de mis vehículos
router.get("/perfil/vehiculos", isAuthenticated, vehiculoController.misVehiculos)

// API para contar vehículos
router.get("/api/count", isAuthenticated, async (req, res) => {
  try {
    const count = await Vehiculo.count({
      where: { usuarioId: req.session.user.id },
    })
    res.json({ count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al contar vehículos" })
  }
})

// API para obtener vehículos recientes
router.get("/api/recientes", isAuthenticated, async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { usuarioId: req.session.user.id },
      limit: 3,
      order: [["createdAt", "DESC"]],
    })
    res.json({ vehiculos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener vehículos recientes" })
  }
})

// Exportar router
module.exports = router



