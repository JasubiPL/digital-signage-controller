import { useEffect, useState } from "react"
import { getInfoDb } from "../helpers/getInfoDB"


export const BoxOfficePage = () =>{

  const [allBoxOffice, setAllBoxOffice] = useState([ 'All'])
  const [selectOffice, setSelectOffice] = useState([ 'All'])
  const [currentBoxOffice, setCurrentBoxOffice] = useState("All")

  console.log(currentBoxOffice)

  const setQuery = async () =>{
    const selectQueryData =  await getInfoDb('taquillas', 'ETN')
    setSelectOffice(selectQueryData)

    if(currentBoxOffice === "All"){
      const queryData =  await getInfoDb('taquillas', 'ETN')
      
      //enviamos a la lista de seleccion las taquillas existentes
      setAllBoxOffice(queryData)

    }else{
      setAllBoxOffice(['TODO => Crear la query'])
    }


    //TODO - Aqui iria la query por taquilla

  }

  useEffect(() =>{

    setQuery()

  }, [currentBoxOffice])


  

  return(
    <section className="w-full  h-full flex flex-col items-center overflow-y-auto my-8">
      <select 
        className=" self-end mr-[5%] bg-red-600 text-white text-xl"
        onChange={(e) => setCurrentBoxOffice(e.target.value)}
      >
      <option key='All' value="All">Todas las taquillas</option>
      {
        selectOffice.map( option =>(
          <option key={option} value={option}>{option}</option>
        ))
      }
      </select>
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
            <div className="text-center grid grid-cols-5 border-b-[1px] border-gray-200 pb-1">
              <div className=" text-left pl-4">{ office }</div>
              <div></div>
              <div></div>
              <div></div>
              <div>

              </div>
            </div>
          ))
        }
      </section>
    </section>
  )
}