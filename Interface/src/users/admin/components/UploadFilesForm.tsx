import { IoCloseSharp } from "react-icons/io5";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { UploadContext } from "../../../context/UploadFilesContext";
import { uploadForm } from "../../../helpers/uploadForm";
import { Alerts } from "../../../ui/components/Alerts";


export const UploadFilesForm = () =>{
  const { setForm } = useContext(UploadContext)
  const [category, setCategory] = useState({
    categories: "blueprints",
    company: "ETN"

  })
  const [file, setFile] = useState(null as File | null)
  const [uploadResponse, setUploadResponse] = useState(<></>)


  const handlerCategories = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setCategory({
      ...category,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(
      e.target.files?.[0] || null // Almacenamos el archivo en fileData
    );
  };

  const sendForm = async(e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault()
    const saveFile = await uploadForm(file, category)
    //console.log(saveFile)
    if(saveFile.status === 200 ){
      //alert(`${saveFile.data.message}: ${saveFile.data.path}`)
      setUploadResponse(
        <Alerts type="success">
        <>
          {saveFile.message}
        </>
      </Alerts>
      )

      setTimeout(() =>{
        location.reload()
      },1000)

    }else{
      setUploadResponse(
        <Alerts type="error">
        <>
          {saveFile.err}
        </>
      </Alerts>
      )

      setTimeout(() =>{
        setForm(false)
      },1000)
    }

  }

  
  console.log({category, file})

  return(
    <>
    { uploadResponse }
    <form
    onSubmit={(e) => sendForm(e)} 
    className="absolute top-[20%] left-[40%] w-96 bg-white shadow-xl p-4 grid gap-4 pop-in">
      <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
        <span>Datos del Archivo</span>
        <IoCloseSharp className=" cursor-pointer" onClick={() =>setForm(false)}/>
      </div>
      <div className="w-full grid">
        <label className="text-sm text-red-600" htmlFor="categories">Selecciona la categoria</label>
        <select 
          onChange={handlerCategories}
          className=" outline-red-300 border-gray-200 border-2" name="categories">
          <option value="blueprints">Planos</option>
          <option value="templates">Plantillas</option>
          <option value="price">Cotizaciones</option>
        </select>
      </div>
      <div className="w-full grid">
        <label className="text-sm text-red-600" htmlFor="company">Selecciona la empresa</label>
        <select 
          onChange={handlerCategories}
          className=" outline-red-300 border-gray-200 border-2" name="company">
          <option value="ETN">ETN</option>
          <option value="GHO">GHO</option>
          <option value="Costaline">Costaline</option>
          <option value="IAMSA">IAMSA</option>
        </select>
      </div>
      <input
        name="document" 
        onChange={handleFileChange}
        className="block w-full text-sm border cursor-pointer text-gray-400 focus:outline-none bg-gray-50 border-gray-60 placeholder-gray-400" 
        aria-describedby="carga_de_archivos" 
        id="documentation" 
        type="file" />
      <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all">Subir</button>
    </form>
    </>
  )
}