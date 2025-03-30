const express = require("express")
const router = express.Router()
const empleadoController = require("../controllers/empleadoController")
const { isEmpleado, isAdmin } = require("../middlewares/auth")

// Rutas públicas
router.get("/login", empleadoController.showLoginForm)
router.post("/login", empleadoController.loginEmpleado)
router.get("/logout", empleadoController.logout)

// Rutas que requieren autenticación de empleado
router.get("/dashboard", isEmpleado, empleadoController.dashboard)
router.post("/orden/:id/actualizar-estado", isEmpleado, empleadoController.actualizarEstadoOrden)

// Rutas que requieren autenticación de administrador
router.get("/todas-ordenes", isAdmin, empleadoController.todasLasOrdenes)
router.get("/gestion", isAdmin, empleadoController.gestionEmpleados)
router.get("/crear", isAdmin, empleadoController.showCrearEmpleadoForm)
router.post("/crear", isAdmin, empleadoController.crearEmpleado)
router.get("/editar/:id", isAdmin, empleadoController.showEditarEmpleadoForm)
router.post("/editar/:id", isAdmin, empleadoController.actualizarEmpleado)
router.get("/eliminar/:id", isAdmin, empleadoController.eliminarEmpleado)

// Exportar router
module.exports = router

