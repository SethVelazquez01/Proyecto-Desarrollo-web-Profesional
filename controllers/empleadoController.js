const Empleado = require("../models/Empleado")
const { Orden } = require("../models/Orden")
const Vehiculo = require("../models/Vehiculo")
const Servicio = require("../models/Servicio")
const Usuario = require("../models/Usuario")

// Mostrar formulario de login para empleados
exports.showLoginForm = (req, res) => {
  res.render("empleados/login", {
    titulo: "Acceso de Empleados",
  })
}

// Procesar login de empleado
exports.loginEmpleado = async (req, res) => {
  const { email, password } = req.body

  try {
    // Buscar empleado por email
    const empleado = await Empleado.findOne({ where: { email} })

    if (!empleado) {
      console.log("Empleado no encontrado:", email)
      req.flash("error_msg", "Email o contraseña incorrectos")
      return res.redirect("/empleados/login")
    }

    // Verificar contraseña
    const passwordValido = empleado.verificarPassword(password)

    if (!passwordValido) {
      console.log("Contraseña inválida para:", email)
      req.flash("error_msg", "Email o contraseña incorrectos")
      return res.redirect("/empleados/login")
    }

    // Guardar empleado en sesión (sin la contraseña)
    req.session.empleado = {
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      rol: empleado.rol,
    }

    console.log("Empleado autenticado:", req.session.empleado)

    // Asegurarse de que la sesión se guarde antes de redirigir
    req.session.save((err) => {
      if (err) {
        console.error("Error al guardar la sesión:", err)
        req.flash("error_msg", "Error al iniciar sesión")
        return res.redirect("/empleados/login")
      }

      req.flash("success_msg", `Bienvenido ${empleado.nombre}`)
      res.redirect("/empleados/dashboard")
    })
  } catch (error) {
    console.error("Error en loginEmpleado:", error)
    req.flash("error_msg", "Ocurrió un error al iniciar sesión")
    res.redirect("/empleados/login")
  }
}

// Cerrar sesión de empleado
exports.logout = (req, res) => {
  req.session.empleado = null
  res.redirect("/empleados/login")
}

