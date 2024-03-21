import axios from "axios";

export const getInfoDb = async ( route: string, company: string ) =>{
  
  const res = await axios.get(`http://localhost:7000/api/get-${route}?company=${company}`)
  const data  = await res.data
  //console.log(data)
  
  return data


}