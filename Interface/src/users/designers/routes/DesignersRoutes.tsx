import { Navigate, Route, Routes } from "react-router-dom"
import { BlueprintsPage, TemplatesPage } from "../../../pages"
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
          </Routes>
        </>
      </Main>
    </div>
  )
}