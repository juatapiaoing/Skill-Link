import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkerServices, deleteService, updateService, getCategorias, getPerfilUsuario } from "@/services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Edit, Trash2, DollarSign, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MisServicios = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [services, setServices] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [editForm, setEditForm] = useState({
        titulo: "",
        descripcion: "",
        precio: "",
        categoriaId: ""
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.email) {
            navigate("/login");
            return;
        }

        try {
            const profile = await getPerfilUsuario(user.email);
            if (!profile) throw new Error("Perfil no encontrado");

            const [servicesData, categoriasData] = await Promise.all([
                getWorkerServices(profile.id),
                getCategorias()
            ]);

            setServices(servicesData || []);
            setCategorias(categoriasData || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los servicios",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setEditForm({
            titulo: service.titulo,
            descripcion: service.descripcion,
            precio: service.precio,
            categoriaId: service.categoriaId?.toString() || ""
        });
    };

    const handleSaveEdit = async () => {
        if (!editForm.titulo || !editForm.descripcion || !editForm.precio || !editForm.categoriaId) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            await updateService(editingService.id, {
                nombre_servicio: editForm.titulo,
                descripcion: editForm.descripcion,
                precio: editForm.precio,
                categoriaId: parseInt(editForm.categoriaId)
            });

            toast({
                title: "¡Éxito!",
                description: "Servicio actualizado correctamente"
            });

            setEditingService(null);
            loadData();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el servicio",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm || !user?.email) return;

        setDeleting(true);
        try {
            const profile = await getPerfilUsuario(user.email);
            if (!profile) throw new Error("Perfil no encontrado");

            await deleteService(deleteConfirm, profile.id);

            toast({
                title: "¡Éxito!",
                description: "Servicio eliminado correctamente"
            });

            setDeleteConfirm(null);
            loadData();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar el servicio",
                variant: "destructive"
            });
        } finally {
            setDeleting(false);
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
                    <p className="text-muted-foreground">Gestiona tus servicios publicados</p>
                </div>

                {services.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">No tienes servicios publicados</p>
                            <Button onClick={() => navigate("/publicar")}>
                                Publicar Primer Servicio
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Card key={service.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">{service.titulo}</CardTitle>
                                            <Badge variant="secondary" className="gap-1">
                                                <Tag className="h-3 w-3" />
                                                {service.categoriaNombre}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {service.descripcion}
                                    </p>
                                    <div className="flex items-center gap-2 text-lg font-bold text-primary">
                                        <DollarSign className="h-5 w-5" />
                                        {service.precio}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleEdit(service)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => setDeleteConfirm(service.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Editar Servicio</DialogTitle>
                            <DialogDescription>
                                Actualiza la información de tu servicio
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="edit-titulo">Título del Servicio</Label>
                                <Input
                                    id="edit-titulo"
                                    value={editForm.titulo}
                                    onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                                    placeholder="Ej: Reparación de computadores"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-descripcion">Descripción</Label>
                                <Textarea
                                    id="edit-descripcion"
                                    value={editForm.descripcion}
                                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                                    placeholder="Describe tu servicio..."
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-categoria">Categoría</Label>
                                <Select
                                    value={editForm.categoriaId}
                                    onValueChange={(value) => setEditForm({ ...editForm, categoriaId: value })}
                                >
                                    <SelectTrigger id="edit-categoria">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-precio">Precio</Label>
                                <Input
                                    id="edit-precio"
                                    value={editForm.precio}
                                    onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                                    placeholder="Ej: $15.000 o A convenir"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingService(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
            <Footer />
        </div>
    );
};

export default MisServicios;
