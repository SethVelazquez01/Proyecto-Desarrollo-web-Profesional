const Usuario = require("../models/Usuario")
const Vehiculo = require("../models/Vehiculo")
const { Orden } = require("../models/Orden")

// Mostrar perfil del usuario
exports.mostrarPerfil = (req, res) => {
  res.render("perfil/index", {
    titulo: "Mi Perfil",
    usuario: req.session.user,
  })
}

// Mostrar formulario para editar perfil
exports.showEditarForm = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.session.user.id, {
      attributes: { exclude: ["password"] },
    })

    if (!usuario) {
      req.flash("error_msg", "Usuario no encontrado")
      return res.redirect("/perfil")
    }

    res.render("perfil/editar", {
      titulo: "Editar Perfil",
      usuario,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el perfil")
    res.redirect("/perfil")
  }
}

// Procesar actualización de perfil
exports.actualizarPerfil = async (req, res) => {
  const { nombre, apellido, email, telefono, password, confirmarPassword } = req.body

  try {
    const usuario = await Usuario.findByPk(req.session.user.id)

    if (!usuario) {
      req.flash("error_msg", "Usuario no encontrado")
      return res.redirect("/perfil")
    }

    // Preparar datos para actualizar
    const datosActualizar = {
      nombre,
      apellido,
      email,
      telefono,
    }

    // Si se proporciona una nueva contraseña, validarla y actualizarla
    if (password) {
      if (password !== confirmarPassword) {
        req.flash("error_msg", "Las contraseñas no coinciden")
        return res.redirect("/perfil/editar")
      }
      if (password.length < 6) {
        req.flash("error_msg", "La contraseña debe tener al menos 6 caracteres")
        return res.redirect("/perfil/editar")
      }
      datosActualizar.password = password
    }

    // Actualizar usuario
    await usuario.update(datosActualizar)

    // Actualizar datos de sesión
    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    }

    req.flash("success_msg", "Perfil actualizado correctamente")
    res.redirect("/perfil")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al actualizar el perfil")
    res.redirect("/perfil/editar")
  }
}

// Mostrar vehículos del usuario
exports.misVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { usuarioId: req.session.user.id },
    })

    res.render("perfil/vehiculos", {
      titulo: "Mis Vehículos",
      vehiculos,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar tus vehículos")
    res.redirect("/perfil")
  }
}

