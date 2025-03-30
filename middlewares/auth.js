// Middleware para verificar si el usuario está autenticado
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next()
    }
    req.flash("error_msg", "Debes iniciar sesión para acceder a esta página")
    res.redirect("/auth/login")
  }
  
  // Middleware para verificar si el empleado está autenticado
  exports.isEmpleado = (req, res, next) => {
    if (req.session.empleado) {
      return next()
    }
    req.flash("error_msg", "Acceso restringido a empleados")
    res.redirect("/empleados/login")
  }
  
  // Middleware para verificar si es administrador
  exports.isAdmin = (req, res, next) => {
    if (req.session.empleado && req.session.empleado.rol === "admin") {
      return next()
    }
    req.flash("error_msg", "Acceso restringido a administradores")
    res.redirect("/empleados/dashboard")
  }
  
  