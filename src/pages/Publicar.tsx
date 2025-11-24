import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategorias, createService, getPerfilUsuario, checkCanPublish } from "@/services/api";
import { Categoria } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

const Publicar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [canPublish, setCanPublish] = useState(false);
  const [planError, setPlanError] = useState("");

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoriaId: "",
    precio: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await getCategorias();
        setCategorias(cats);

        if (user?.email) {
          const profile = await getPerfilUsuario(user.email);
          if (profile) {
            const check = await checkCanPublish(profile.id);
            if (check.allowed) {
              setCanPublish(true);
            } else {
              setCanPublish(false);
              setPlanError(check.reason === "No active plan"
                ? "No tienes un plan activo. Suscríbete para publicar."
                : "Has alcanzado el límite de publicaciones de tu plan.");
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingPlan(false);
      }
    };
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar",
        variant: "destructive",
      });
      return;
    }

    if (!formData.titulo || !formData.descripcion || !formData.categoriaId || !formData.precio) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const profile = await getPerfilUsuario(user.email || "");

      if (!profile) {
        throw new Error("No se pudo encontrar tu perfil de usuario.");
      }

      // Check publication limits before creating service
      const check = await checkCanPublish(profile.id);
      if (!check.allowed) {
        toast({
          title: "Límite Alcanzado",
          description: check.reason === "No active plan"
            ? "No tienes un plan activo. Suscríbete para publicar."
            : "Has alcanzado el límite de publicaciones de tu plan. Actualiza tu suscripción para publicar más servicios.",
          variant: "destructive",
        });
        setLoading(false);
        navigate("/planes");
        return;
      }

      await createService({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio,
        categoriaId: parseInt(formData.categoriaId),
        trabajadorId: profile.id
      });

      toast({
        title: "¡Servicio publicado!",
        description: "Tu servicio ha sido publicado exitosamente",
      });

      setFormData({
        titulo: "",
        descripcion: "",
        categoriaId: "",
        precio: "",
      });

      setTimeout(() => {
        navigate("/categorias");
      }, 1500);

    } catch (error: any) {
      console.error("Error creating service:", error);
      toast({
        title: "Error al publicar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canPublish) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-destructive flex flex-col items-center gap-2">
                <AlertCircle className="h-12 w-12" />
                No puedes publicar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-6">
                {planError}
              </p>
              <Button className="w-full" onClick={() => navigate("/planes")}>
                Ver Planes
              </Button>
            </CardContent>
          </Card>
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
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50 bg-white/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center pb-8 border-b border-border/50 bg-indigo-50/30">
                <div className="mx-auto bg-indigo-100 p-3 rounded-full w-fit mb-4">
                  <div className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-800">Publicar Nuevo Servicio</CardTitle>
                <CardDescription className="text-base text-slate-500 max-w-md mx-auto mt-2">
                  Completa el formulario para ofrecer tu servicio profesional a miles de clientes potenciales.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoriaId}
                      onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                      disabled={loading}
                    >
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)} className="text-base">
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
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Ingresa el precio en pesos chilenos
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" size="lg" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {loading ? "Publicando..." : "Publicar Servicio"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/categorias")}
                      disabled={loading}
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
