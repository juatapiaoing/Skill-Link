import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Briefcase, Mail, MapPin, LogOut, Edit, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Persona, Servicio, Certificacion, Curriculum } from "@/lib/mockData";
import { getPerfilUsuario, getServiciosByTrabajador } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Perfil = () => {
  const { user, signOut } = useAuth();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [experiencias, setExperiencias] = useState<Curriculum[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !user.email) return;

      try {
        const perfil = await getPerfilUsuario(user.email);
        if (perfil) {
          setPersona(perfil);
          const userServices = await getServiciosByTrabajador(perfil.id);
          setServicios(userServices);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">No se encontró información del perfil.</p>
          <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
          <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header del Perfil */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <img
                    src={persona.foto}
                    alt={persona.nombre}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-between items-start">
                      <h1 className="text-3xl font-bold mb-2">{persona.nombre}</h1>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate("/perfil/editar")}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/profesional/${persona.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Público
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                          <LogOut className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                      <Badge variant="secondary" className="text-sm">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {persona.tipo}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {persona.comuna}
                      </Badge>
                      {persona.email && (
                        <Badge variant="outline" className="text-sm">
                          <Mail className="w-4 h-4 mr-1" />
                          {persona.email}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {persona.descripcion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Certificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificaciones.length > 0 ? (
                    <div className="space-y-4">
                      {certificaciones.map((cert, index) => (
                        <div key={cert.id}>
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-full p-2 mt-1">
                              <Award className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{cert.nombre}</h3>
                              <p className="text-sm text-muted-foreground">
                                {cert.entidad} • {cert.año}
                              </p>
                            </div>
                          </div>
                          {index < certificaciones.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay certificaciones registradas
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Servicios Publicados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Servicios Publicados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {servicios.length > 0 ? (
                    <div className="space-y-4">
                      {servicios.map((servicio, index) => (
                        <div key={servicio.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold">{servicio.titulo}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {servicio.descripcion}
                              </p>
                              <Badge className="bg-primary text-primary-foreground">
                                {servicio.categoria}
                              </Badge>
                            </div>
                            <span className="font-bold text-primary whitespace-nowrap">
                              {servicio.precio}
                            </span>
                          </div>
                          {index < servicios.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay servicios publicados
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Experiencia Laboral (Currículum) */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experiencia Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {experiencias.length > 0 ? (
                  <div className="space-y-6">
                    {experiencias.map((exp, index) => (
                      <div key={exp.id}>
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-lg p-3 mt-1">
                            <Briefcase className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{exp.cargo}</h3>
                            <p className="text-primary font-medium">{exp.empresa}</p>
                            <p className="text-sm text-muted-foreground mb-2">{exp.periodo}</p>
                            <p className="text-muted-foreground">{exp.descripcion}</p>
                          </div>
                        </div>
                        {index < experiencias.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay experiencia laboral registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
