import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { insertRowsDB } from "../../../helpers/insertRowsDB";
import { Alerts } from "../../../ui/components/Alerts";

interface Props {
  modal:  Dispatch<SetStateAction<ReactNode>>,
  reloadInfo: () => Promise<void>,
  company: string
}

export const AddCampaign:FC<Props> = ({ modal, reloadInfo, company }) =>{

  const [campaignData, setCampaignData] = useState({
    name: "",
    inicio: "OLWAYS ON",
    fin: "OLWAYS ON",
    status: "ACTIVA"
  })

  //console.log(CampaignData)

  const handlerCampaign = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setCampaignData({
      ...campaignData,
      [e.target.name]: e.target.value
    })
  }

  const insertCampaign = async (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    const res = await insertRowsDB('campania', `${company}`, campaignData)
    console.log(res)

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
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none" onSubmit={insertCampaign}>
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span>Añadir Nueva Campaña</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </div>
        <label className="mt-6">Nombre de campaña</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="name" 
          onChange={handlerCampaign}
        />
        <label className="mt-6">Fecha de inicio</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="inicio" 
          placeholder="DD/MM/AA o ALWAYS ON"
          onChange={handlerCampaign}
        />
        <label className="mt-6">Fecha de fin</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="fin" 
          placeholder="DD/MM/AA o ALWAYS ON"
          onChange={handlerCampaign}
        />
        <div className="w-full grid mt-3">
          <label className="text-sm" htmlFor="status">Estatus de campaña</label>
          <select 
            onChange={handlerCampaign}
            className="outline-red-300 border-gray-200 border-2" name="status">
            <option value="ACTIVA">ACTIVA</option>
            <option value="INACTIVA">INACTIVA</option>
            <option value="FALTA ACTUALIZAR ARTES">FALTA ACTUALIZAR ARTES</option>
            <option value="ARTES SIN ENTREGAR">ARTES SIN ENTREGAR</option>
            <option value="ARTES ENTREGADAS">ARTES ENTREGADAS</option>
          </select>
        </div>
        <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Agregar</button>
      </form>
    </section>
  )
} 