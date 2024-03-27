import axios from "axios";

export const getAllUsers = async () =>{

  const res = await axios.get("http://localhost:7000/api/users/get-all")
  const users = await res.data
  //console.log(users)

  return users
}

export const userDelete = async (email: string) =>{
  console.log(email)

  const res = await axios.post("http://localhost:7000/api/users/delete-usuario", { email: email }, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  const users = await res.data
  console.log(users)

  return users
}

