const express = require("express")
const colors = require("colors")
const fs = require("fs")
const path = require("path")
const removeSpaces = require("../controllers/removeSpaces.controller")

//controllers

//create route
const getFiles = express.Router()

getFiles.get("/search-templates", (req, res) =>{
  console.log("===== Nueva Peticion a Templates ====== \n" .cyan)
  const { company } = req.query

  console.log(`Buscando archivos en :` .yellow)
  const folderPath = path.join(process.cwd(), "src","files", company, "templates")
  console.log(folderPath)
 
  const files = fs.readdir(folderPath, (err, files) =>{
    if(err){
      console.log("Error al leer el directorio" .red)
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }
    console.log("\nArchivos encontrados:" .green)
    console.log(files)

    console.log(`\nExtrayendo informacion de los archivos...` .yellow)
    const fileList = files.map(file =>{
      const filePath = path.join(folderPath, file)
      const metadata = fs.statSync(filePath)
      const sizeFile = metadata.size / (1024 * 1024) //convertimos de byte a Mb
      
      const downloadPath = `http://localhost:7000/${company}/templates/${file}`

      // Formatemaos la fecha
      const dateModified = metadata.mtime.toString()
      const date = dateModified.slice(4, 15)
      const modifiedDate = removeSpaces(date)


      return {
        name: file,
        filePath: downloadPath,
        extension: path.extname(file),
        modifiedDate,  // Fecha de modificación
        size: `${sizeFile.toFixed(2)} Mb` // Solo tomamos 2 decimales
      }
    })

    console.log(fileList)

    res.json(fileList)
  })

})

getFiles.get("/search-blueprints", (req, res) =>{
  console.log("===== Nueva Peticion a Templates ====== \n" .cyan)
  const { company } = req.query

  console.log(`Buscando archivos en :` .yellow)
  const folderPath = path.join(process.cwd(), "src","files", company, "blueprints")
  console.log(folderPath)
 
  const files = fs.readdir(folderPath, (err, files) =>{
    if(err){
      console.log("Error al leer el directorio" .red)
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }
    console.log("\nArchivos encontrados:" .green)
    console.log(files)

    console.log(`\nExtrayendo informacion de los archivos...` .yellow)
    const fileList = files.map(file =>{
      const filePath = path.join(folderPath, file)
      const metadata = fs.statSync(filePath)
      const sizeFile = metadata.size / (1024 * 1024) //convertimos de byte a Mb
      
      const downloadPath = `http://localhost:7000/${company}/blueprints/${file}`

      // Formatemaos la fecha
      const dateModified = metadata.mtime.toString()
      const date = dateModified.slice(4, 15)
      const modifiedDate = removeSpaces(date)


      return {
        name: file,
        filePath: downloadPath,
        extension: path.extname(file),
        modifiedDate,  // Fecha de modificación
        size: `${sizeFile.toFixed(2)} Mb` // Solo tomamos 2 decimales
      }
    })

    console.log(fileList)

    res.json(fileList)
  })

})

getFiles.get("/search-price", (req, res) =>{
  console.log("===== Nueva Peticion a Templates ====== \n" .cyan)
  const { company } = req.query

  console.log(`Buscando archivos en :` .yellow)
  const folderPath = path.join(process.cwd(), "src","files", company, "price")
  console.log(folderPath)
 
  const files = fs.readdir(folderPath, (err, files) =>{
    if(err){
      console.log("Error al leer el directorio" .red)
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }
    console.log("\nArchivos encontrados:" .green)
    console.log(files)

    console.log(`\nExtrayendo informacion de los archivos...` .yellow)
    const fileList = files.map(file =>{
      const filePath = path.join(folderPath, file)
      const metadata = fs.statSync(filePath)
      const sizeFile = metadata.size / (1024 * 1024) //convertimos de byte a Mb
      
      const downloadPath = `http://localhost:7000/${company}/price/${file}`

      // Formatemaos la fecha
      const dateModified = metadata.mtime.toString()
      const date = dateModified.slice(4, 15)
      const modifiedDate = removeSpaces(date)


      return {
        name: file,
        filePath: downloadPath,
        extension: path.extname(file),
        modifiedDate,  // Fecha de modificación
        size: `${sizeFile.toFixed(2)} Mb` // Solo tomamos 2 decimales
      }
    })

    console.log(fileList)

    res.json(fileList)
  })

})

module.exports = getFiles