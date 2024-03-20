import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { boxOfficeCampaigns } from "../../helpers/boxOfficeCampaigns"
import { useLocation } from "react-router-dom"
import { MdOutlineDeleteForever } from "react-icons/md"
import { FaRegEdit } from "react-icons/fa"
import { getInfoDb } from "../../helpers/getInfoDB"

interface Props {
  boxOffice: string,
  modal: Dispatch<SetStateAction<ReactNode>>,
}

interface QueryCampaigns {
  id: string,
  campania: string,
  inicio: string,
  fin: string,
  status: string
}

interface Campaign {
  id: string,
  nombre: string,
  inicio: string,
  fin: string,
  status: string
}

export const BoxOfficeCampaigns:FC<Props> = ({ boxOffice, modal }) =>{

  const [campaigns, setCampaigns] = useState<QueryCampaigns[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState("Aviso de Privaciad")
  const [allCampaign, setAllCampaign] = useState<Campaign[]>([])
  const currentPath = useLocation()

  const getCampaigns = async () =>{
    const queryData = await boxOfficeCampaigns("campanias-en-taquilla", "ETN", boxOffice)
    setCampaigns(queryData)
  }

  const getAllCampaigns = async () =>{
    const queryData =  await getInfoDb('campanias', "ETN")
    console.log(queryData)
    setAllCampaign(queryData)

  }


  console.log(selectedCampaigns)

  useEffect(() =>{
    getCampaigns()
    getAllCampaigns()
  }, [])

  return (
    <section className="w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center">
      <section className="w-4/5 bg-white grid py-6 px-6">
        <header className="mb-8 flex justify-between">
          <h2 className="text-2xl text-red-600">Campañas Activas en {boxOffice}</h2>
          <IoCloseSharp className=" cursor-pointer" onClick={() => modal(null)}/>
        </header>
        <div className="flex justify-end gap-2 mb-8">
          <select 
            className="grid grid-cols-2 gap-4 border-2 py-1"
            onChange={( e ) => setSelectedCampaigns(e.target.value)}
          >
            {
              allCampaign.map(campaign =>(
                <option value={campaign.nombre}>{campaign.nombre}</option>
              ))
            }
          </select>
          {
            currentPath.pathname.includes('admin') 
            ? <button 
            onClick={() => {}}
              className="px-4 bg-green-600 text-white hover:scale-105 active:scale-90 transition-all"
            >
              Asignar Campaña +
            </button> : null
          }
        </div>
        <div className="text-center grid grid-cols-5 font-semibold border-b-[1px] border-gray-200 pb-1">          
          <article>Campaña ▾</article>
          <article>Fecha de inicio ▾</article>
          <article>Fecha de Fin ▾</article>
          <article>Estatus ▾</article>
          <article>Acciones </article>
        </div>
          {
          campaigns.map( campaign =>(
            <div key={campaign.id} className="text-center grid grid-cols-5 border-b-[1px] border-gray-200 py-2">
              <div className=" text-left pl-4">{ campaign.campania }</div>
              <div>{ campaign.inicio }</div>
              <div>{ campaign.fin }</div>
              <div><span className={campaign.status}>{ campaign.status }</span></div>
              <div className="flex gap-4 justify-center">

                {
                  //comprovamos si estamos en la ruta del Administrador para mostrar el boton de borrado
                  currentPath.pathname.includes('admin') 
                  ? <button onClick={() => {}} className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Editar'] 
                  after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                    <FaRegEdit className="text-2xl text-orange-400"/>
                  </button>
                  : ""
                }
                {
                  //comprovamos si estamos en la ruta del Administrador para mostrar el boton de borrado
                  currentPath.pathname.includes('admin') 
                  ? <button onClick={() => {}} className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Eliminar'] 
                  after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                      <MdOutlineDeleteForever className="text-3xl text-red-600" />
                    </button>
                  : ""
                }
              </div>
            </div>
          ))
        }
      </section>
    </section>
  )
}