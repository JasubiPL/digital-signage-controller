import { FC } from "react"
import { AiOutlineUsb } from "react-icons/ai"
import { BsDeviceSsd } from "react-icons/bs"

interface BoxOffice {
  id: string,
  nombre: string,
  dispositivo: string,
  proyeccion: string,
  estatus: string
}


interface Props {
  boxOffice: BoxOffice[],
  title: string
}


export const BoxOfficeMetrix: FC<Props> = ({boxOffice, title }) =>{
  return(
    <div className="w-1/3 bg-white py-4 px-8">
      <p className="text-xl text-red-600">{title}</p>
      <div className="flex justify-between mt-2 items-center">
        <p className="text-6xl font-semibold">{boxOffice.length}</p>
        <div>
          <p className="flex gap-2 justify-between text-md"> Player: { boxOffice.filter(office => office.proyeccion === "PLAYER").length } <span className="text-red-600"> <BsDeviceSsd /> </span></p>
          <p className="flex gap-2 justify-between text-md">USB: { boxOffice.filter(office => office.proyeccion === "USB").length } <span className="text-red-600"><AiOutlineUsb /></span></p>
        </div>
      </div>
    </div>
  )
}