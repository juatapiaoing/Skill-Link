import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Briefcase, Mail, MapPin, ArrowLeft, Image as ImageIcon, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Persona, Servicio, Certificacion, Curriculum } from "@/lib/mockData";
import { getPublicProfile, createSolicitud, getPerfilUsuario, getPortfolio } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Send } from "lucide-react";

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [persona, setPersona] = useState<any | null>(null);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!id) return;

            try {
                const profile = await getPublicProfile(id);
                if (profile) {
                    setPersona(profile);
                    // Load portfolio if worker
                    const portfolioData = await getPortfolio(profile.id);
                    setPortfolio(portfolioData || []);
                }
            } catch (error) {
                console.error("Error loading public profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id]);

    if (loading) {
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
                    <p className="text-muted-foreground">No se encontró el perfil solicitado.</p>
                    <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
                </main>
                <Footer />
            </div>
        );
    }

    // Theme color mapping (simple version)
    const themeColors: Record<string, string> = {
        indigo: "bg-indigo-600",
        blue: "bg-blue-600",
        green: "bg-green-600",
        purple: "bg-purple-600",
        rose: "bg-rose-600",
    };
    const themeClass = themeColors[persona.colorTema || "indigo"] || "bg-indigo-600";

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pb-12 bg-background">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full bg-muted relative overflow-hidden">
                    {persona.bannerUrl ? (
                        <img src={persona.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${themeClass} opacity-10`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <Button variant="ghost" className="mb-4 text-white hover:text-white/80 hover:bg-white/10" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>

                        {/* Header del Perfil */}
                        <Card className="mb-8 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                    <img
                                        src={persona.foto}
                                        alt={persona.nombre}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                                    />
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex justify-between items-start">
                                            <h1 className="text-3xl font-bold mb-2">{persona.nombre}</h1>
                                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className={`${themeClass} hover:opacity-90 text-white`}>
                                                        Contactar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Contactar a {persona.nombre}</DialogTitle>
                                                        <DialogDescription>
                                                            Envía un mensaje para solicitar servicios.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <Textarea
                                                            placeholder="Hola, me interesa tus servicios..."
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                            rows={4}
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" onClick={async () => {
                                                            if (!user) {
                                                                toast({
                                                                    title: "Error",
                                                                    description: "Debes iniciar sesión para contactar.",
                                                                    variant: "destructive"
                                                                });
                                                                return;
                                                            }
                                                            if (!message.trim()) return;

                                                            setSending(true);
                                                            try {
                                                                const currentUserProfile = await getPerfilUsuario(user.email || "");
                                                                if (!currentUserProfile) throw new Error("Perfil no encontrado");

                                                                const serviceId = persona.servicios?.[0]?.id || 0;

                                                                await createSolicitud({
                                                                    servicioId: serviceId,
                                                                    clienteId: currentUserProfile.id,
                                                                    trabajadorId: persona.id,
                                                                    mensaje: message
                                                                });

                                                                toast({
                                                                    title: "Solicitud enviada",
                                                                    description: "Tu mensaje ha sido enviado exitosamente."
                                                                });
                                                                setDialogOpen(false);
                                                                setMessage("");
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast({
                                                                    title: "Error",
                                                                    description: "No se pudo enviar la solicitud.",
                                                                    variant: "destructive"
                                                                });
                                                            } finally {
                                                                setSending(false);
                                                            }
                                                        }} disabled={sending} className={themeClass}>
                                                            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                            Enviar Mensaje
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
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
                                            <Badge variant="outline" className="text-sm border-green-200 bg-green-50 text-green-700">
                                                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                                {persona.trabajosCompletados} Trabajos Completados
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {persona.descripcion}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Portfolio Section */}
                        {portfolio.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className={`w-5 h-5 text-${persona.colorTema || 'indigo'}-600`} />
                                        Portafolio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {portfolio.map((item) => (
                                            <div key={item.id_portafolio} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer">
                                                <img src={item.foto_url} alt={item.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                                                    <p className="font-bold text-sm">{item.titulo}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Certificaciones */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className={`w-5 h-5 text-${persona.colorTema || 'indigo'}-600`} />
                                        Certificaciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {persona.certificaciones && persona.certificaciones.length > 0 ? (
                                        <div className="space-y-4">
                                            {persona.certificaciones.map((cert: any, index: number) => (
                                                <div key={cert.id}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`bg-${persona.colorTema || 'indigo'}-100 rounded-full p-2 mt-1`}>
                                                            <Award className={`w-4 h-4 text-${persona.colorTema || 'indigo'}-600`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold">{cert.nombre}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {cert.entidad} • {cert.año}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {index < persona.certificaciones.length - 1 && (
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
                                        <Briefcase className={`w-5 h-5 text-${persona.colorTema || 'indigo'}-600`} />
                                        Servicios Publicados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {persona.servicios && persona.servicios.length > 0 ? (
                                        <div className="space-y-4">
                                            {persona.servicios.map((servicio: any, index: number) => (
                                                <div key={servicio.id} className="cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors" onClick={() => navigate(`/servicio/${servicio.id}`)}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h3 className={`font-semibold text-${persona.colorTema || 'indigo'}-600`}>{servicio.titulo}</h3>
                                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                                {servicio.descripcion}
                                                            </p>
                                                            <Badge className={themeClass}>
                                                                {servicio.categoria}
                                                            </Badge>
                                                        </div>
                                                        <span className={`font-bold text-${persona.colorTema || 'indigo'}-600 whitespace-nowrap`}>
                                                            {servicio.precio}
                                                        </span>
                                                    </div>
                                                    {index < persona.servicios.length - 1 && (
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
                                    <Briefcase className={`w-5 h-5 text-${persona.colorTema || 'indigo'}-600`} />
                                    Experiencia Laboral
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {persona.experiencia && persona.experiencia.length > 0 ? (
                                    <div className="space-y-6">
                                        {persona.experiencia.map((exp: any, index: number) => (
                                            <div key={index}>
                                                <div className="flex items-start gap-4">
                                                    <div className={`bg-${persona.colorTema || 'indigo'}-100 rounded-lg p-3 mt-1`}>
                                                        <Briefcase className={`w-5 h-5 text-${persona.colorTema || 'indigo'}-600`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{exp.cargo}</h3>
                                                        <p className={`text-${persona.colorTema || 'indigo'}-600 font-medium`}>{exp.empresa}</p>
                                                        <p className="text-sm text-muted-foreground mb-2">{exp.periodo}</p>
                                                        <p className="text-muted-foreground">{exp.descripcion}</p>
                                                    </div>
                                                </div>
                                                {index < persona.experiencia.length - 1 && (
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

export default PublicProfile;
