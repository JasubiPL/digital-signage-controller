import { Navigate, Route, Routes } from "react-router-dom"
import { BlueprintsPage, BoxOfficePageCosta, BoxOfficePageETN, BoxOfficePageGHO, CampaignPageCosta, CampaignPageETN, CampaignPageGHO, TemplatesPage } from "../../../pages"
import { NavbarDesigners } from "../components"
import { Header, Main } from "../../../ui"

export const DesignersRoutes = () =>{
  return(
    <div className="flex h-screen">
      <NavbarDesigners />

      <Main>
        <>
          <Header />
          <Routes>
            <Route path="/*" element={<Navigate to="plantillas" />} />
            <Route path="/plantillas" element={<TemplatesPage />} />
            <Route path="/planos" element={<BlueprintsPage />} />
            <Route path="/taquillas/ETN" element={<BoxOfficePageETN />} />
            <Route path="/taquillas/GHO" element={<BoxOfficePageGHO />} />
            <Route path="/taquillas/Costaline" element={<BoxOfficePageCosta />} />
            <Route path="/campanias/ETN" element={<CampaignPageETN />} />
            <Route path="/campanias/GHO" element={<CampaignPageGHO />} />
            <Route path="/campanias/Costaline" element={<CampaignPageCosta />} />
          </Routes>
        </>
      </Main>
    </div>
  )
}