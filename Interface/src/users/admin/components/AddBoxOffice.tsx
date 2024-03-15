import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { insertRowsDB } from "../../../helpers/insertRowsDB";
import { Alerts } from "../../../ui/components/Alerts";

interface Props {
  modal:  Dispatch<SetStateAction<ReactNode>>,
  reloadInfo: () => Promise<void>
}

export const AddBoxOffice:FC<Props> = ({ modal, reloadInfo }) =>{

  const [boxOfficeData, setBoxOfficeData] = useState({
    name: "",
    device: "PANTALLAS",
    projection: "PLAYER",
    status: "OK"
  })

  //console.log(boxOfficeData)

  const handlerOffice = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setBoxOfficeData({
      ...boxOfficeData,
      [e.target.name]: e.target.value
    })
  }

  const insertBoxOffice = async (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    const res = await insertRowsDB('taquilla', 'ETN', boxOfficeData)
    //console.log(res)

    if(res.status != 201){
      modal(
        <Alerts type="warning">
          <>
            {res.message}
          </>
        </Alerts>
      )

      setTimeout(() =>{
        modal(null)
      },1000)

      return
    }

    modal(
      <Alerts type="success">
        <>
          {res.message}
        </>
      </Alerts>
    )
    
    reloadInfo()
    setTimeout(() =>{
      modal(null)
    },1000)
    //TODO => Manejo de modal para el mensaje


  }

  return(
    <section className={`w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center`}>
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none" onSubmit={insertBoxOffice}>
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span>Añadir Nueva Taquilla</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </div>
        <label className="mt-6">Nombre de taquilla</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="name" 
          onChange={handlerOffice}
        />
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="device">Selecciona el Dispositivo</label>
        <select 
          onChange={handlerOffice}
          className="outline-red-300 border-gray-200 border-2" name="device">
          <option value="PANTALLAS">PANTALLAS</option>
          <option value="PANEL LED">PANEL LED</option>
          <option value="LED Y PANTALLAS">LED Y PANTALLAS</option>
        </select>
      </div>
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="projection">Medio de Proyección</label>
        <select 
          onChange={handlerOffice}
          className="outline-red-300 border-gray-200 border-2" name="projection">
          <option value="PLAYER">PLAYER</option>
          <option value="USB">USB</option>
          <option value="STREAMING">STREAMING</option>
        </select>
      </div>
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="status">Estatus de taquilla</label>
        <select 
          onChange={handlerOffice}
          className="outline-red-300 border-gray-200 border-2" name="status">
          <option value="OK">OK</option>
          <option value="Remodelacion">Remodelación</option>
          <option value="Pantalla Dañada">Pantalla Dañada</option>
        </select>
      </div>
      <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Agregar</button>
      </form>
    </section>
  )
} 