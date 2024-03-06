import { BlueprintsItem, DashboardItem, DocumentationItem, Navbar, PricedItem, SoftwareItem, TemplatesItem } from "../../../ui"


export const NavbarAdmin = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <DashboardItem path="admin" />
        <TemplatesItem path="admin" />
        <BlueprintsItem path="admin"/>
        <PricedItem path="admin" />
        <SoftwareItem path="admin" />
        <DocumentationItem path="admin" />
      </ul>
    </Navbar>
  )
}