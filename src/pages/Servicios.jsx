import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ModalServicios from '../components/ModalSevicios';

function Servicios () {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

   // --- ESTADOS DE CONTROL ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [servicioEditar, setServicioEditar] = useState(null); // Para saber qué servicio editamos
    const [refreshKey, setRefreshKey] = useState(0);    // Contador para forzar recarga

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await api.get('/servicios');
        setServicios(response.data);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchServicios();
  }, [refreshKey]);

   // --- MANEJADORES DEL MODAL ---
    const abrirModalCrear = () => {
        setServicioEditar(null); // Limpiamos para que sea un servicio nuevo
        setModalAbierto(true);
    };

    const abrirModalEditar = (servicio) => {
        setServicioEditar(servicio); // Pasamos los datos del servicio clicado
        setModalAbierto(true);
    };

  if (cargando) return <div className="p-4">Cargando datos...</div>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Servicios</h1>

       {/* BOTÓN NUEVO SERVICIO */}
        <button 
            onClick={abrirModalCrear} // Usamos la función nueva
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
        >
            <span>+</span> Nuevo Servicio
        </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.servicioid} 
              onClick={() => abrirModalEditar(servicio)}   
                                className="cursor-pointer hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {servicio.nombre}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{servicio.duracion + ' min'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(servicio.precio_actual)}</p>
                </td>
                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {servicio.estado}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* MODAL CONFIGURADO CORRECTAMENTE */}
      <ModalServicios 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          // Al guardar, sumamos 1 al refreshKey, lo que dispara el useEffect de arriba
          onGuardado={() => setRefreshKey(prev => prev + 1)}
          servicioAEditar={servicioEditar} // Pasamos el servicio a editar (o null si es nuevo)
          />
    </div>
  );
}

export default Servicios;
