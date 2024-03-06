import { BlueprintsItem, DocumentationItem, PricedItem, TemplatesItem, Navbar } from "../../../ui"

export const NavbarManager = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <TemplatesItem path="manager" />
        <BlueprintsItem path="manager"/>
        <PricedItem path="manager" />
        <DocumentationItem path="manager" />
      </ul>
    </Navbar>
  )
}