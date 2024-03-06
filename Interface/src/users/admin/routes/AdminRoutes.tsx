import { Navigate, Route, Routes } from "react-router-dom"
import { AdminDashboard, BlueprintsPage, DocumentationPage, PricePage, SoftwarePage, TemplatesPage } from "../../../pages"
import { NavbarAdmin, UploadFilesForm } from "../components"
import { Header, Main } from "../../../ui"
import { useContext } from "react"
import { UploadContext, UploadContextType } from "../../../context/UploadFilesContext"


export const AdminRoutes = () =>{

  const { form }= useContext<UploadContextType>(UploadContext)
  //console.log(form)

  return(
    <div className="flex h-screen">
      <NavbarAdmin />

      <Main >
        <>
          <Header />
          { form ? <UploadFilesForm /> : ""}
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/plantillas" element={<TemplatesPage />} />
            <Route path="/planos" element={<BlueprintsPage />} />
            <Route path="/cotizaciones" element={<PricePage />} />
            <Route path="/software" element={<SoftwarePage />} />
            <Route path="/documentacion" element={<DocumentationPage />} />
          </Routes>
        </>
      </Main>
    </div>
  )
}