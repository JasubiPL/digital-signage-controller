import axios from "axios";

export const boxOfficeCampaigns = async ( route: string, company: string, officeData:string ) =>{
  console.log(officeData)
  
  const res = await axios.post(`http://localhost:7000/api/query-${route}?company=${company}`,
  { name: officeData},
  {
    headers: {
      "Content-Type": "application/json",
    },
  })
  const campaigns  = await res.data
  
  return campaigns.data


}