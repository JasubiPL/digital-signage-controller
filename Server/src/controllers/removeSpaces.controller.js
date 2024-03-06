const removeSpaces = (name) =>{
  nameFormated = name.replace(/\s/g, "-")

  return nameFormated
}

module.exports = removeSpaces