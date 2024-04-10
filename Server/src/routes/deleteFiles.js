const express = require("express")
const colors = require("colors")
const fs = require("fs")
const path = require("path")

//controllers

//create route
const deleteFiles = express.Router()

deleteFiles.delete("/delete-file", (req, res) =>{
  const { fileName } = req.query

  fileDir = path.join(process.cwd() + "/src/files" + fileName)
  console.log(fileDir)

  fs.access(fileDir, fs.constants.F_OK, ( err ) =>{
    if(err){
      return res.status(404).send('El archivo no existe');
    }

    fs.unlink(fileDir, (err) =>{
      if (err) {
        return res.status(500).send('Error al eliminar el archivo');
    }
    res.send('Archivo eliminado correctamente');
    })
  })
})

module.exports = deleteFiles