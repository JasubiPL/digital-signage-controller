import { FormEvent, useState } from "react"
import { login } from "../auth/auth"
import { useNavigate } from "react-router-dom";

export const LoginPage = () =>{
  const [emailInput, setEmailInput] = useState("")
  const [errLogin, setErrLogin] = useState("")
  const navigate = useNavigate()

  const handlerLogin = (e: FormEvent) =>{
    e.preventDefault()

    const resp = login(emailInput)

    if(resp.status === 200){
      const user = resp.data

      localStorage.setItem("login", JSON.stringify(user) )

      return navigate(`/${user?.area}/dashboard`)
    }else{
      const { err } = resp
      setErrLogin(err ? err : "")
    }
  }

  return (
    <section className="w-full h-screen bg-gray-100 flex flx-col justify-center items-center">
      <form
        onSubmit={handlerLogin}
        className="w-full max-w-sm lg:max-w-md mx-auto bg-white flex flex-col shadow-xl p-8">
        <div className="w-full flex flex-col items-center mb-8">
          <img className="w-1/3 self-center" src="/img/grupo_iamsa_logo.jpg" alt="logo grupo iamsa" />
          <span className="text-2xl font-semibold text-red-600 ">Señalizacion Digital</span>
        </div>
        <label className="block mb-2 text-xl font-medium text-gray-900 ">Iniciar sesión</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <svg className="w-4 h-4 text-red-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
              <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
              <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
            </svg>
          </div>
          <input
            type="text" 
            id="email-address-icon" 
            className="bord text-sm block w-full ps-10 p-2.5 border-b-2
            border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
            placeholder="name@grupo-iamsa.com.mx" 
            onChange={(e) => setEmailInput(e.target.value) }
          />
        </div>
        <div className="mt-4 text-red-800">
          {errLogin}
        </div>
        <button 
          className=" py-2 px-4 bg-red-600 text-white max-w-24 self-end mt-8">
          Acceder
        </button>
      </form>

    </section>
  )
}