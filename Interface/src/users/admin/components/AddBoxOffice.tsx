import { IoCloseSharp } from "react-icons/io5";

export const AddBoxOffice = () =>{


  return(
    <section className={`w-screen h-screen bg-black/50 absolute top-0 left-0 flex justify-center items-center`}>
      <form className=" w-1/4 bg-white grid py-6 px-6 outline-none">
        <div className="flex w-full justify-between items-center border-b-2 border-gray-100">
          <span>Datos del Archivo</span>
          <IoCloseSharp className=" cursor-pointer" onClick={() => window.location.reload()}/>
        </div>
        <label className="mt-6">Nombre de taquilla</label>
        <input 
          className="text-sm block w-full p-1 border-b-2 border-red-600 placeholder-red-400 text-whitefocus:border-blue-500" 
          type="text" 
          name="taquilla" 
        />
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="categories">Selecciona el Dispositivo</label>
        <select 
          onChange={() =>{}}
          className="outline-red-300 border-gray-200 border-2" name="categories">
          <option value="PANTALLAS">PANTALLAS</option>
          <option value="PANEL LED">PANEL LED</option>
          <option value="LED Y PANTALLAS">LED Y PANTALLAS</option>
        </select>
      </div>
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="categories">Medio de Proyección</label>
        <select 
          onChange={() =>{}}
          className="outline-red-300 border-gray-200 border-2" name="categories">
          <option value="PLAYER">PLAYER</option>
          <option value="USB">USB</option>
          <option value="STREAMING">STREAMING</option>
        </select>
      </div>
      <div className="w-full grid mt-3">
        <label className="text-sm text-red-600" htmlFor="categories">Estatus de taquilla</label>
        <select 
          onChange={() =>{}}
          className="outline-red-300 border-gray-200 border-2" name="categories">
          <option value="OK">OK</option>
          <option value="Remodelacion">Remodelación</option>
          <option value="Pantalla dañada">Pantalla Dañada</option>
        </select>
      </div>
      <button className="bg-red-600 py-1 px-2 text-white hover:bg-red-400 active:scale-95 transition-all mt-8">Subir</button>
      </form>
    </section>
  )
} 