import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Search, Users, MapPin, ArrowRight, Loader2, Star, CheckCircle, TrendingUp, MessageSquare, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getTrabajadoresDestacados, getCategoriasDestacadas, getCategorias, searchProfessionals, getPerfilUsuario, getSolicitudes, checkCanPublish, getCurrentMembership } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch user profile to determine role
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.email) {
        try {
          const profile = await getPerfilUsuario(user.email);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  // Queries for Marketplace View
  const { data: perfilesDestacados = [] } = useQuery({
    queryKey: ['trabajadoresDestacados'],
    queryFn: getTrabajadoresDestacados,
    enabled: !userProfile || userProfile.tipo !== 'Trabajador'
  });

  const { data: categoriasDestacadas = [] } = useQuery({
    queryKey: ['categoriasDestacadas'],
    queryFn: getCategoriasDestacadas,
    enabled: !userProfile || userProfile.tipo !== 'Trabajador'
  });

  const { data: allCategorias = [] } = useQuery({
    queryKey: ['allCategorias'],
    queryFn: getCategorias
  });

  // Queries for Professional View
  const { data: solicitudes = [] } = useQuery({
    queryKey: ['solicitudesWorker', userProfile?.id],
    queryFn: () => getSolicitudes(userProfile.id),
    enabled: !!userProfile && userProfile.tipo === 'Trabajador'
  });

  const { data: planStatus } = useQuery({
    queryKey: ['planStatus', userProfile?.id],
    queryFn: () => checkCanPublish(userProfile.id),
    enabled: !!userProfile && userProfile.tipo === 'Trabajador'
  });

  const { data: currentMembership } = useQuery({
    queryKey: ['currentMembership', userProfile?.id],
    queryFn: () => getCurrentMembership(userProfile.id),
    enabled: !!userProfile && userProfile.tipo === 'Trabajador'
  });

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await searchProfessionals(searchQuery, selectedCategory);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedProfiles = searchResults.length > 0 || (searchQuery || selectedCategory !== "all")
    ? searchResults
    : perfilesDestacados;

  const isFiltered = searchQuery !== "" || selectedCategory !== "all";

  // --- PROFESSIONAL DASHBOARD VIEW ---
  if (userProfile?.tipo === 'Trabajador') {
    const activeRequests = solicitudes.filter((s: any) => s.estado === 'PENDIENTE' || s.estado === 'ACEPTADO').length;
    const completedRequests = solicitudes.filter((s: any) => s.estado === 'FINALIZADO').length;

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hola, {userProfile.nombre.split(' ')[0]} 👋</h1>
              <p className="text-slate-500">Aquí tienes un resumen de tu actividad profesional.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/mis-servicios">
                <Button variant="outline" className="gap-2">
                  <Briefcase className="h-4 w-4" /> Gestionar Publicaciones
                </Button>
              </Link>
              <Link to="/publicar">
                <Button className="gap-2">
                  <Briefcase className="h-4 w-4" /> Publicar Nuevo Servicio
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeRequests}</div>
                <p className="text-xs text-muted-foreground">Clientes esperando respuesta</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trabajos Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedRequests}</div>
                <p className="text-xs text-muted-foreground">Servicios finalizados con éxito</p>
              </CardContent>
            </Card>
            <Card className={planStatus?.allowed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
                <Shield className={`h-4 w-4 ${planStatus?.allowed ? "text-green-600" : "text-yellow-600"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${planStatus?.allowed ? "text-green-700" : "text-yellow-700"}`}>
                  {(currentMembership?.plan as any)?.nombre || "Free"}
                </div>
                {currentMembership?.plan && (
                  <>
                    <p className="text-xs text-green-600 mt-1">
                      {(currentMembership.plan as any).max_publicaciones === -1
                        ? "Publicaciones ilimitadas"
                        : `Hasta ${(currentMembership.plan as any).max_publicaciones} publicaciones`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Vence: {new Date(currentMembership.fecha_fin).toLocaleDateString('es-CL')}
                    </p>
                  </>
                )}
                <Link to="/planes" className="text-xs underline hover:text-primary mt-2 block">
                  Ver detalles del plan
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-indigo-600 border-indigo-500 mb-8">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1">¡Mejora tu visibilidad!</h3>
                <p className="text-indigo-100">
                  Los perfiles con foto y descripción detallada reciben un 40% más de solicitudes. ¡Asegúrate de que tu perfil esté completo!
                </p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/perfil/editar')} className="whitespace-nowrap">
                Completar Perfil
              </Button>
            </CardContent>
          </Card>
        </main >
        <Footer />
      </div >
    );
  }

  // --- CLIENT / GUEST MARKETPLACE VIEW ---
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-20 pb-32">
          {/* Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                La plataforma #1 de servicios en Chile
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900">
                Conecta con el <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                  Talento Ideal
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Encuentra profesionales verificados o ofrece tus servicios en la comunidad de mayor crecimiento.
              </p>

              {/* Search Bar */}
              <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-xl shadow-indigo-100/50 border border-white/50 max-w-3xl mx-auto flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="¿Qué servicio buscas? (ej. Electricista)"
                    className="pl-12 h-14 border-transparent bg-transparent focus-visible:ring-0 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-14 border-transparent bg-transparent focus:ring-0 text-base">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {allCategorias.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="lg" className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="animate-spin" /> : "Buscar"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-indigo-500" /> +10k Profesionales
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-indigo-500" /> Todo Chile
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-indigo-500" /> Garantía de Servicio
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Results / Featured Profiles */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                  {isFiltered ? "Resultados de Búsqueda" : "Profesionales Destacados"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {isFiltered
                    ? `Encontramos ${displayedProfiles.length} profesionales para tu búsqueda`
                    : "Conoce a algunos de los mejores profesionales en nuestra plataforma"}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {displayedProfiles.map((persona) => (
                  <Card key={persona.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-white/50 backdrop-blur-sm overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 group-hover:from-indigo-500/20 group-hover:to-violet-500/20 transition-colors" />
                    <CardHeader className="text-center pb-4 -mt-12 relative z-10">
                      <div className="flex justify-center mb-4">
                        <img
                          src={persona.foto}
                          alt={persona.nombre}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                        {persona.nombre}
                        {/* Mock verification check */}
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      </CardTitle>
                      <CardDescription className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 py-1 px-3 rounded-full mx-auto w-fit mt-2">
                        <MapPin className="w-3 h-3" />
                        {persona.comuna}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {persona.descripcion}
                      </p>
                      <div className="flex flex-col gap-3">
                        <Link to={`/profesional/${persona.id}`} className="w-full">
                          <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 transition-all">
                            Ver Perfil Completo
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!isFiltered && (
                <div className="text-center">
                  <Link to="/categorias">
                    <Button size="lg" variant="default">
                      Ver Todos los Profesionales
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categorías Destacadas (Only show if not filtering) */}
        {!isFiltered && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                    Categorías Más Solicitadas
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Explora las áreas profesionales con mayor demanda
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {categoriasDestacadas.map((categoria) => (
                    <Link key={categoria.id} to="/categorias">
                      <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary">
                        <CardContent className="pt-6 pb-4 text-center">
                          <div className="text-4xl mb-2">{categoria.icono}</div>
                          <h3 className="font-semibold text-sm mb-1">{categoria.nombre}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {categoria.cantidadServicios} servicios
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="text-center">
                  <Link to="/categorias">
                    <Button size="lg" variant="outline">
                      <Search className="mr-2 h-5 w-5" />
                      Explorar Todas las Categorías
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Listo para Conectar con Oportunidades?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Únete a SkillLink y comienza a ofrecer tus servicios profesionales hoy mismo
              </p>
              <Link to="/perfil">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Ver Mi Perfil
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
