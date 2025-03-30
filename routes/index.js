const express = require("express")
const router = express.Router()
const Servicio = require("../models/Servicio")
const perfilController = require("../controllers/perfilController")
const { isAuthenticated } = require("../middlewares/auth")


// Página de inicio
router.get("/", (req, res) => {
  res.render("index", {
    titulo: "Autolavado - Inicio",
  })
})

// Página de servicios
router.get("/servicios", async (req, res) => {
  try {
    const servicios = await Servicio.findAll({ where: { activo: true } })
    res.render("servicios", {
      titulo: "Nuestros Servicios",
      servicios,
      activePage: "servicios",
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Error al cargar los servicios")
    res.redirect("/")
  }
})

// Rutas de perfil (requieren autenticación)
router.get("/perfil", isAuthenticated, perfilController.mostrarPerfil)
router.get("/perfil/editar", isAuthenticated, perfilController.showEditarForm)
router.post("/perfil/editar", isAuthenticated, perfilController.actualizarPerfil)
router.get("/perfil/vehiculos", isAuthenticated, perfilController.misVehiculos)

// Página de perfil (requiere autenticación)
router.get("/perfil", (req, res) => {
  if (!req.session.user) {
    req.flash("error_msg", "Debes iniciar sesión para acceder a tu perfil")
    return res.redirect("/auth/login")
  }

  res.render("perfil/index", {
    titulo: "Mi Perfil",
    usuario: req.session.user,
  })
})

// Exportar router
module.exports = router

