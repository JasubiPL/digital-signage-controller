import { useEffect, useState } from "react"
import { FaRegEdit } from "react-icons/fa";
import { getInfoDb } from "../helpers/getInfoDB"
import { MdOutlineDeleteForever } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { useLocation } from "react-router-dom";
import { AddBoxOffice } from "../users/admin/components";

interface Office {
  nombre: string;
  // otros campos necesarios
}

interface BoxOffice {
  nombre: string,
  dispositivo: string,
  proyeccion: string,
  estatus: string
  // otras propiedades si las hay
}


export const BoxOfficePage = () =>{

  const [allBoxOffice, setAllBoxOffice] = useState<BoxOffice[]>([])
  const [modal, setModal] = useState<JSX.Element | null>(null);

  const currentPath = useLocation()

  //console.log(currentBoxOffice)

  const setQuery = async () =>{

    const queryData =  await getInfoDb('taquillas', 'ETN')
    
    //enviamos a la lista de seleccion las taquillas existentes
    setAllBoxOffice(queryData)



    //TODO - Aqui iria la query por taquilla

  }

  useEffect(() =>{

    setQuery()

  }, [])


  

  return(
    <section className="w-full  h-full flex flex-col items-center overflow-y-auto my-8">
      { modal }
      <section className="w-[90%] flex justify-between mb-4">
        <button 
        onClick={() => setModal(<AddBoxOffice />)}
          className="py-1 px-8 bg-red-600 text-white text-xl hover:scale-105 active:scale-90 transition-all"
        >
          Agregar Taquilla +
        </button>
      </section>
      <section className="w-[90%] pt-4 bg-white mt-2 border-b-[1px] border-gray-200">
        <header className="text-center grid grid-cols-5 font-semibold border-b-[1px] border-gray-200 pb-1">
          <article>Taquilla ▾</article>
          <article>Dispositivo ▾</article>
          <article>Proyeccion por▾</article>
          <article>Estatus ▾</article>
          <article>Acciones</article>
        </header>
        {
          allBoxOffice.map( office =>(
            <div key={office.nombre} className="text-center grid grid-cols-5 border-b-[1px] border-gray-200 py-2">
              <div className=" text-left pl-4">{ office.nombre }</div>
              <div>{ office.dispositivo }</div>
              <div>{ office.proyeccion }</div>
              <div><span className={office.estatus  != 'dañada' ?  office.estatus : 'dañada'}>{ office.estatus }</span></div>
              <div className="flex gap-4 justify-center">
                <button className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Ver'] 
                after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                  <GrFormView className="text-4xl text-blue-500"/>
                </button>
                <button className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Editar'] 
                after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                  <FaRegEdit className="text-2xl text-orange-400"/>
                </button>
                {
                  //comprovamos si estamos en la ruta del Administrador para mostrar el boton de borrado
                  currentPath.pathname.includes('admin') 
                  ? <button className="hover:scale-110 active:scale-90 transition-all hover:after:content-['Eliminar'] 
                  after:absolute after:bg-gray-900 after:px-2 after:text-white after:top-[-20px] after:left-0">
                      <MdOutlineDeleteForever className="text-3xl text-red-600"/>
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