import { Navigate, Route, Routes } from "react-router-dom"
import { AdminRoutes } from "../users/admin/routes/AdminRoutes"
import { ManagerRoutes } from "../users/manager/routes/ManagerRutes"
import { DesignersRoutes } from "../users/designers/routes/DesignersRoutes"
import { LoginPage, HomePage } from "../pages"
import { PrivateRoutes } from "./PrivateRutes"
import { PublicRoutes } from "./PublicRoutes"

export const AppRouter = () =>{
  return(
    <Routes>
      <Route path="/login" element={
        <PublicRoutes>
          <LoginPage />
        </PublicRoutes>
      } />

      
      <Route path="/*" element={<Navigate to='err404' />} />
      <Route path="/" element={<HomePage />} />
      <Route path="admin/*" element={
        <PrivateRoutes>
          <AdminRoutes />
        </PrivateRoutes>
      } />
      <Route path="manager/*" element={
        <PrivateRoutes>
          <ManagerRoutes />
        </PrivateRoutes>
      } />
      <Route path="designers/*" element={
        <PrivateRoutes>
          <DesignersRoutes />
        </PrivateRoutes>
      } />
    </Routes>

  )
}