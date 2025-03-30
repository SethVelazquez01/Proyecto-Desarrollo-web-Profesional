const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")

// Importar configuración de la base de datos
const db = require("./config/database")

// Crear la aplicación Express
const app = express()

// Configurar middleware
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")))

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Configurar sesiones
app.use(
  session({
    secret: "autolavado_secret_key",
    resave: false,
    saveUninitialized: false,
  }),
)

// Configurar flash messages
app.use(flash())

// Middleware para variables globales
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  next()
})

// Importar y usar rutas
const mainRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")
const vehiculoRoutes = require("./routes/vehiculos")
const ordenRoutes = require("./routes/ordenes")
const empleadoRoutes = require("./routes/empleados")

app.use("/", mainRoutes)
app.use("/auth", authRoutes)
app.use("/vehiculos", vehiculoRoutes)
app.use("/ordenes", ordenRoutes)
app.use("/empleados", empleadoRoutes)

// Probar conexión a la base de datos
db.authenticate()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch((err) => console.error("Error al conectar a la base de datos:", err))

// Sincronizar modelos con la base de datos
db.sync({ force: false })
  .then(() => console.log("Tablas sincronizadas"))
  .catch((err) => console.error("Error al sincronizar tablas:", err))

// Iniciar el servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`)
})