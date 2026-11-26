import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  Scissors,
  Tag,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import keycloak from '../keycloak';

const navigation = [
  { name: 'Clientes', to: '/', icon: Users, end: true },
  { name: 'Empleados', to: '/empleados', icon: Scissors },
  { name: 'Servicios', to: '/servicios', icon: Tag },
  { name: 'Calendario', to: '/calendarioGrid', icon: CalendarDays },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Extraemos datos del usuario autenticado desde el JWT de Keycloak
  const userName =
    keycloak.tokenParsed?.name ||
    keycloak.tokenParsed?.preferred_username ||
    'Usuario';
  const userEmail = keycloak.tokenParsed?.email || 'Sesión activa';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Título dinámico para la barra superior según la ruta actual
  const currentPage =
    navigation.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    )?.name || 'Panel';

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-zinc-200/80">
      {/* Cabecera de marca */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-zinc-900">
            AgendaPro
          </span>
          <span className="text-[11px] font-medium text-zinc-400">
            Gestión de citas
          </span>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Menú principal
        </p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs ring-1 ring-inset ring-indigo-600/15'
                    : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-zinc-400 group-hover:text-zinc-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pie del sidebar: Perfil + Logout elegante */}
      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-200/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {userName}
            </p>
            <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          </div>
          <button
            onClick={() => keycloak.logout()}
            title="Cerrar sesión"
            className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50/70">
      {/* Sidebar escritorio */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Drawer móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Columna de contenido */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Topbar minimalista */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              {currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sistema operativo
          </div>
        </header>

        {/* Lienzo principal */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}