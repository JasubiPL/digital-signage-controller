import { useEffect, useState } from "react"
import { getInfoDb } from "../helpers/getInfoDB"
import { AiOutlineUsb } from "react-icons/ai"
import { BsDeviceSsd } from "react-icons/bs"

interface BoxOffice {
  id: string,
  nombre: string,
  dispositivo: string,
  proyeccion: string,
  estatus: string
}

export const AdminDashboard = () =>{

  const [etnBoxOffice, setEtnBoxOffice] = useState<BoxOffice[]>([])
  const [ghoBoxOffice, setGhoBoxOffice] = useState<BoxOffice[]>([])
  const [costaBoxOffice, setCostaBoxOffice] = useState<BoxOffice[]>([])

  console.log(etnBoxOffice.filter(office => office.proyeccion === "PLAYER"))

  const getBoxOffice = async () =>{
    const dataETN =  await getInfoDb('taquillas', 'ETN')
    setEtnBoxOffice(dataETN)

    //TODO Peticiones a gho y COsta

  }

  useEffect(() =>{

    getBoxOffice()

  }, [])
  return(
    <section className="w-full h-full flex justify-center items-center">
      <section className="w-[95%] h-[95%]">
        <div className="w-1/5 bg-white py-4 px-8">
          <p className="text-xl text-red-600">Taquillas ETN</p>
          <div className="flex justify-between mt-2 items-center">
            <p className="text-6xl font-semibold">{etnBoxOffice.length}</p>
            <div>
              <p className="flex gap-2 justify-between text-md"> Player: { etnBoxOffice.filter(office => office.proyeccion === "PLAYER").length } <span className="text-red-600"> <BsDeviceSsd /> </span></p>
              <p className="flex gap-2 justify-between text-md">USB: { etnBoxOffice.filter(office => office.proyeccion === "USB").length } <span className="text-red-600"><AiOutlineUsb /></span></p>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}