import { BlueprintsItem, Navbar, TemplatesItem } from "../../../ui"


export const NavbarDesigners = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <TemplatesItem path="designers" />
        <BlueprintsItem path="designers"/>
      </ul>
    </Navbar>
  )
}