import { ReactElement } from "react"

export interface Action {
  type:string,
  payload?: Object
}

export interface AuthProvider {
  children: ReactElement
}
