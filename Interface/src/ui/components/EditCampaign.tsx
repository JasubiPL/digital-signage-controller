import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { editRowsDB } from "../../helpers/editRowsDB"
import { Alerts } from "./Alerts"
import { useLocation } from "react-router-dom"

interface DataCampaign{
  id: string
  nombre: string,
  inicio: string,
  fin: string,
  status: string
}

interface Props {
  modal: Dispatch<SetStateAction<ReactNode>>,
  data: DataCampaign,
  reloadInfo: () => Promise<void>,
  company: string
}



export const EditCampaign:FC<Props> = ({ data, modal, reloadInfo, company }) => {

  const [campaignData, setCampaignData] = useState({
    id: data.id,
    name: data.nombre,
    inicio: data.inicio,
    fin: data.fin,
    status: data.status
  })

  const currentPath = useLocation()

  const handlerCampaign = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setCampaignData({
      ...campaignData,
      [e.target.name]: e.target.value
    })
  }

  const editCampaign = async (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    const res = await editRowsDB("campania", `${company}`, campaignData)

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
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none" onSubmit={editCampaign}>
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span>Actualizar Estatus</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </div>
        {
          currentPath.pathname.includes("admin")
          ?
          <>
            <label className="mt-6">Nombre de campaña</label>
            <input 
              className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
              type="text" 
              name="name" 
              value={campaignData.name}
              onChange={handlerCampaign}
            />
            <label className="mt-6">Fecha de inicio</label>
            <input 
              className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
              type="text" 
              name="inicio" 
              placeholder="DD/MM/AA o ALWAYS ON"
              value={campaignData.inicio}
              onChange={handlerCampaign}
            />
            <label className="mt-6">Fecha de fin</label>
            <input 
              className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
              type="text" 
              name="fin" 
              placeholder="DD/MM/AA o ALWAYS ON"
              value={campaignData.fin}
              onChange={handlerCampaign}
            />
          </>
          :
          ""
        }
        <div className="w-full grid mt-3">
          <label className="text-sm" htmlFor="status">Estatus de campaña</label>
          <select 
            onChange={handlerCampaign}
            value={campaignData.status}
            className="outline-red-300 border-gray-200 border-2" name="status">
            <option value="ACTIVA">ACTIVA</option>
            <option value="INACTIVA">INACTIVA</option>
            <option value="FALTA ACTUALIZAR ARTES">FALTA ACTUALIZAR ARTES</option>
            <option value="ARTES SIN ENTREGAR">ARTES SIN ENTREGAR</option>
            <option value="ARTES ENTREGADAS">ARTES ENTREGADAS</option>
          </select>
        </div>
        <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Actualizar</button>
      </form>
    </section>
  )
}