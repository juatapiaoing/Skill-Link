import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategorias, getServicios } from "@/services/api";
import { Loader2, Search } from "lucide-react";

const Categorias = () => {
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias
  });

  const { data: servicios = [], isLoading: loadingServicios } = useQuery({
    queryKey: ['servicios'],
    queryFn: getServicios
  });

  // Apply filters
  let serviciosFiltrados = servicios;

  // Filter by category
  if (categoriaSeleccionada && categoriaSeleccionada !== "all") {
    serviciosFiltrados = serviciosFiltrados.filter(s => s.categoria === categoriaSeleccionada);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    serviciosFiltrados = serviciosFiltrados.filter(s =>
      s.titulo.toLowerCase().includes(query) ||
      s.descripcion.toLowerCase().includes(query) ||
      s.trabajadorNombre.toLowerCase().includes(query)
    );
  }

  if (loadingCategorias || loadingServicios) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-center text-foreground">
              Explora Servicios por Categoría
            </h1>
            <p className="text-muted-foreground text-center mb-8 text-lg">
              Encuentra profesionales especializados en diferentes áreas
            </p>

            {/* Search and Filter Section */}
            <div className="mb-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar servicios, profesionales..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(categoriaSeleccionada !== "all" || searchQuery.trim()) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filtros activos:</span>
                  {categoriaSeleccionada !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {categoriaSeleccionada}
                      <button
                        onClick={() => setCategoriaSeleccionada("all")}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchQuery.trim() && (
                    <Badge variant="secondary" className="gap-1">
                      Búsqueda: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <button
                    onClick={() => {
                      setCategoriaSeleccionada("all");
                      setSearchQuery("");
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            {/* Servicios Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((servicio) => (
                  <Card
                    key={servicio.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      console.log("Navigating to service:", servicio.id);
                      navigate(`/servicio/${servicio.id}`);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {servicio.categoria}
                        </Badge>
                        <span className="text-xl font-bold text-primary">{servicio.precio}</span>
                      </div>
                      <CardTitle className="text-xl">{servicio.titulo}</CardTitle>
                      <CardDescription className="text-sm">
                        Por {servicio.trabajadorNombre}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">{servicio.descripcion}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No hay servicios disponibles en esta categoría todavía.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categorias;
