// 1. IMPORTANTE: Esta línea es la que seguramente te falta
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // <--- Importamos el Layout
import Clientes from "./pages/Clientes";
import Empleados from './pages/Empleados';
import Servicios from './pages/Servicios';
import Agenda from './pages/Agenda';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
       {/* Ruta Padre que contiene el Layout */}
        <Route path="/" element={<Layout />}>
          
          {/* Rutas Hijas (se renderizan dentro del Outlet del Layout) */}
          <Route index element={<Clientes />} /> {/* index significa: ruta por defecto "/" */}
          <Route path="agenda" element={<Agenda />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="servicios" element={<Servicios />} />

          {/* 404 dentro del layout */}
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
