import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSolicitudes, getMensajes, enviarMensaje, getPerfilUsuario, rateService } from "@/services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User, MessageSquare, CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Inbox = () => {
    const { user } = useAuth();
    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null);
    const [mensajes, setMensajes] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
    const { toast } = useToast();

    // Rating State
    const [ratingOpen, setRatingOpen] = useState(false);
    const [ratingScore, setRatingScore] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.email) return;
            try {
                const profile = await getPerfilUsuario(user.email);
                setCurrentUserProfile(profile);
                if (profile) {
                    const reqs = await getSolicitudes(profile.id);
                    setSolicitudes(reqs || []);
                }
            } catch (error) {
                console.error("Error loading inbox:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedSolicitud) return;
            setLoadingMessages(true);
            try {
                const msgs = await getMensajes(selectedSolicitud.id_solicitud);
                setMensajes(msgs || []);
            } catch (error) {
                console.error("Error loading messages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [selectedSolicitud]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSolicitud || !currentUserProfile) return;
        setSending(true);
        try {
            await enviarMensaje(selectedSolicitud.id_solicitud, currentUserProfile.id, newMessage);
            setNewMessage("");
            // Refresh messages
            const msgs = await getMensajes(selectedSolicitud.id_solicitud);
            setMensajes(msgs || []);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleRateService = async () => {
        if (!selectedSolicitud || ratingScore === 0) return;
        setSubmittingRating(true);
        try {
            await rateService(selectedSolicitud.id_solicitud, ratingScore, ratingComment);
            toast({
                title: "¡Gracias por tu calificación!",
                description: "Tu opinión ayuda a mejorar la comunidad.",
            });
            setRatingOpen(false);
            // Refresh requests to show updated status
            if (currentUserProfile) {
                const reqs = await getSolicitudes(currentUserProfile.id);
                setSolicitudes(reqs || []);
                // Update selected request status locally
                setSelectedSolicitud({ ...selectedSolicitud, estado: 'FINALIZADO' });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo enviar la calificación.",
                variant: "destructive"
            });
        } finally {
            setSubmittingRating(false);
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
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    Mensajes
                </h1>

                <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                    {/* Sidebar: List of Conversations */}
                    <Card className="md:col-span-1 h-full flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Conversaciones</CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-2">
                                {solicitudes.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8 text-sm">
                                        No tienes mensajes aún.
                                    </p>
                                ) : (
                                    solicitudes.map((sol) => {
                                        const isClient = sol.cliente.p_nombre === currentUserProfile?.nombre.split(' ')[0]; // Simple check
                                        const otherUser = isClient ? sol.trabajador : sol.cliente;

                                        return (
                                            <div
                                                key={sol.id_solicitud}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedSolicitud?.id_solicitud === sol.id_solicitud
                                                    ? "bg-primary/10 border-primary/20 border"
                                                    : "hover:bg-slate-100 border border-transparent"
                                                    }`}
                                                onClick={() => setSelectedSolicitud(sol)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-sm">
                                                        {otherUser.p_nombre} {otherUser.ap_paterno}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(sol.fecha_creacion), "d MMM", { locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-primary mb-1">
                                                    {sol.servicio.nombre_servicio}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {sol.mensaje}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* Main: Chat Interface */}
                    <Card className="md:col-span-2 h-full flex flex-col">
                        {selectedSolicitud ? (
                            <>
                                <CardHeader className="pb-3 border-b bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">
                                                {selectedSolicitud.servicio.nombre_servicio}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Estado: <span className={`font-medium ${selectedSolicitud.estado === 'FINALIZADO' ? 'text-green-600' : 'text-foreground'}`}>{selectedSolicitud.estado}</span>
                                            </p>
                                        </div>
                                        {/* Action Buttons */}
                                        {selectedSolicitud.estado !== 'FINALIZADO' && currentUserProfile?.id === selectedSolicitud.cliente.id_persona && (
                                            <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <CheckCircle className="h-4 w-4" />
                                                        Finalizar y Calificar
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Calificar Servicio</DialogTitle>
                                                        <DialogDescription>
                                                            ¿Cómo fue tu experiencia con este profesional?
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4 space-y-4">
                                                        <div className="flex justify-center gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-8 w-8 cursor-pointer transition-colors ${ratingScore >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                                                                    onClick={() => setRatingScore(star)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Textarea
                                                            placeholder="Escribe un comentario sobre el servicio..."
                                                            value={ratingComment}
                                                            onChange={(e) => setRatingComment(e.target.value)}
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleRateService} disabled={submittingRating || ratingScore === 0}>
                                                            {submittingRating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                            Enviar Calificación
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </CardHeader>

                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-3">
                                        {/* Original Request Message */}
                                        <div className="flex justify-start">
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-[80%]">
                                                <p className="text-xs font-semibold mb-1 text-amber-700">Solicitud Inicial</p>
                                                <p className="text-sm text-slate-700">{selectedSolicitud.mensaje}</p>
                                                <span className="text-[10px] text-amber-600 mt-1 block">
                                                    {format(new Date(selectedSolicitud.fecha_creacion), "HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                        </div>

                                        {loadingMessages ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            mensajes.map((msg: any) => {
                                                const isOwnMessage = msg.id_remitente === currentUserProfile?.id;
                                                const senderName = msg.remitente ? `${msg.remitente.p_nombre} ${msg.remitente.ap_paterno}` : "Usuario";

                                                return (
                                                    <div key={msg.id_mensaje} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                                        <div className={`rounded-lg px-4 py-2 max-w-[70%] ${isOwnMessage
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-slate-200 text-slate-900"
                                                            }`}>
                                                            {!isOwnMessage && (
                                                                <p className="text-xs font-semibold mb-1 text-indigo-700">
                                                                    {senderName}
                                                                </p>
                                                            )}
                                                            <p className="text-sm break-words">{msg.contenido}</p>
                                                            <span className={`text-[10px] mt-1 block ${isOwnMessage ? "text-indigo-200" : "text-slate-500"
                                                                }`}>
                                                                {format(new Date(msg.fecha_envio), "HH:mm", { locale: es })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 border-t bg-slate-50/50">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            placeholder="Escribe un mensaje..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={sending || !newMessage.trim()}>
                                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Selecciona una conversación</p>
                                <p className="text-sm">Elige una solicitud de la izquierda para ver los mensajes.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Inbox;
