import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ClientesList from "./pages/ClientesList";
import ClienteForm from "./pages/ClienteForm";
import ContratosList from "./pages/ContratosList";
import ContratoForm from "./pages/ContratoForm";
import ProtestosList from "./pages/ProtestosList";
import ProtestoForm from "./pages/ProtestoForm";
import AvalistasList from "./pages/AvalistasList";
import AvalistaForm from "./pages/AvalistaForm";
import EspeciesList from "./pages/EspeciesList";
import EspecieForm from "./pages/EspecieForm";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="clientes" element={<ClientesList />} />
              <Route path="clientes/novo" element={<ClienteForm />} />
              <Route path="clientes/editar/:id" element={<ClienteForm />} />
              <Route path="contratos" element={<ContratosList />} />
              <Route path="contratos/novo" element={<ContratoForm />} />
              <Route path="contratos/editar/:id" element={<ContratoForm />} />
              <Route path="protestos" element={<ProtestosList />} />
              <Route path="protestos/novo" element={<ProtestoForm />} />
              <Route path="protestos/editar/:id" element={<ProtestoForm />} />
              <Route path="avalistas" element={<AvalistasList />} />
              <Route path="avalistas/novo" element={<AvalistaForm />} />
              <Route path="avalistas/editar/:id" element={<AvalistaForm />} />
              <Route path="especies" element={<EspeciesList />} />
              <Route path="especies/novo" element={<EspecieForm />} />
              <Route path="especies/editar/:id" element={<EspecieForm />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
