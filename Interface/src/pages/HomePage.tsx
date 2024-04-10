import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const HomePage = () =>{
  const redirect = useNavigate()

  useEffect(() =>{
    const logged = localStorage.getItem("user")
    
    if(!logged){
      return redirect("/login")
    }

    const userData = JSON.parse(logged ? logged : "")
    
    return redirect(`/${userData?.area}/`)
    
  })

  return(
    <h1>Loding...</h1>
  )
}