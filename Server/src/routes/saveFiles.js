const express = require("express")
const colors = require("colors")

//controllers
const { blueprintsFolder, templatesFolder, priceFolder } = require("../controllers/multerRouteManagement.controller")
const removeSpaces = require("../controllers/removeSpaces.controller")

//create route
const saveFiles = express.Router()


saveFiles.post("/save-blueprints", blueprintsFolder.single("document"), (req, res, next) =>{
  const file = req.file
  console.log("===== Recibiendo Archivo =====" .cyan)
  console.log(file)

  const fileName = removeSpaces(file.originalname)

  const savePath = `http://localhost:7000/blueprints/${fileName}`
  console.log("\nGuardando Archivo..." .yellow )
  console.log(`\nArchivo guardado en ${savePath}` .green)


  res.json({
    "message": `Archivo guardado exitosamente`
  })
})

saveFiles.post("/save-templates", templatesFolder.single("document"), (req, res, next) =>{
  const file = req.file
  console.log("===== Recibiendo Archivo =====" .cyan)
  console.log(file)

  const savePath = `http://localhost:7000/templates/${file.originalname}`
  console.log("\nGuardando Archivo..." .yellow )
  console.log(`\nArchivo guardado en ${savePath}` .green)


  res.json({
    "message": `Archivo guardado exitosamente`
  })
})

saveFiles.post("/save-price", priceFolder.single("document"), (req, res, next) =>{
  const file = req.file
  console.log("===== Recibiendo Archivo =====" .cyan)
  console.log(file)

  const savePath = `http://localhost:7000/price/${file.originalname}`
  console.log("\nGuardando Archivo..." .yellow )
  console.log(`\nArchivo guardado en ${savePath}` .green)


  res.json({
    "message": `Archivo guardado exitosamente`
  })
})

module.exports = saveFiles