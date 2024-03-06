const express = require("express")
const cors = require("cors")
const path = require("path")
const saveFiles = require("./routes/saveFiles")
const getFiles = require("./routes/getFiles")

//Building Server
const PORT = process.env.PORT || 7000
const app = express()

//middlewares
app.use(cors({origin: "*"}))
app.use(express.json());
app.use(express.static(path.join(__dirname, "files")))



//Routes
app.use("/api", saveFiles, getFiles)


app.get("/", (req, res) =>{
  console.log(path.join(__dirname, "files"))
  res.send("<h1>Ruta no valida Mira al documentacion de la API en <a href='https://jasubip.vercel.app'>https://jasubip.vercel.app</a></h1>")
})

app.get("/api",  (req, res, next) =>{
  res.send("<h1>Esta ruta no soporta metodo GET </h1>")
})



app.listen(PORT, () =>{
  console.log(`Escuchando en el puerto ${ PORT }`)
})