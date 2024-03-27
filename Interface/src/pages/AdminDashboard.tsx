import { useEffect, useState } from "react"
import { getInfoDb } from "../helpers/getInfoDB"
import { BoxOfficeMetrix } from "../ui"
import { getAllUsers, userDelete } from "../helpers/getAllUsers"
import { useLocation } from "react-router-dom"
import { MdOutlineDeleteForever } from "react-icons/md"

interface User {

  id: number
  nombre: string
  area: string
  email: string
  image: string
  
}


export const AdminDashboard = () =>{

  const [etnBoxOffice, setEtnBoxOffice] = useState([])
  const [ghoBoxOffice, setGhoBoxOffice] = useState([])
  const [costaBoxOffice, setCostaBoxOffice] = useState([])
  const [users, setUsers] = useState<User[]>([])
  const currentPath = useLocation()

  const getBoxOffice = async () =>{
    const dataETN =  await getInfoDb('taquillas', 'ETN')
    const dataGHO =  await getInfoDb('taquillas', 'GHO')
    const dataCosta =  await getInfoDb('taquillas', 'COSTA')
    setEtnBoxOffice(dataETN)
    setGhoBoxOffice(dataGHO)
    setCostaBoxOffice(dataCosta)
  }

  const getUsers = async () =>{
    const allUsers = await getAllUsers()

    setUsers(allUsers.users)
  }

  const deleteUser = async (email: string) =>{
    const res = await userDelete(email)

    if(res.status === 200){
      getUsers()
    }

  }

  useEffect(() =>{

    getBoxOffice()
    getUsers()
  }, [])
  return(
    <section className="w-full h-full flex pt-8 justify-center items-center overflow-y-auto">
      <section className="w-[95%] h-[95%] flex gap-4">
        <section className="grid gap-8 w-3/4">
          <div className="w-full flex gap-4">
            <BoxOfficeMetrix boxOffice={etnBoxOffice} title="Taquillas ETN"/>
            <BoxOfficeMetrix boxOffice={ghoBoxOffice} title="Taquillas GHO"/>
            <BoxOfficeMetrix boxOffice={costaBoxOffice} title="Taquillas COSTA"/>
          </div>
          <div className="flex flex-col bg-white w-1/2 h-3/5">
            <header className="text-2xl text-red-600 p-4">Usuarios</header>
            <div className="h-full overflow-y-auto pb-4">
              {
                users.map(user => (
                  
                  <div key={user.id} className="flex gap-4 items-center px-4">
                    <img src={user.image} alt={user.nombre} className=" w-8 h-8 rounded-full flex"/>
                    <div className="w-full">
                      <p>{user.nombre}</p>
                      <small className="text-red-700">{user.email}</small>
                    </div>
                    <div className="">{user.area}</div>
                    <div className="flex items-center">
                    {
                      //comprovamos si estamos en la ruta del Administrador para mostrar el boton de borrado
                      currentPath.pathname.includes('admin') 
                      ? <button onClick={() => deleteUser(user.email)} className="hover:scale-110 active:scale-90 transition-all">
                          <MdOutlineDeleteForever className="text-2xl text-red-600" />
                        </button>
                      : ""
                    }
                    </div>
                  </div>
                
                ))
              }
            </div>
          </div>
        </section>


      </section>
    </section>
  )
}