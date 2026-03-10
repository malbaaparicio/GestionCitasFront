import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ModalCliente from '../components/ModalCliente';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);

     
    // --- ESTADOS DE CONTROL ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [clienteEditar, setClienteEditar] = useState(null); // Para saber qué cliente editamos
    const [refreshKey, setRefreshKey] = useState(0);    // Contador para forzar recarga

    // useEffect se ejecuta al cargar la página (como el OnInitialized)
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await api.get('/clientes');
                setClientes(response.data);
            } catch (error) {
                console.error("Error cargando clientes:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchClientes();
    }, [refreshKey]);

     // --- MANEJADORES DEL MODAL ---
    const abrirModalCrear = () => {
        setClienteEditar(null); // Limpiamos para que sea un cliente nuevo
        setModalAbierto(true);
    };

    const abrirModalEditar = (cliente) => {
        setClienteEditar(cliente); // Pasamos los datos del cliente clicado
        setModalAbierto(true);
    };

    if (cargando) return <div className="p-4">Cargando datos...</div>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Clientes</h1>

            {/* BOTÓN NUEVO CLIENTE */}
                <button 
                    onClick={abrirModalCrear} // Usamos la función nueva
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                >
                    <span>+</span> Nuevo Cliente
                </button>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Teléfono
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((cliente) => (
                            <tr key={cliente.clienteid} 
                                onClick={() => abrirModalEditar(cliente)}                                                                
                                className="cursor-pointer hover:bg-gray-50"                                                          
                                
                            >
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {cliente.nombre} {cliente.apellidos}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{cliente.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{cliente.telefono}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {/* MODAL CONFIGURADO CORRECTAMENTE */}
                        <ModalCliente 
                            isOpen={modalAbierto} 
                            onClose={() => setModalAbierto(false)} 
                            // Al guardar, sumamos 1 al refreshKey, lo que dispara el useEffect de arriba
                            onGuardado={() => setRefreshKey(prev => prev + 1)}
                            clienteAEditar={clienteEditar} // Pasamos el cliente a editar (o null si es nuevo)
                            />
        </div>
    );
}