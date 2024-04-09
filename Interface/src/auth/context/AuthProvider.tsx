import { FC, ReactElement, useReducer } from "react"
import { AuthContext } from "./AuthContext"
import { authReducer } from "./authReducer"
import { types } from "../types/types"

interface Props {
  children: ReactElement
}

const init = () =>{
  const user = localStorage.getItem("user") ? true : false

  return {
    logged:user,
    user
  }
}

export const AuthProvider:FC<Props> = ({ children }) =>{

  const [authState, dispatch] = useReducer( authReducer, {}, init )

  const login = ( name = "") =>{
    const user = { id: "ABC", name } //TODO: Cambiar esto por el Login con el backend

    const action = {
      type: types.login,
      payload: user
    }

    dispatch( action )

    localStorage.setItem("user", JSON.stringify( user ))
  }

  const logout = () =>{
    localStorage.removeItem("user")

    const action = {
      type: types.logout,
    }

    dispatch( action )
  }

  return (
    <AuthContext.Provider value={{...authState, login, logout }}>
    { children }
  </AuthContext.Provider>
  )
}