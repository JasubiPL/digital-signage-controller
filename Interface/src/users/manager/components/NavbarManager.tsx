import { BlueprintsItem, PricedItem, TemplatesItem, Navbar, BoxOfficeItem, CampaignItem } from "../../../ui"

export const NavbarManager = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <BoxOfficeItem path="manager" />
        <CampaignItem path="manager" />
        <TemplatesItem path="manager" />
        <BlueprintsItem path="manager"/>
        <PricedItem path="manager" />
        {/* <DocumentationItem path="manager" /> */}
      </ul>
    </Navbar>
  )
}