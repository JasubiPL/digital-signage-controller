import { FC } from "react";
import { AiFillFilePdf } from "react-icons/ai";
import { FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFile } from "react-icons/fa";
import { IoImagesSharp } from "react-icons/io5";

interface Props {
  extension: string
}

export const FileType: FC<Props> = ({ extension}) =>{
  if(extension === ".pdf"){
    return(
      <AiFillFilePdf className="text-4xl text-red-500"/>
    )
  }

  if(extension === ".doc" || extension === ".docx" || extension === ".odt"){
    return(
      <FaFileWord className="text-4xl text-blue-400"/>
    )
  }

  if(extension === ".xls" || extension === ".xlsx" || extension === ".csv" || extension === ".ods"){
    return(
      <FaFileExcel className="text-4xl text-green-500"/>
    )
  }

  if(extension === ".ppt" || extension === ".pptx" || extension === ".odp"){
    return(
      <FaFilePowerpoint  className="text-4xl text-orange-500"/>
    )
  }

  if(extension === ".png" || extension === ".jpg" || extension === ".jpeg" || extension === ".webp" || extension === ".avif"){
    return(
      <IoImagesSharp  className="text-4xl text-blue-600"/>
    )
  }

  if(extension === ".zip" || extension === ".7zip" || extension === ".rar"){
    return(
      <FaFileArchive  className="text-4xl text-yellow-500"/>
    )
  }

  return(
    <FaFile  className="text-4xl text-gray-500"/>
  )



}