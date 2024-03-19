import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { editRowsDB } from "../../helpers/editRowsDB"
import { Alerts } from "./Alerts"

interface DataBoxOffice{
  id: string
  nombre: string,
  dispositivo: string,
  proyeccion: string,
  estatus: string
}

interface Props {
  modal: Dispatch<SetStateAction<ReactNode>>,
  data: DataBoxOffice,
  reloadInfo: () => Promise<void>,
  company: string
}



export const EditBoxOffice:FC<Props> = ({ data, modal, reloadInfo, company }) => {

  const [boxOfficeData, setBoxOfficeData] = useState({
    id: data.id,
    name: data.nombre,
    device: data.dispositivo,
    projection: data.proyeccion,
    status: data.estatus
  })

  const handlerOffice = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setBoxOfficeData({
      ...boxOfficeData,
      [e.target.name]: e.target.value
    })
  }

  const editBoxOffice = async (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    const res = await editRowsDB("taquilla", `${company}`, boxOfficeData)

    if(res.status != 200){
      modal(
        <Alerts type="error">
          <>
            {res.message}
          </>
        </Alerts>
      )

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

  }

  return (
    <section className={`w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center`}>
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none" onSubmit={editBoxOffice}>
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span className="text-2xl text-red-600 font-semibold">Editar Taquilla</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </div>
        <label className="mt-6">Nombre de taquilla</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="name" 
          onChange={handlerOffice}
          value={boxOfficeData.name}
        />
        <div className="w-full grid mt-3">
          <label className="text-sm text-red-600" htmlFor="device">Selecciona el Dispositivo</label>
          <select 
            onChange={handlerOffice}
            value={boxOfficeData.device}
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
            value={boxOfficeData.projection}
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
            value={boxOfficeData.status}
            className="outline-red-300 border-gray-200 border-2" name="status">
            <option value="OK">OK</option>
            <option value="Remodelacion">Remodelación</option>
            <option value="Pantalla Dañada">Pantalla Dañada</option>
          </select>
        </div>
        <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Actualizar</button>
      </form>
    </section>
  )
}