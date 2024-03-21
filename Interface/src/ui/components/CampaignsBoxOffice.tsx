import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { boxOfficeCampaigns } from "../../helpers/boxOfficeCampaigns"
import { useLocation } from "react-router-dom"
import { MdOutlineDeleteForever } from "react-icons/md"
import { FaRegEdit } from "react-icons/fa"
import { getInfoDb } from "../../helpers/getInfoDB"
import { insertRowsDB } from "../../helpers/insertRowsDB"
import { deleteRowsDB } from "../../helpers/deleteRowsDB"
import { UpdateBoxOfficeCampaign } from "."

interface Props {
  campaign: string,
  modal: Dispatch<SetStateAction<ReactNode>>,
  company: string
}

interface QueryCampaigns {
  campaña: string,
  taquilla: string,
  status: string
}


export const CampaignsBoxOffice:FC<Props> = ({ campaign, modal, company }) =>{

  const [boxOffice, setBoxOffice] = useState<QueryCampaigns[]>([])
  //console.log(boxOffice)

  const getCampaigns = async () =>{
    const queryData = await boxOfficeCampaigns("taquillas-en-campania", company, campaign)
    setBoxOffice(queryData)
    //console.log(queryData)
  }

  useEffect(() =>{
    getCampaigns()
  }, [])

  return (
    <section className="w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center">
      <section className="w-3/5 bg-white grid py-6 px-12">
        <header className="mb-8 flex justify-between">
          <h2 className="text-2xl text-red-600">Taquillas con campaña {campaign}</h2>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </header>
        <div className="text-center grid grid-cols-2 font-semibold border-b-[1px] border-gray-200 pb-1">          
          <article>Taquilla ▾</article>
          <article>Estatus ▾</article>
        </div>
        <div className=" overflow-y-scroll max-h-[50vh]" >
          {
            boxOffice.map( office =>(
              <div key={office.taquilla} className="text-center grid grid-cols-2 border-b-[1px] border-gray-200 py-2">
                <div className=" text-left pl-4">{ office.taquilla }</div>
                <div><span className={office.status}>{ office.status }</span></div>
              </div>
            ))
          }
        </div>
      </section>
    </section>
  )
}