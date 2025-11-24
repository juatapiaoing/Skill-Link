import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, User, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getPerfilUsuario } from "@/services/api";
import { getUnreadNotifications } from "@/services/clientApi";
import { useQuery } from "@tanstack/react-query";
import NotificationBadge from "@/components/NotificationBadge";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        getPerfilUsuario(session.user.email).then(setUserProfile);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        getPerfilUsuario(session.user.email).then(setUserProfile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/login");
  };

  // Get unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications', userProfile?.id, userProfile?.tipo],
    queryFn: () => userProfile?.id && userProfile?.tipo
      ? getUnreadNotifications(userProfile.id, userProfile.tipo)
      : Promise.resolve(0),
    enabled: !!userProfile?.id && !!userProfile?.tipo,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SkillLink
            </span>
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

            {user ? (
              <>
                {userProfile?.tipo === 'Trabajador' && (
                  <>
                    <Link to="/publicar">
                      <Button
                        variant={isActive("/publicar") ? "default" : "ghost"}
                        className="font-medium"
                      >
                        Publicar
                      </Button>
                    </Link>
                    <Link to="/mis-servicios">
                      <Button
                        variant={isActive("/mis-servicios") ? "default" : "ghost"}
                        className="font-medium"
                      >
                        Mis Servicios
                      </Button>
                    </Link>
                  </>
                )}
                {userProfile?.tipo === 'Cliente' && (
                  <Link to="/mis-solicitudes">
                    <Button
                      variant={isActive("/mis-solicitudes") ? "default" : "ghost"}
                      className="font-medium"
                    >
                      Mis Solicitudes
                    </Button>
                  </Link>
                )}
                <Link to="/inbox" className="relative">
                  <Button
                    variant={isActive("/inbox") ? "default" : "ghost"}
                    className="font-medium"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensajes
                    {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive("/perfil") ? "default" : "ghost"}
                      className="font-medium"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/perfil/editar")}>
                      Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant={isActive("/login") ? "default" : "ghost"}
                    className="font-medium"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="default"
                    className="font-medium"
                  >
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
