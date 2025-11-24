import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategorias, getServicios } from "@/services/api";
import { Loader2 } from "lucide-react";

const Categorias = () => {
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias
  });

  const { data: servicios = [], isLoading: loadingServicios } = useQuery({
    queryKey: ['servicios'],
    queryFn: getServicios
  });

  const serviciosFiltrados = categoriaSeleccionada
    ? servicios.filter(s => s.categoria === categoriaSeleccionada)
    : servicios;

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
            <p className="text-muted-foreground text-center mb-12 text-lg">
              Encuentra profesionales especializados en diferentes áreas
            </p>

            {/* Filtro Activo */}
            {categoriaSeleccionada && (
              <div className="mb-6 flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-foreground font-medium">
                  Mostrando servicios de: <span className="text-primary font-semibold">{categoriaSeleccionada}</span>
                </p>
                <button
                  onClick={() => setCategoriaSeleccionada(null)}
                  className="text-primary hover:text-primary-hover font-medium"
                >
                  Limpiar filtro
                </button>
              </div>
            )}

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
