import axios from "axios";

export const insertRowsDB = async ( route: string, company: string, officeData:object ) =>{
  
  const res = await axios.post(`http://localhost:7000/api/add-${route}?company=${company}`, officeData,{
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data  = await res.data
  console.log(data)
  
  return data


}