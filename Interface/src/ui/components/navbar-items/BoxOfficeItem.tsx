import { NavLink } from "react-router-dom"
import { LuStore } from "react-icons/lu";
import { IoIosArrowForward } from "react-icons/io";
import { FC, useState } from "react";

interface Props {
  path: string,
}

export const BoxOfficeItem:FC<Props>  = ({ path  }) =>{
  const [showBrand, setShowBrand] = useState({
    isActive: false,
    style: "h-0 overflow-hidden",
    arrow: ""
  })

  const handlerSubmenu = () =>{
    if(showBrand.isActive){
      setShowBrand({
        isActive: false,
        style: "h-0 overflow-hidden",
        arrow: ""
      })
    }else{
      setShowBrand({
        isActive: true,
        style: "",
        arrow: "rotate-90"
      })
    }
  }


  return(
    <div>
      <div 
      onClick={handlerSubmenu}
      className="flex gap-2 items-center justify-between pl-5 cursor-pointer">
        <span className="flex gap-2 items-center text-lg">
          <LuStore className="text-2xl"/>
          Taquillas
        </span>
        <IoIosArrowForward className={`mr-2 transition-all ${showBrand.arrow}`}/>
      </div>
      <ul className={`grid ${showBrand.style} transition-all`}>
        <NavLink to={`/${ path }/taquillas/ETN`} className={({ isActive }) => `pl-6 border-l-4 py-1 hover:border-gray-400 hover:bg-gray-200 ${ isActive ? 'text-red-600 border-red-600' : 'border-white' }`}>ETN</NavLink>
        <NavLink to={`/${ path }/taquillas/GHO`} className={({ isActive }) => `pl-6 border-l-4 py-1 hover:border-gray-400 hover:bg-gray-200 ${ isActive ? 'text-red-600 border-red-600' : 'border-white' }`}>GHO</NavLink>
        <NavLink to={`/${ path }/taquillas/Costaline`} className={({ isActive }) => ` px-6 border-l-4 py-1 hover:border-gray-400 hover:bg-gray-200 ${ isActive ? 'text-red-600 border-red-600' : 'border-white' }`}>Costaline</NavLink>
      </ul>
    </div>
  )
}