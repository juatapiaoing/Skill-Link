import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loadFromLocalStorage, saveToLocalStorage, initializeData, Categoria, Servicio } from "@/lib/mockData";

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
    setCategorias(loadFromLocalStorage('categorias', []));
    setServicios(loadFromLocalStorage('servicios', []));
  }, []);

  const serviciosFiltrados = categoriaSeleccionada
    ? servicios.filter(s => s.categoria === categoriaSeleccionada)
    : servicios;

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

            {/* Categorías Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {categorias.map((categoria) => (
                <Card
                  key={categoria.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    categoriaSeleccionada === categoria.nombre
                      ? "ring-2 ring-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() =>
                    setCategoriaSeleccionada(
                      categoriaSeleccionada === categoria.nombre ? null : categoria.nombre
                    )
                  }
                >
                  <CardContent className="pt-6 pb-4 text-center">
                    <div className="text-4xl mb-2">{categoria.icono}</div>
                    <h3 className="font-semibold text-sm mb-1">{categoria.nombre}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {categoria.cantidadServicios} servicios
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

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
                  <Card key={servicio.id} className="hover:shadow-lg transition-shadow">
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
                      <p className="text-muted-foreground">{servicio.descripcion}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No hay servicios disponibles en esta categoría todavía
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
