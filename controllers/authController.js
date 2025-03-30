const Usuario = require("../models/Usuario")

// Mostrar formulario de registro
exports.showRegistroForm = (req, res) => {
  res.render("auth/registro", {
    titulo: "Registro de Usuario",
    usuario: {},
  })
}

// Procesar registro de usuario
exports.registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, password, confirmarPassword } = req.body

  // Validaciones básicas
  const errores = []
  if (!nombre || !apellido || !email || !password) {
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
    return res.render("auth/registro", {
      titulo: "Registro de Usuario",
      errores,
      usuario: { nombre, apellido, email, telefono },
    })
  }

  try {
    // Verificar si el email ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } })
    if (usuarioExistente) {
      errores.push({ mensaje: "El email ya está registrado" })
      return res.render("auth/registro", {
        titulo: "Registro de Usuario",
        errores,
        usuario: { nombre, apellido, email, telefono },
      })
    }

    // Crear nuevo usuario
    await Usuario.create({
      nombre,
      apellido,
      email,
      telefono,
      password,
    })

    req.flash("success_msg", "Te has registrado correctamente, ahora puedes iniciar sesión")
    res.redirect("/auth/login")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al registrar el usuario")
    res.redirect("/auth/registro")
  }
}

// Mostrar formulario de login
exports.showLoginForm = (req, res) => {
  res.render("auth/login", {
    titulo: "Iniciar Sesión",
  })
}

// Procesar login de usuario
exports.loginUsuario = async (req, res) => {
  const { email, password } = req.body

  try {
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
      req.flash("error_msg", "Email o contraseña incorrectos")
      return res.redirect("/auth/login")
    }

    // Verificar contraseña
    const passwordValido = usuario.verificarPassword(password)
    if (!passwordValido) {
      req.flash("error_msg", "Email o contraseña incorrectos")
      return res.redirect("/auth/login")
    }

    // Guardar usuario en sesión (sin la contraseña)
    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    }

    req.flash("success_msg", `Bienvenido ${usuario.nombre}`)
    res.redirect("/perfil")
  } catch (error) {
    console.error(error)
    req.flash("error_msg", "Ocurrió un error al iniciar sesión")
    res.redirect("/auth/login")
  }
}

// Cerrar sesión
exports.logout = (req, res) => {
  req.session.destroy()
  res.redirect("/")
}

