import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const HomePage = () =>{
  const redirect = useNavigate()

  useEffect(() =>{
    const loged = localStorage.getItem("login")
    
    if(!loged){
      return redirect("/login")
    }

    const userData = JSON.parse(loged ? loged : "")
    
    return redirect(`/${userData?.area}/dashboard`)
    
  })

  return(
    <h1>Loding...</h1>
  )
}