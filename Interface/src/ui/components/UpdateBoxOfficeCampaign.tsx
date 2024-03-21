import { ChangeEvent, Dispatch, FC, FormEvent, ReactNode, SetStateAction, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { editRowsDB } from "../../helpers/editRowsDB";
import { BoxOfficeCampaigns } from ".";

interface Props {
  modal:  Dispatch<SetStateAction<ReactNode>>,
  company: string,
  boxOffice : string,
  campaign: string,
  status: string
}

export const UpdateBoxOfficeCampaign:FC<Props> = ({ modal, company, boxOffice, campaign, status }) =>{

  const [campaignData, setCampaignData] = useState({
    campaign,
    boxOffice,
    status : status
  })

  //console.log(CampaignData)

  const handlerCampaign = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setCampaignData({
      ...campaignData,
      [e.target.name]: e.target.value
    })
  }

  const updateCampaign = async (e:FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    const res = await editRowsDB("campanias-en-taquilla", company, campaignData)

    if(res.status === 200){
      modal(<BoxOfficeCampaigns boxOffice={boxOffice} modal={modal} company={company}/>)
    }

  }

  return(
    <section className={`w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center`}>
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none" onSubmit={updateCampaign}>
        <div className="w-full grid items-center border-b-2 border-gray-100">
          <div className="flex justify-end"><IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/></div>
          <span>Taquilla: <span className="text-red-600">{ boxOffice }</span></span>
          <span>Campaña: <span className="text-red-600"> { campaign }</span></span>
        </div>
        <div className="w-full grid mt-3">
          <select 
            onChange={handlerCampaign}
            className="outline-red-300 border-gray-200 border-2" name="status"
            value={campaignData.status}
          >
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