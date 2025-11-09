import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loadFromLocalStorage, saveToLocalStorage, initializeData, Servicio, Categoria } from "@/lib/mockData";

const Publicar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    precio: "",
    trabajadorNombre: "María López", // Simulando usuario activo
  });

  useEffect(() => {
    initializeData();
    setCategorias(loadFromLocalStorage('categorias', []));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descripcion || !formData.categoria || !formData.precio) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Cargar servicios existentes
    const servicios = loadFromLocalStorage<Servicio[]>('servicios', []);
    
    // Crear nuevo servicio
    const nuevoServicio: Servicio = {
      id: servicios.length + 1,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      precio: formData.precio.startsWith('$') ? formData.precio : `$${formData.precio}`,
      trabajadorId: 1, // Simulando ID del usuario activo
      trabajadorNombre: formData.trabajadorNombre,
    };

    // Guardar en localStorage
    servicios.push(nuevoServicio);
    saveToLocalStorage('servicios', servicios);

    // Actualizar contador de categoría
    const categoriasActualizadas = loadFromLocalStorage<Categoria[]>('categorias', []);
    const categoriaIndex = categoriasActualizadas.findIndex(c => c.nombre === formData.categoria);
    if (categoriaIndex !== -1) {
      categoriasActualizadas[categoriaIndex].cantidadServicios += 1;
      saveToLocalStorage('categorias', categoriasActualizadas);
    }

    toast({
      title: "¡Servicio publicado!",
      description: "Tu servicio ha sido publicado exitosamente",
    });

    // Limpiar formulario
    setFormData({
      titulo: "",
      descripcion: "",
      categoria: "",
      precio: "",
      trabajadorNombre: "María López",
    });

    // Redirigir a categorías después de 1 segundo
    setTimeout(() => {
      navigate("/categorias");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Publicar Nuevo Servicio</CardTitle>
                <CardDescription className="text-base">
                  Completa el formulario para ofrecer tu servicio profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título del Servicio *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Entrenamiento Personal Online"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe tu servicio, qué incluye y qué beneficios ofrece..."
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={5}
                      className="text-base resize-none"
                    />
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.nombre} className="text-base">
                            {cat.icono} {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio *</Label>
                    <Input
                      id="precio"
                      placeholder="Ej: 20000 o $20.000"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ingresa el precio en pesos chilenos
                    </p>
                  </div>

                  {/* Nombre del Profesional */}
                  <div className="space-y-2">
                    <Label htmlFor="trabajador">Tu Nombre</Label>
                    <Input
                      id="trabajador"
                      value={formData.trabajadorNombre}
                      onChange={(e) => setFormData({ ...formData, trabajadorNombre: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" size="lg" className="flex-1">
                      Publicar Servicio
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/categorias")}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Publicar;
