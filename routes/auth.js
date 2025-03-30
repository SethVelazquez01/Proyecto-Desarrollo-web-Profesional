const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")

// Rutas de registro
router.get("/registro", authController.showRegistroForm)
router.post("/registro", authController.registrarUsuario)

// Rutas de login
router.get("/login", authController.showLoginForm)
router.post("/login", authController.loginUsuario)

// Ruta de logout
router.get("/logout", authController.logout)

// Exportar router
module.exports = router

