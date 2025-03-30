const express = require("express")
const router = express.Router()
const ordenController = require("../controllers/ordenController")
const { isAuthenticated } = require("../middlewares/auth")

// Rutas públicas
router.get("/nueva", ordenController.showNuevaOrdenForm)
router.post("/nueva", ordenController.crearOrden)
router.get("/detalle/:id", ordenController.detalleOrden)

// Rutas que requieren autenticación
router.get("/mis-ordenes", isAuthenticated, ordenController.misOrdenes)
router.get("/cancelar/:id", isAuthenticated, ordenController.cancelarOrden)

// Exportar router
module.exports = router

