import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { getInfoDb } from "../../../helpers/getInfoDB";

interface Props {
  modal:  Dispatch<SetStateAction<ReactNode>>,
  company: string,
  boxOffice: string
}

interface Campaign {
  id: string,
  nombre: string,
  inicio: string,
  fin: string,
  status: string
}

export const AddCampaignToBoxOffice:FC<Props> = ({ modal, company, boxOffice }) =>{

  const [selectedCampaigns, setSelectedCampaigns] = useState("Aviso de Privaciad")
  const [allCampaign, setAllCampaign] = useState<Campaign[]>([])

  const getCampaign = async () =>{
    const queryData =  await getInfoDb('campanias', company)
    console.log(queryData)
    setAllCampaign(queryData)

  }

  const handlerForm = (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    alert(selectedCampaigns)
  }

  console.log(selectedCampaigns)

  useEffect(() =>{
    getCampaign()
  },[])

  return(
    <section className={`w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center`}>
      <form className=" w-1/3 bg-white grid py-6 px-6 outline-none" onSubmit={handlerForm}>
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span className="text-2xl text-red-600">Añadir Campaña a {boxOffice}</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </div>
        <select 
          className="grid grid-cols-2 gap-4 my-2"
          onChange={( e ) => setSelectedCampaigns(e.target.value)}
        >
          {
            allCampaign.map(campaign =>(
              <option value={campaign.nombre}>{campaign.nombre}</option>
            ))
          }
        </select>

        <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Agregar</button>
      </form>
    </section>
  )
} 