import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          Mi SaaS ✂️
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Usamos Link en lugar de <a> para navegar sin recargar la página */}
          <Link to="/" className="block py-2.5 px-4 rounded hover:bg-slate-700 transition">
            👥 Clientes
          </Link>
          <Link to="/agenda" className="block py-2.5 px-4 rounded hover:bg-slate-700 transition">
            📅 Agenda
          </Link>
          <Link to="/empleados" className="block py-2.5 px-4 rounded hover:bg-slate-700 transition">
            💇‍♂️ Empleados
          </Link>
          <Link to="/servicios" className="block py-2.5 px-4 rounded hover:bg-slate-700 transition">
            🏷️ Servicios
          </Link>
          <Link to="/calendarioGrid" className="block py-2.5 px-4 rounded hover:bg-slate-700 transition">
            📅 Calendario
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition text-sm">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Aquí se pintará Clientes, Agenda, etc. según la URL */}
        <Outlet />
      </main>
    </div>
  );
}