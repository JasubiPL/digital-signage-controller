import { FC, ReactElement, useReducer } from "react"
import { AuthContext } from "./AuthContext"
import { authReducer } from "./authReducer"
import { types } from "../types/types"
import { authUser } from "../../helpers/getAllUsers"

interface Props {
  children: ReactElement
}

const init = () =>{
  const user = localStorage.getItem("user")

  return {
    logged:user ? true : false,
    user: user ? JSON.parse( user ) : null
  }
}

export const AuthProvider:FC<Props> = ({ children }) =>{

  const [authState, dispatch] = useReducer( authReducer, {}, init )

  const login = async ( email = "") =>{
    const resp = await authUser(email)

    if(resp.status != 200){
      return resp
    }

    const action = {
      type: types.login,
      payload: resp.users
    }

    dispatch( action )

    localStorage.setItem("user", JSON.stringify( resp.users ))
    return resp
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