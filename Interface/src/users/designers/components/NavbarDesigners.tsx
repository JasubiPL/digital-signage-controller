import { BlueprintsItem, BoxOfficeItem, CampaignItem, Navbar, TemplatesItem } from "../../../ui"


export const NavbarDesigners = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <BoxOfficeItem path="designers" />
        <CampaignItem path="designers" />
        <TemplatesItem path="designers" />
        <BlueprintsItem path="designers"/>
      </ul>
    </Navbar>
  )
}