import { FC, ReactElement } from "react"

interface Props {
  children: ReactElement
}

export const Main: FC<Props> = ({ children }) =>{
  return(
    <section className="flex flex-col w-full h-full bg-gray-100">
      { children }
    </section>
  )
}