// Dashboard de empleados
exports.dashboard = async (req, res) => {
  try {
    // Obtener órdenes pendientes y en proceso
    const ordenes = await Orden.findAll({
      where: {
        estado: ["Pendiente", "En Proceso"],
      },
      include: [
        { model: Vehiculo, as: "vehiculo" },
        { model: Usuario, as: "cliente" },
        { model: Empleado, as: "empleado" },
      ],
      order: [["createdAt", "ASC"]],
    })

    res.render("empleados/dashboard", {
      titulo: "Panel de Empleados",
      ordenes,
      empleado: req.session.empleado,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el dashboard")
    res.redirect("/empleados/login")
  }
}

// Mostrar todas las órdenes (para administradores)
exports.todasLasOrdenes = async (req, res) => {
  try {
    // Obtener todas las órdenes
    const ordenes = await Orden.findAll({
      include: [
        { model: Vehiculo, as: "vehiculo" },
        { model: Usuario, as: "cliente" },
        { model: Empleado, as: "empleado" },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.render("empleados/todas-ordenes", {
      titulo: "Todas las Órdenes",
      ordenes,
      empleado: req.session.empleado,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar las órdenes")
    res.redirect("/empleados/dashboard")
  }
}

// Actualizar estado de una orden
exports.actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  try {
    const orden = await Orden.findByPk(id)

    if (!orden) {
      req.flash("error_msg", "Orden no encontrada")
      return res.redirect("/empleados/dashboard")
    }

    // Actualizar estado y asignar empleado si no está asignado
    await orden.update({
      estado,
      empleadoId: orden.empleadoId || req.session.empleado.id,
    })

    req.flash("success_msg", "Estado de la orden actualizado correctamente")
    res.redirect("/empleados/dashboard")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al actualizar el estado de la orden")
    res.redirect("/empleados/dashboard")
  }
}

// Gestión de empleados (solo para administradores)
exports.gestionEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      attributes: { exclude: ["password"] },
    })

    res.render("empleados/gestion", {
      titulo: "Gestión de Empleados",
      empleados,
      empleado: req.session.empleado,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar los empleados")
    res.redirect("/empleados/dashboard")
  }
}

// Mostrar formulario para crear empleado
exports.showCrearEmpleadoForm = (req, res) => {
  res.render("empleados/crear", {
    titulo: "Crear Empleado",
    empleadoData: {},
  })
}

// Procesar creación de empleado
exports.crearEmpleado = async (req, res) => {
  const { nombre, apellido, email, telefono, password, confirmarPassword, rol } = req.body

  // Validaciones básicas
  const errores = []
  if (!nombre || !apellido || !email || !password || !rol) {
    errores.push({ mensaje: "Todos los campos son obligatorios" })
  }
  if (password !== confirmarPassword) {
    errores.push({ mensaje: "Las contraseñas no coinciden" })
  }
  if (password && password.length < 6) {
    errores.push({ mensaje: "La contraseña debe tener al menos 6 caracteres" })
  }

  // Si hay errores, volver al formulario
  if (errores.length > 0) {
    return res.render("empleados/crear", {
      titulo: "Crear Empleado",
      errores,
      empleadoData: { nombre, apellido, email, telefono, rol },
    })
  }

  try {
    // Verificar si el email ya está registrado
    const empleadoExistente = await Empleado.findOne({ where: { email } })
    if (empleadoExistente) {
      errores.push({ mensaje: "El email ya está registrado" })
      return res.render("empleados/crear", {
        titulo: "Crear Empleado",
        errores,
        empleadoData: { nombre, apellido, email, telefono, rol },
      })
    }

    // Crear nuevo empleado
    await Empleado.create({
      nombre,
      apellido,
      email,
      telefono,
      password,
      rol,
    })

    req.flash("success_msg", "Empleado creado correctamente")
    res.redirect("/empleados/gestion")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al crear el empleado")
    res.redirect("/empleados/crear")
  }
}

// Mostrar formulario para editar empleado
exports.showEditarEmpleadoForm = async (req, res) => {
  try {
    const empleadoData = await Empleado.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    })

    if (!empleadoData) {
      req.flash("error_msg", "Empleado no encontrado")
      return res.redirect("/empleados/gestion")
    }

    res.render("empleados/editar", {
      titulo: "Editar Empleado",
      empleadoData,
    })
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al cargar el empleado")
    res.redirect("/empleados/gestion")
  }
}

// Procesar edición de empleado
exports.actualizarEmpleado = async (req, res) => {
  const { nombre, apellido, email, telefono, password, confirmarPassword, rol, activo } = req.body

  try {
    const empleado = await Empleado.findByPk(req.params.id)

    if (!empleado) {
      req.flash("error_msg", "Empleado no encontrado")
      return res.redirect("/empleados/gestion")
    }

    // Preparar datos para actualizar
    const datosActualizar = {
      nombre,
      apellido,
      email,
      telefono,
      rol,
      activo: activo === "on" || activo === true,
    }

    // Si se proporciona una nueva contraseña, validarla y actualizarla
    if (password) {
      if (password !== confirmarPassword) {
        req.flash("error_msg", "Las contraseñas no coinciden")
        return res.redirect(`/empleados/editar/${req.params.id}`)
      }
      if (password.length < 6) {
        req.flash("error_msg", "La contraseña debe tener al menos 6 caracteres")
        return res.redirect(`/empleados/editar/${req.params.id}`)
      }
      datosActualizar.password = password
    }

    // Actualizar empleado
    await empleado.update(datosActualizar)

    req.flash("success_msg", "Empleado actualizado correctamente")
    res.redirect("/empleados/gestion")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al actualizar el empleado")
    res.redirect(`/empleados/editar/${req.params.id}`)
  }
}

// Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id)

    if (!empleado) {
      req.flash("error_msg", "Empleado no encontrado")
      return res.redirect("/empleados/gestion")
    }

    // No permitir eliminar al propio usuario
    if (empleado.id === req.session.empleado.id) {
      req.flash("error_msg", "No puedes eliminar tu propio usuario")
      return res.redirect("/empleados/gestion")
    }

    // Eliminar empleado
    await empleado.destroy()

    req.flash("success_msg", "Empleado eliminado correctamente")
    res.redirect("/empleados/gestion")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al eliminar el empleado")
    res.redirect("/empleados/gestion")
  }
}



