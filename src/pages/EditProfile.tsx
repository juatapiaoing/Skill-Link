import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPerfilUsuario, updateProfile, getPortfolio, addPortfolioItem, deletePortfolioItem, updateProfileTheme } from "@/services/api";
import { Persona } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Palette } from "lucide-react";

const EditProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [persona, setPersona] = useState<Persona | null>(null);

    // Form states
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [comuna, setComuna] = useState("");

    // Customization states
    const [bannerUrl, setBannerUrl] = useState("");
    const [colorTema, setColorTema] = useState("indigo");

    // Portfolio states
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");
    const [newItemUrl, setNewItemUrl] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            if (!user || !user.email) return;

            try {
                const data = await getPerfilUsuario(user.email);
                if (data) {
                    setPersona(data);
                    setNombre(data.nombre);
                    setDescripcion(data.descripcion);
                    setComuna(data.comuna);

                    // Load extra fields if they exist (mockData might not have them typed yet, but API returns them)
                    const p = data as any;
                    setBannerUrl(p.banner_url || "");
                    setColorTema(p.color_tema || "indigo");

                    // Load portfolio
                    if (data.tipo === 'Trabajador') {
                        const portfolioData = await getPortfolio(data.id);
                        setPortfolio(portfolioData || []);
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo cargar la información del perfil.",
                });
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!persona) return;

        setSaving(true);
        try {
            // Update basic info
            await updateProfile(persona.id, {
                nombre,
                descripcion,
                comuna
            });

            // Update theme if worker
            if (persona.tipo === 'Trabajador') {
                await updateProfileTheme(persona.id, {
                    bannerUrl,
                    colorTema
                });
            }

            toast({
                title: "Perfil actualizado",
                description: "Los cambios han sido guardados exitosamente.",
            });

            navigate("/perfil");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al guardar los cambios.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddPortfolio = async () => {
        if (!persona || !newItemTitle || !newItemUrl) return;

        try {
            await addPortfolioItem({
                userId: persona.id,
                titulo: newItemTitle,
                descripcion: newItemDesc,
                fotoUrl: newItemUrl
            });

            // Refresh portfolio
            const updated = await getPortfolio(persona.id);
            setPortfolio(updated || []);
            setIsAddingPortfolio(false);
            setNewItemTitle("");
            setNewItemDesc("");
            setNewItemUrl("");

            toast({ title: "Item agregado al portafolio" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Error al agregar item" });
        }
    };

    const handleDeletePortfolio = async (id: number) => {
        try {
            await deletePortfolioItem(id);
            setPortfolio(portfolio.filter(p => p.id_portafolio !== id));
            toast({ title: "Item eliminado" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error al eliminar item" });
        }
    };

    if (loading) {
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
                    <div className="max-w-4xl mx-auto">
                        <Button variant="ghost" className="mb-4" onClick={() => navigate("/perfil")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Perfil
                        </Button>

                        <div className="grid gap-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Actualiza tus datos básicos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">Nombre Completo</Label>
                                                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="comuna">Comuna</Label>
                                                <Input id="comuna" value={comuna} onChange={(e) => setComuna(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">Descripción Profesional</Label>
                                            <Textarea
                                                id="descripcion"
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Worker Only Sections */}
                            {persona?.tipo === 'Trabajador' && (
                                <>
                                    {/* Customization */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Palette className="h-5 w-5" /> Personalización
                                            </CardTitle>
                                            <CardDescription>Dale estilo a tu perfil público.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>URL del Banner (Imagen de fondo)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={bannerUrl}
                                                        onChange={(e) => setBannerUrl(e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                    {bannerUrl && (
                                                        <div className="w-10 h-10 rounded overflow-hidden border">
                                                            <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Color del Tema</Label>
                                                <div className="flex gap-2">
                                                    {['indigo', 'blue', 'green', 'purple', 'rose'].map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setColorTema(color)}
                                                            className={`w-8 h-8 rounded-full border-2 ${colorTema === color ? 'border-black ring-2 ring-offset-1' : 'border-transparent'}`}
                                                            style={{ backgroundColor: `var(--${color}-500)` }} // Note: Tailwind colors need mapping or classes
                                                        >
                                                            <div className={`w-full h-full rounded-full bg-${color}-500`} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Selecciona el color principal de tu perfil.</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Portfolio */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <ImageIcon className="h-5 w-5" /> Portafolio
                                                </CardTitle>
                                                <CardDescription>Muestra tus mejores trabajos.</CardDescription>
                                            </div>
                                            <Dialog open={isAddingPortfolio} onOpenChange={setIsAddingPortfolio}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Plus className="h-4 w-4 mr-2" /> Agregar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Agregar al Portafolio</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Título</Label>
                                                            <Input value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="Ej: Remodelación Cocina" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Descripción</Label>
                                                            <Textarea value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Detalles del trabajo..." />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>URL de la Imagen</Label>
                                                            <Input value={newItemUrl} onChange={(e) => setNewItemUrl(e.target.value)} placeholder="https://..." />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleAddPortfolio}>Guardar</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </CardHeader>
                                        <CardContent>
                                            {portfolio.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">No has agregado items a tu portafolio aún.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {portfolio.map((item) => (
                                                        <div key={item.id_portafolio} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                                            <img src={item.foto_url} alt={item.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                                                                <p className="font-bold text-sm">{item.titulo}</p>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="mt-2 h-8 w-8"
                                                                    onClick={() => handleDeletePortfolio(item.id_portafolio)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" onClick={() => navigate("/perfil")}>
                                    Cancelar
                                </Button>
                                <Button type="submit" form="profile-form" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Todo
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EditProfile;
