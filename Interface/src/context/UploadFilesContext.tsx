import { Dispatch, FC, ReactElement, SetStateAction, createContext, useState } from "react"

interface Props {
  children: ReactElement
}

export interface UploadContextType {
  form: boolean
  setForm: Dispatch<SetStateAction<boolean>>
}

export const UploadContext = createContext<UploadContextType>({
  form: false,
  setForm: () => {}
})

export const UploadFilesContex: FC<Props> = ({ children }) =>{

  const [form, setForm] = useState(false)
  return(
    <UploadContext.Provider value={{form, setForm}}>
      {children}
    </UploadContext.Provider>
  )
} 