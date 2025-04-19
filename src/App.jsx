// App.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CalendarDays, Briefcase, Landmark, Users, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";
import Clientes from "./components/Clientes";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const data = [
  { name: "Lunes", lavados: 20 },
  { name: "Martes", lavados: 35 },
  { name: "Miércoles", lavados: 25 },
  { name: "Jueves", lavados: 40 },
  { name: "Viernes", lavados: 32 },
  { name: "Sábado", lavados: 50 },
  { name: "Domingo", lavados: 18 },
];

export default function CarwashDashboard() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [stats, setStats] = useState([
    { icon: <Briefcase className="text-black" />, title: "Personal", value: 0 },
    { icon: <Landmark className="text-black" />, title: "Facturación", value: "$0" },
    { icon: <Users className="text-black" />, title: "Clientes", value: 0 },
    { icon: <CalendarDays className="text-black" />, title: "Reservas Hoy", value: 0 },
  ]);

  const [activeModule, setActiveModule] = useState(null);
  const modules = [
    { icon: '👤', label: 'Gestion de Pacientes' },
    { icon: '📅', label: 'Gestion de Citas' },
    { icon: '🧾', label: 'Facturación y Seguros' },
    { icon: '📦', label: 'Inventario' },
    { icon: '🔐', label: 'Roles y Permisos' },
    { icon: '⚙️', label: 'Configuracion' },
  ];

  useEffect(() => {
    const unsubClientes = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      const total = data.reduce((sum, c) => sum + (parseFloat(c.monto) || 0), 0);
      const cantidad = data.length;

      setStats(prev => prev.map(s => ({
        ...s,
        value: s.title === "Facturación" ? `$${total.toLocaleString()}` : s.title === "Clientes" ? cantidad : s.value
      })));
    });

    const unsubReservas = onSnapshot(collection(db, "reservas"), (snapshot) => {
      const hoy = new Date().toISOString().split("T")[0];
      const cantidad = snapshot.docs.filter(doc => {
        const fecha = doc.data().fecha ? doc.data().fecha.split("T")[0] : "";
        return fecha === hoy;
      }).length;

      setStats(prev => prev.map(s => s.title === "Reservas Hoy" ? { ...s, value: cantidad } : s));
    });

    return () => {
      unsubClientes();
      unsubReservas();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError("Complete todos los campos");
      setShowErrorModal(true);
      return;
    }
    try {
      setLoggingIn(true);
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch {
      setError("Datos incorrectos o usuario inexistente.");
      setShowErrorModal(true);
    } finally {
      setLoggingIn(false);
    }
  }, [email, password]);

  const handleLogout = useCallback(async () => {
    setAuthenticated(false);
    await signOut(auth);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex flex-col items-center justify-center bg-white text-black p-4 overflow-x-hidden space-y-2">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src="https://i.imgur.com/VxM2kVB.png"
            alt="Logo Mamut"
            className="h-24 w-24 object-contain mb-6"
          />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded-lg px-4 py-2 bg-transparent text-black w-64" />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="border rounded-lg px-4 py-2 bg-transparent text-black w-64" />
          <Button onClick={handleLogin} disabled={loggingIn} className="px-4 py-2 mt-2 bg-black text-white w-64 transition-transform transform hover:scale-105">
            {loggingIn ? (
              <motion.div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto animate-spin" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} />
            ) : (
              "Ingresar"
            )}
          </Button>
          {showErrorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold text-red-600">Error</h2>
                <p>{error}</p>
                <Button onClick={() => setShowErrorModal(false)} className="mt-4 mx-auto block">Cerrar</Button>
              </div>
            </div>
          )}
        </main>
        <footer className="mt-auto w-full py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
          powered by <strong>elanticristo™</strong>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} className="flex-grow bg-white text-black p-6 space-y-6 font-sans overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="https://i.imgur.com/VxM2kVB.png" alt="Logo Mamut" className="h-24 w-24 object-contain" />
            <h1 className="text-3xl font-bold">Tuskware</h1>
          </div>
          <div className="flex gap-2 items-center">
            <User className="w-6 h-6 text-black" />
            <Button variant="ghost" onClick={handleLogout} title="Cerrar sesión" className="transition-transform transform hover:scale-105"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
        <Tabs defaultValue="clientes">
          <TabsList className="flex justify-center gap-4">
            <TabsTrigger key="clientes" value="clientes">Registro</TabsTrigger>
            <TabsTrigger key="panel" value="panel">Panel</TabsTrigger>
            <TabsTrigger key="gestion" value="gestion">Gestión</TabsTrigger>
          </TabsList>
          <TabsContent key="panel" value="panel">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="rounded-2xl border shadow-none">
                    <CardContent className="flex items-center space-x-4 p-4">
                      {s.icon}
                      <div>
                        <p className="text-sm">{s.title}</p>
                        <p className="text-xl font-semibold">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          <TabsContent key="gestion" value="gestion">
            <AnimatePresence exitBeforeEnter>
              {activeModule ? (
                <motion.div key="detail" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.3 }}>
                  <div className="p-4">
                    <button className="mb-4 text-sm text-blue-600 hover:underline" onClick={() => setActiveModule(null)}>← Volver</button>
                    <h3 className="text-xl font-bold">{activeModule}</h3>
                    <p className="mt-2">Contenido del módulo <strong>{activeModule}</strong> …</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {modules.map((mod, i) => (
                      <motion.div key={i} layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer" onClick={() => setActiveModule(mod.label)}>
                        <Card className="rounded-2xl shadow-md transition-shadow hover:shadow-xl">
                          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                            <span className="text-4xl">{mod.icon}</span>
                            <p className="font-semibold">{mod.label}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent key="clientes" value="clientes">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Clientes />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.main>
      <footer className="mt-auto w-full py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        powered by <strong>elanticristo™</strong>
      </footer>
    </div>
  );
}