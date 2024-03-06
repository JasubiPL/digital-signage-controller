import { FC, ReactElement } from "react"

interface Props {
  children: ReactElement,
  type: string
}

export const Alerts:FC<Props> = ({ children, type }) =>{

  
  if(type === "success"){
    return(
      <span className="w-4/5 max-w-[650px] top-9 left-[30%] text-center absolute self-center  py-2 text-2xl 
      text-white z-40 bg-green-500 pop-in">
      { children}
      </span>
    )
  }

  if(type === "error"){
    return(
      <span className="w-4/5 max-w-[650px] top-9 left-[30%] text-center absolute self-center  py-2 text-2xl 
      text-white z-40 bg-red-500 pop-in">
      { children}
      </span>
    )
  }

}