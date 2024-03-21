import { useEffect, useState } from "react"
import { FaRegEdit } from "react-icons/fa";
import { getInfoDb } from "../helpers/getInfoDB"
import { MdOutlineDeleteForever } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { useLocation } from "react-router-dom";
import { AddCampaign } from "../users/admin/components";
import { deleteRowsDB } from "../helpers/deleteRowsDB";
import { Alerts } from "../ui/components/Alerts";
import { CampaignsBoxOffice, EditCampaign } from "../ui";

interface Campaign {
  id: string,
  nombre: string,
  inicio: string,
  fin: string,
  status: string
}


export const CampaignPageGHO = () =>{

  const [allCampaign, setAllCampaign] = useState<Campaign[]>([])
  const [modal, setModal] = useState<React.ReactNode | null>(null);

  const currentPath = useLocation()

  const getCampaign = async () =>{
    const queryData =  await getInfoDb('campanias', 'GHO')
    //console.log(queryData)
    setAllCampaign(queryData)

  }

  const deleteCampaign = async (name: string) =>{
    const res = await deleteRowsDB("campania", "GHO", name)

    setModal(
      <Alerts type="success">
        <>
          {res.data}
        </>
      </Alerts>
    )

    getCampaign()
    setTimeout(() =>{
      setModal(null)
    },1000)
  }


  useEffect(() =>{

    getCampaign()

  }, [])


  

  return(
    <section className="w-full  h-full flex flex-col items-center overflow-y-auto my-8">
      { modal }
      <section className="w-[90%] flex justify-end mb-4">
        {
          currentPath.pathname.includes('admin') 
          ? <button 
          onClick={() => setModal(<AddCampaign modal={ setModal } reloadInfo={ getCampaign } company="GHO"/>)}
            className="py-1 px-4 bg-green-600 text-white hover:scale-105 active:scale-90 transition-all"
          >
            Nueva Campaña +
          </button> : null
        }
      </section>
      <section className="w-[90%] pt-4 bg-white mt-2 border-b-[1px] border-gray-200">
        <header className="text-center grid grid-cols-5 font-semibold border-b-[1px] border-gray-200 pb-1">
          <article>Campaña ▾</article>
          <article>Fecha de Inicio ▾</article>
          <article>Fecha de Finalización▾</article>
          <article>Estatus ▾</article>
          <article>Acciones</article>
        </header>
        {
          allCampaign.map( campaign =>(
            <div key={campaign.id} className="text-center grid grid-cols-5 border-b-[1px] border-gray-200 py-2">
              <div className=" text-left pl-4">{ campaign.nombre }</div>
              <div>{ campaign.inicio }</div>
              <div>{ campaign.fin }</div>
              <div><span className={campaign.status  != 'dañada' ?  campaign.status : 'dañada'}>{ campaign.status }</span></div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setModal(<CampaignsBoxOffice campaign={campaign.nombre} modal={setModal} company="GHO" />)} className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Taquillas'] 
                after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                  <GrFormView className="text-4xl text-blue-500"/>
                </button>
                <button onClick={() => setModal(<EditCampaign modal={setModal} reloadInfo={ getCampaign } data={campaign} company="GHO"/>)} className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Editar'] 
                after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                  <FaRegEdit className="text-2xl text-orange-400"/>
                </button>
                {
                  //comprovamos si estamos en la ruta del Administrador para mostrar el boton de borrado
                  currentPath.pathname.includes('admin') 
                  ? <button onClick={() => deleteCampaign(campaign.nombre)} className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Eliminar'] 
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