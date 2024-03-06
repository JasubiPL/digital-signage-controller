import { NavLink } from "react-router-dom"
import { LiaSitemapSolid } from "react-icons/lia";
import { FC } from "react";

interface Props {
  path: string,
}

export const BlueprintsItem:FC<Props>  = ({ path  }) =>{

  return(
    <NavLink to={`/${path}/planos`} className={({ isActive }) => ` px-4 border-l-4 py-1 hover:border-gray-400 hover:bg-gray-200 ${ isActive ? 'text-red-600 border-red-600' : 'border-white' }`}>
      <li className="flex items-center gap-2 text-lg">
        <LiaSitemapSolid className="text-2xl"/>
        Planos
      </li>
    </NavLink>
  )
}