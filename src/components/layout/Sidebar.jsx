import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, Zap, FolderOpen, LayoutDashboard, CheckSquare, Lightbulb } from "lucide-react";

const navItems = [
  { path: "/", label: "Accueil", icon: Home },
  { path: "/roadmap", label: "Roadmap", icon: Map },
  { path: "/active-step", label: "Étape", icon: Zap },
  { path: "/project", label: "Projet", icon: FolderOpen },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tasks", label: "Tâches", icon: CheckSquare },
  { path: "/recommendations", label: "Recommandations", icon: Lightbulb },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 lg:w-56 bg-sidebar flex flex-col z-50 border-r border-sidebar-border">
      <div className="p-3 lg:p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="hidden lg:block text-sm font-bold text-sidebar-primary-foreground tracking-tight">
            First Sale OS
          </span>
        </div>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 lg:px-5 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}