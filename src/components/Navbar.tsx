import { Link, useLocation } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Briefcase className="h-7 w-7" />
            <span className="text-2xl font-bold">SkillLink</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"}
                className="font-medium"
              >
                Inicio
              </Button>
            </Link>
            <Link to="/categorias">
              <Button 
                variant={isActive("/categorias") ? "default" : "ghost"}
                className="font-medium"
              >
                Categorías
              </Button>
            </Link>
            <Link to="/publicar">
              <Button 
                variant={isActive("/publicar") ? "default" : "ghost"}
                className="font-medium"
              >
                Publicar
              </Button>
            </Link>
            <Link to="/perfil">
              <Button 
                variant={isActive("/perfil") ? "default" : "ghost"}
                className="font-medium"
              >
                Mi Perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
