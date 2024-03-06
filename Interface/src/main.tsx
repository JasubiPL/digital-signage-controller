import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { UploadFilesContex } from './context/UploadFilesContext.tsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <UploadFilesContex >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UploadFilesContex>
)
