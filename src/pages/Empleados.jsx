import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ModalEmpleados from '../components/ModalEmpleados';

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);

     // --- ESTADOS DE CONTROL ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [empleadoEditar, setEmpleadoEditar] = useState(null); // Para saber qué empleado editamos
    const [refreshKey, setRefreshKey] = useState(0);    // Contador para forzar recarga
    
    // useEffect se ejecuta al cargar la página (como el OnInitialized)
    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await api.get('/empleados');
                setEmpleados(response.data);
            } catch (error) {
                console.error("Error cargando empleados:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchEmpleados();
    }, [refreshKey]);

     // --- MANEJADORES DEL MODAL ---
    const abrirModalCrear = () => {
        setEmpleadoEditar(null); // Limpiamos para que sea un empleado nuevo
        setModalAbierto(true);
    };

    const abrirModalEditar = (empleado) => {
        setEmpleadoEditar(empleado); // Pasamos los datos del empleado clicado
        setModalAbierto(true);
    };

    if (cargando) return <div className="p-4">Cargando datos...</div>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Empleados</h1>

             {/* BOTÓN NUEVO EMPLEADO */}
                <button 
                    onClick={abrirModalCrear} // Usamos la función nueva
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                >
                    <span>+</span> Nuevo Empleado
                </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nombre
                            </th>
                             <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Teléfono
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Color Agenda
                            </th>                            
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map((empleado) => (
                            <tr key={empleado.empleadoid} 
                                onClick={() => abrirModalEditar(empleado)}   
                                className="cursor-pointer hover:bg-gray-50">

                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {empleado.nombre} {empleado.apellidos}
                                    </p>
                                </td>
                                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {empleado.telefono}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{empleado.color_agenda}</p>
                                </td>                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* MODAL CONFIGURADO CORRECTAMENTE */}
                                    <ModalEmpleados 
                                        isOpen={modalAbierto} 
                                        onClose={() => setModalAbierto(false)} 
                                        // Al guardar, sumamos 1 al refreshKey, lo que dispara el useEffect de arriba
                                        onGuardado={() => setRefreshKey(prev => prev + 1)}
                                        empleadoAEditar={empleadoEditar} // Pasamos el empleado a editar (o null si es nuevo)
                                        />
        </div>
    );
}