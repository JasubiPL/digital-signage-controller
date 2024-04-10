import axios from "axios";

export const deleteFiles = async ( fileName:string ) =>{
 const res = await axios.delete(`http://localhost:7000/api/delete-file?fileName=${fileName}`)

 console.log(res)

 return res

}