import axios from "axios";

export const deleteRowsDB = async ( route: string, company: string, name:string, campaign?:string ) =>{

  const sendData = {
    name: name,
    boxOffice: name,
    campaign
  }
  
  const res = await axios.post(`http://localhost:7000/api/delete-${route}?company=${company}`, sendData,{
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data  = await res
  console.log(data)
  
  return data


}