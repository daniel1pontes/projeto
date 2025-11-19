import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Pacientes } from "./pages/Pacientes";
import { Fisioterapeutas } from "./pages/Fisioterapeutas";
import { Recepcionistas } from "./pages/Recepcionistas";
import { Consultas } from "./pages/Consultas";
import { Agenda } from "./pages/Agenda";
import { Relatorios } from "./pages/Relatorios";
import { Perfil } from "./pages/Perfil";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/fisioterapeutas" element={<Fisioterapeutas />} />
        <Route path="/recepcionistas" element={<Recepcionistas />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
