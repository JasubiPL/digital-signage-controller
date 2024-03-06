import dataUsers from "../mock/users.json"

export const login = ( email: string ) =>{
  
  const currentUser = dataUsers.users.find(user => user.email === email)

  if(currentUser === undefined){
    
    return {
      status:404,
      err: "Usuario no encontrado"
    }
  }else{
    return {
      status: 200,
      data:currentUser
    }
  }

}