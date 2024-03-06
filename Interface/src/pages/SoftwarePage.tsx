import { SoftwareItem } from "../users/admin/components"

export const SoftwarePage= () =>{
  return(
    <section className="w-full  h-full flex flex-col items-center">
      <section className="w-[90%] my-8 p-8 grid grid-cols-5 gap-5">
        <SoftwareItem pathDownload="http://172.30.106.126:7000/software/BrightAutor.4.7.2.18.exe" img="/img/software/brigthAuthor.webp" label="Bright Author 4.7.2.18"/>
        <SoftwareItem pathDownload="http://172.30.106.126:7000/software/NovaLCT-V5.3.1.exe" img="/img/software/NovaStar.png" label="Nova LCT V5.3.1"/>
      </section>
    </section>
  )
}