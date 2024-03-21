import { Navigate, Route, Routes } from "react-router-dom"
import { BlueprintsPage, BoxOfficePageCosta, BoxOfficePageETN, BoxOfficePageGHO, CampaignPageCosta, CampaignPageETN, CampaignPageGHO, DocumentationPage, PricePage, TemplatesPage } from "../../../pages"
import { NavbarManager } from "../components"
import { Header, Main } from "../../../ui"

export const ManagerRoutes = () =>{
  return(
    <div className="flex h-screen">
      <NavbarManager />

      <Main>
        <>
          <Header />
          <Routes>
            <Route path="/*" element={<Navigate to="plantillas" />} />
            <Route path="/plantillas" element={<TemplatesPage />} />
            <Route path="/planos" element={<BlueprintsPage />} />
            <Route path="/cotizaciones" element={<PricePage />} />
            <Route path="/documentacion" element={<DocumentationPage />} />
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