import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [tipo, setTipo] = useState<"cliente" | "trabajador">("cliente");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: nombre,
                        last_name: apellido,
                        user_type: tipo,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into PERSONA table
                const idPersona = Math.floor(Math.random() * 1000000);

                const { error: personaError } = await supabase
                    .from('persona')
                    .insert([
                        {
                            id_persona: idPersona,
                            p_nombre: nombre,
                            s_nombre: "",
                            ap_paterno: apellido,
                            ap_materno: "",
                            email: email,
                            telefono: "00000000",
                            fecha_nacimiento: new Date().toISOString().split('T')[0],
                            membresia_id_membresia: 1
                        }
                    ]);

                if (personaError) throw new Error(`Error creating persona: ${personaError.message}`);

                // 3. Insert into CLIENTE (Everyone is a client)
                const { error: clienteError } = await supabase
                    .from('cliente')
                    .insert([{ id_persona: idPersona, id_cliente: idPersona, id_membresia: 1 }]);

                if (clienteError) throw new Error(`Error creating cliente: ${clienteError.message}`);

                // 4. If Worker, insert into TRABAJADOR and PERFIL
                if (tipo === 'trabajador') {
                    const { error: trabajadorError } = await supabase
                        .from('trabajador')
                        .insert([{ id_persona: idPersona, id_trabajador: idPersona, id_membresia: 1 }]);

                    if (trabajadorError) throw new Error(`Error creating trabajador: ${trabajadorError.message}`);

                    const { error: perfilError } = await supabase
                        .from('perfil')
                        .insert([{
                            id_perfil: idPersona,
                            username: email.split('@')[0],
                            descripcion: `Usuario nuevo (${tipo})`,
                            cliente_id_cliente: idPersona,
                            trabajador_id_trabajador: idPersona,
                            id_categoria: 1, // Default category
                            id_tipo_ofrecimiento: 1, // Default
                            id_categoria2: 1, // Default
                            id_tipo_ofrecimiento2: 1 // Default
                        }]);

                    if (perfilError) throw new Error(`Error creating perfil: ${perfilError.message}`);
                }

                toast({
                    title: "¡Cuenta creada!",
                    description: "Te has registrado exitosamente.",
                });

                navigate("/");
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            toast({
                variant: "destructive",
                title: "Error al registrarse",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
                        <CardDescription className="text-center">
                            Únete a SkillLink para encontrar u ofrecer servicios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido</Label>
                                    <Input
                                        id="apellido"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Quiero...</Label>
                                <RadioGroup defaultValue="cliente" onValueChange={(val) => setTipo(val as "cliente" | "trabajador")} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cliente" id="r-cliente" />
                                        <Label htmlFor="r-cliente">Contratar servicios</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="trabajador" id="r-trabajador" />
                                        <Label htmlFor="r-trabajador">Ofrecer servicios</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creando cuenta..." : "Registrarse"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Inicia Sesión
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default Register;
