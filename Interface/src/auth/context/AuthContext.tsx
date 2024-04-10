import { createContext } from "react";




export const AuthContext = createContext<any>({
  login: () => {},
  logout: () => {},
  authState: {}
})