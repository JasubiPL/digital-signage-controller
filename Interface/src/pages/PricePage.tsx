import { IoCloudDownloadOutline } from "react-icons/io5";
import { useEffect, useState } from "react"
import { FileType } from "../ui/components/FileType";
import { getFiles } from "../helpers/getFiles";


interface Doc {
  name: string,
  filePath: string,
  extension: string,
  modifiedDate: string,
  size: string
}

export const PricePage= () =>{
  const [files, setFiles] = useState<Doc[]>([])
  const [company, setCompany] = useState("ETN")
 
  
  const readFiles = async () =>{
    const filesData = await getFiles("price", company)
    setFiles(filesData)
    console.log(filesData)
  }

  useEffect(() =>{
    readFiles()
},[company])



  return(
    <section className="w-full  h-full flex flex-col items-center overflow-y-auto my-8">
      <select 
        className=" self-end mr-[5%] bg-red-600 text-white text-xl"
        onChange={(e) => setCompany(e.target.value)}
      >
        <option value="ETN">ETN</option>
        <option value="GHO">GHO</option>
        <option value="Costaline">Costaline</option>
      </select>
      <section className="w-[90%] pt-4 bg-white mt-2 border-b-[1px] border-gray-200">
        <header className="text-center grid grid-cols-files font-semibold border-b-[1px] border-gray-200 pb-1">
          <article>Nombre ▾</article>
          <article>Modificacion ▾</article>
          <article>Tamaño del Archivo ▾</article>
          <article>Descargar ▾</article>
        </header>
        {
          files.map(file =>(
            <div key={file.name} className="text-center grid grid-cols-files border-b-[1px] border-gray-200 pb-1">
              <div className="text-sm text-center py-3 flex items-center gap-3 px-2">
                <FileType extension={file.extension} />
                {file.name}
              </div>
              <div className="text-sm text-center py-3 flex justify-center items-center">{file.modifiedDate}</div>
              <div className="text-sm text-center py-3 flex justify-center items-center">{file.size}</div>
              <a href={file.filePath} target="__blanck" className="text-2xl flex justify-center items-center text-green-500 hover:scale-110 transition-all">
              <IoCloudDownloadOutline />
              </a>
            </div>
          ))
        }
      </section>
    </section>
  )
}