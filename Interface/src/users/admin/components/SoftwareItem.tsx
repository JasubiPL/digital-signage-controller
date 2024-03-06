import { FC } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";

interface Props {
  img: string,
  label: string
  pathDownload: string
}

export const SoftwareItem:FC<Props> = ({ img, label, pathDownload }) =>{
  return (
    <article className=" aspect-square bg-white p-2 flex items-center shadow-lg hover:scale-110 transition-all relative cursor-pointer">
      <IoCloudDownloadOutline className="absolute top-3 right-3 text-4xl text-green-500"/>
      <a href={pathDownload} className="flex flex-col items-center justify-center gap-2">
        <img className="w-4/5 aspect-square object-contain" src={img} alt={label} />
        <span className="text-red-500 font-semibold text-md">{label}</span>
      </a>
    </article>
  )
}