import { useContext } from "react"
import { UploadContext } from "../../context/UploadFilesContext"

export const UploadFiles = () =>{
  const { setForm } = useContext(UploadContext)
  return(
    <button 
      className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all"
      onClick={() => setForm(true)}
    >
      Subir Archivos + 
    </button>
  )
}