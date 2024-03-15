import axios from "axios";

export const editRowsDB = async ( route: string, company: string, officeData:object ) =>{
  
  const res = await axios.put(`http://localhost:7000/api/edit-${route}?company=${company}`, officeData,{
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data  = await res.data
  console.log(data)
  
  return data


}