import { useEffect, useState } from "react"
import { getInfoDb } from "../helpers/getInfoDB"
import { BoxOfficeMetrix } from "../ui"



export const AdminDashboard = () =>{

  const [etnBoxOffice, setEtnBoxOffice] = useState([])
  const [ghoBoxOffice, setGhoBoxOffice] = useState([])
  const [costaBoxOffice, setCostaBoxOffice] = useState([])

  const getBoxOffice = async () =>{
    const dataETN =  await getInfoDb('taquillas', 'ETN')
    const dataGHO =  await getInfoDb('taquillas', 'GHO')
    const dataCosta =  await getInfoDb('taquillas', 'COSTA')
    setEtnBoxOffice(dataETN)
    setGhoBoxOffice(dataGHO)
    setCostaBoxOffice(dataCosta)

    //TODO Peticiones a gho y COsta

  }

  useEffect(() =>{

    getBoxOffice()

  }, [])
  return(
    <section className="w-full max-h-full flex pt-8 justify-center items-center">
      <section className="w-[95%] h-[95%] flex gap-4">
        <div className="w-full flex gap-4">
          <BoxOfficeMetrix boxOffice={etnBoxOffice} title="Taquillas ETN"/>
          <BoxOfficeMetrix boxOffice={ghoBoxOffice} title="Taquillas GHO"/>
          <BoxOfficeMetrix boxOffice={costaBoxOffice} title="Taquillas COSTA"/>
        </div>
        <div>
          
        </div>


      </section>
    </section>
  )
}