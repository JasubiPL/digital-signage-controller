import { Navigate, Route, Routes } from "react-router-dom"
import { BlueprintsPage, DocumentationPage, PricePage, TemplatesPage } from "../../../pages"
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
          </Routes>
        </>
      </Main>
    </div>
  )
}