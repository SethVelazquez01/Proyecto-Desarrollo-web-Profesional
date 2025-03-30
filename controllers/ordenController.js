const { Orden, OrdenServicio } = require("../models/Orden")
const Vehiculo = require("../models/Vehiculo")
const Servicio = require("../models/Servicio")
const db = require("../config/database")

// Mostrar formulario para crear nueva orden
exports.showNuevaOrdenForm = async (req, res) => {
  try {
    // Obtener servicios disponibles
    const servicios = await Servicio.findAll({ where: { activo: true } })

    // Si se proporciona un vehiculoId, obtener el vehículo
    let vehiculo = null
    if (req.query.vehiculoId) {
      vehiculo = await Vehiculo.findByPk(req.query.vehiculoId)
    }

    // Si el usuario está autenticado, obtener sus vehículos
    let vehiculosUsuario = []
    if (req.session.user) {
      vehiculosUsuario = await Vehiculo.findAll({
        where: { usuarioId: req.session.user.id },
      })
    }

    res.render("ordenes/nueva", {
      titulo: "Nueva Orden de Lavado",
      servicios,
      vehiculo,
      vehiculosUsuario,
      usuarioAutenticado: !!req.session.user,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el formulario")
    res.redirect("/")
  }
}

// Procesar creación de nueva orden
exports.crearOrden = async (req, res) => {
  const { vehiculoId, serviciosIds, nombreCliente, telefonoCliente, observaciones } = req.body
  let t = null

  // Convertir serviciosIds a array si no lo es
  const serviciosArray = Array.isArray(serviciosIds) ? serviciosIds : serviciosIds ? [serviciosIds] : []

  // Validaciones básicas
  const errores = []
  if (!vehiculoId) {
    errores.push({ mensaje: "Debes seleccionar un vehículo" })
  }
  if (!serviciosArray.length) {
    errores.push({ mensaje: "Debes seleccionar al menos un servicio" })
  }
  if (!req.session.user && (!nombreCliente || !telefonoCliente)) {
    errores.push({ mensaje: "Nombre y teléfono son obligatorios para clientes no registrados" })
  }

  // Si hay errores, volver al formulario
  if (errores.length > 0) {
    try {
      // Obtener datos para volver a renderizar el formulario
      const servicios = await Servicio.findAll({ where: { activo: true } })
      const vehiculo = await Vehiculo.findByPk(vehiculoId)
      let vehiculosUsuario = []
      if (req.session.user) {
        vehiculosUsuario = await Vehiculo.findAll({
          where: { usuarioId: req.session.user.id },
        })
      }

      return res.render("ordenes/nueva", {
        titulo: "Nueva Orden de Lavado",
        errores,
        servicios,
        vehiculo,
        vehiculosUsuario,
        usuarioAutenticado: !!req.session.user,
        formData: req.body,
      })
    } catch (error) {
      console.error("Error al renderizar formulario con errores:", error)
      req.flash("error_msg", "Ocurrió un error al procesar el formulario")
      return res.redirect("/ordenes/nueva")
    }
  }

  try {
    // Iniciar transacción
    t = await db.transaction()

    // Obtener servicios seleccionados con sus precios
    const serviciosSeleccionados = await Servicio.findAll({
      where: { id: serviciosArray },
      transaction: t,
    })

    if (serviciosSeleccionados.length === 0) {
      throw new Error("No se encontraron los servicios seleccionados")
    }

    // Calcular total
    let total = 0
    serviciosSeleccionados.forEach((servicio) => {
      total += Number.parseFloat(servicio.precio)
    })

    // Crear la orden
    const nuevaOrden = await Orden.create(
      {
        vehiculoId,
        usuarioId: req.session.user ? req.session.user.id : null,
        nombreCliente: req.session.user ? null : nombreCliente,
        telefonoCliente: req.session.user ? null : telefonoCliente,
        observaciones,
        total,
        estado: "Pendiente",
      },
      { transaction: t },
    )

    console.log("Orden creada con ID:", nuevaOrden.id)

    // Crear registros en la tabla intermedia OrdenServicio uno por uno
    for (const servicio of serviciosSeleccionados) {
      await OrdenServicio.create(
        {
          OrdenId: nuevaOrden.id,
          ServicioId: servicio.id,
          cantidad: 1,
          precioUnitario: servicio.precio,
          subtotal: servicio.precio,
        },
        { transaction: t },
      )
      console.log(`Servicio ${servicio.id} agregado a la orden ${nuevaOrden.id}`)
    }

    // Confirmar transacción
    await t.commit()
    console.log("Transacción completada exitosamente")

    req.flash("success_msg", `Orden creada correctamente. Tu número de orden es: ${nuevaOrden.id}`)
    res.redirect(`/ordenes/detalle/${nuevaOrden.id}`)
  } catch (error) {
    console.error("Error al crear orden:", error)

    // Revertir transacción en caso de error
    if (t && !t.finished) {
      try {
        await t.rollback()
        console.log("Transacción revertida")
      } catch (rollbackError) {
        console.error("Error al hacer rollback:", rollbackError)
      }
    }

    req.flash("error_msg", "Ocurrió un error al crear la orden. Por favor, inténtalo de nuevo.")
    res.redirect("/ordenes/nueva")
  }
}

// Mostrar detalle de una orden
exports.detalleOrden = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id, {
      include: [
        { model: Vehiculo, as: "vehiculo" },
        { model: Servicio, as: "servicios" },
      ],
    })

    if (!orden) {
      req.flash("error_msg", "Orden no encontrada")
      return res.redirect("/")
    }

    // Verificar que la orden pertenezca al usuario autenticado o sea un empleado
    if (!req.session.empleado && orden.usuarioId && orden.usuarioId !== req.session.user?.id) {
      req.flash("error_msg", "No tienes permiso para ver esta orden")
      return res.redirect("/")
    }

    res.render("ordenes/detalle", {
      titulo: `Orden #${orden.id}`,
      orden,
      esEmpleado: !!req.session.empleado,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el detalle de la orden")
    res.redirect("/")
  }
}

// Mostrar órdenes del usuario autenticado
exports.misOrdenes = async (req, res) => {
  try {
    const ordenes = await Orden.findAll({
      where: { usuarioId: req.session.user.id },
      include: [{ model: Vehiculo, as: "vehiculo" }],
      order: [["createdAt", "DESC"]],
    })

    res.render("ordenes/mis-ordenes", {
      titulo: "Mis Órdenes",
      ordenes,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar tus órdenes")
    res.redirect("/perfil")
  }
}

// Cancelar orden
exports.cancelarOrden = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id)

    if (!orden) {
      req.flash("error_msg", "Orden no encontrada")
      return res.redirect("/ordenes/mis-ordenes")
    }

    // Verificar que la orden pertenezca al usuario autenticado
    if (orden.usuarioId !== req.session.user.id) {
      req.flash("error_msg", "No tienes permiso para cancelar esta orden")
      return res.redirect("/ordenes/mis-ordenes")
    }

    // Verificar que la orden esté en estado Pendiente
    if (orden.estado !== "Pendiente") {
      req.flash("error_msg", "Solo se pueden cancelar órdenes pendientes")
      return res.redirect(`/ordenes/detalle/${orden.id}`)
    }

    // Actualizar estado de la orden
    await orden.update({ estado: "Cancelado" })

    req.flash("success_msg", "Orden cancelada correctamente")
    res.redirect("/ordenes/mis-ordenes")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cancelar la orden")
    res.redirect("/ordenes/mis-ordenes")
  }
}




