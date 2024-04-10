import { BlueprintsItem, PricedItem, TemplatesItem, Navbar, BoxOfficeItem, CampaignItem, DashboardItem } from "../../../ui"

export const NavbarManager = () =>{
  return(
    <Navbar >
      <ul className="flex flex-col gap-2 mt-8">
        <DashboardItem path="manager" />
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