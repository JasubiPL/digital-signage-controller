import axios from "axios"

export const getFiles = async (category: string, company:string) =>{
  
    const res = await axios.get(`http://localhost:7000/api/search-${category}?company=${company}`)
    const data  = await res.data
    
    console.log(data)
  
  
  return data
}