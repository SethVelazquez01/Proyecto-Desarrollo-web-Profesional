const Vehiculo = require("../models/Vehiculo")

// Mostrar formulario para registrar vehículo
exports.showRegistroForm = (req, res) => {
  res.render("vehiculos/registro", {
    titulo: "Registrar Vehículo",
    vehiculo: {},
  })
}

// Procesar registro de vehículo (para usuarios autenticados)
exports.registrarVehiculo = async (req, res) => {
  const { marca, modelo, anio, color, placa, tipo } = req.body
  const usuarioId = req.session.user ? req.session.user.id : null

  // Validaciones básicas
  const errores = []
  if (!marca || !modelo || !placa) {
    errores.push({ mensaje: "Los campos marca, modelo y placa son obligatorios" })
  }

  // Si hay errores, volver al formulario
  if (errores.length > 0) {
    return res.render("vehiculos/registro", {
      titulo: "Registrar Vehículo",
      errores,
      vehiculo: { marca, modelo, anio, color, placa, tipo },
    })
  }

  try {
    // Crear nuevo vehículo
    const nuevoVehiculo = await Vehiculo.create({
      marca,
      modelo,
      anio,
      color,
      placa,
      tipo,
      usuarioId,
    })

    req.flash("success_msg", "Vehículo registrado correctamente")

    // Si el usuario está autenticado, redirigir a su perfil
    if (usuarioId) {
      res.redirect("/perfil/vehiculos")
    } else {
      // Si no está autenticado, redirigir al formulario de orden
      res.redirect(`/ordenes/nueva?vehiculoId=${nuevoVehiculo.id}`)
    }
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al registrar el vehículo")
    res.redirect("/vehiculos/registro")
  }
}

// Mostrar vehículos del usuario autenticado
exports.misVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { usuarioId: req.session.user.id },
    })

    res.render("vehiculos/mis-vehiculos", {
      titulo: "Mis Vehículos",
      vehiculos,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar tus vehículos")
    res.redirect("/perfil")
  }
}

// Mostrar formulario para editar vehículo
exports.showEditarForm = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id)

    // Verificar que el vehículo exista
    if (!vehiculo) {
      req.flash("error_msg", "Vehículo no encontrado")
      return res.redirect("/perfil/vehiculos")
    }

    // Verificar que el vehículo pertenezca al usuario
    if (vehiculo.usuarioId && vehiculo.usuarioId !== req.session.user.id) {
      req.flash("error_msg", "No tienes permiso para editar este vehículo")
      return res.redirect("/perfil/vehiculos")
    }

    res.render("vehiculos/editar", {
      titulo: "Editar Vehículo",
      vehiculo,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el vehículo")
    res.redirect("/perfil/vehiculos")
  }
}

// Procesar edición de vehículo
exports.actualizarVehiculo = async (req, res) => {
  const { marca, modelo, anio, color, placa, tipo } = req.body

  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id)

    // Verificar que el vehículo exista
    if (!vehiculo) {
      req.flash("error_msg", "Vehículo no encontrado")
      return res.redirect("/perfil/vehiculos")
    }

    // Verificar que el vehículo pertenezca al usuario
    if (vehiculo.usuarioId && vehiculo.usuarioId !== req.session.user.id) {
      req.flash("error_msg", "No tienes permiso para editar este vehículo")
      return res.redirect("/perfil/vehiculos")
    }

    // Actualizar vehículo
    await vehiculo.update({
      marca,
      modelo,
      anio,
      color,
      placa,
      tipo,
    })

    req.flash("success_msg", "Vehículo actualizado correctamente")
    res.redirect("/perfil/vehiculos")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al actualizar el vehículo")
    res.redirect(`/vehiculos/editar/${req.params.id}`)
  }
}

// Eliminar vehículo
exports.eliminarVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id)

    // Verificar que el vehículo exista
    if (!vehiculo) {
      req.flash("error_msg", "Vehículo no encontrado")
      return res.redirect("/perfil/vehiculos")
    }

    // Verificar que el vehículo pertenezca al usuario
    if (vehiculo.usuarioId && vehiculo.usuarioId !== req.session.user.id) {
      req.flash("error_msg", "No tienes permiso para eliminar este vehículo")
      return res.redirect("/perfil/vehiculos")
    }

    // Eliminar vehículo
    await vehiculo.destroy()

    req.flash("success_msg", "Vehículo eliminado correctamente")
    res.redirect("/perfil/vehiculos")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al eliminar el vehículo")
    res.redirect("/perfil/vehiculos")
  }
}

