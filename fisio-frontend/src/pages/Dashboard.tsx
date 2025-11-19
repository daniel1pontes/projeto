import React from "react";
import { Grid, Card, CardContent, Typography, Box, Paper } from "@mui/material";
import {
  People,
  MedicalServices,
  CalendarToday,
  TrendingUp,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import { api } from "../services/api";
import { DashboardStats } from "../types";

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>(
    "dashboard-stats",
    async (): Promise<DashboardStats> => {
      const response = await api.get("/api/dashboard/stats");
      return response.data as DashboardStats;
    }
  );

  const statCards = [
    {
      title: "Total de Pacientes",
      value: stats?.totalPacientes || 0,
      icon: <People />,
      color: "#1976d2",
    },
    {
      title: "Fisioterapeutas",
      value: stats?.totalFisioterapeutas || 0,
      icon: <MedicalServices />,
      color: "#388e3c",
    },
    {
      title: "Consultas Hoje",
      value: stats?.consultasHoje || 0,
      icon: <CalendarToday />,
      color: "#f57c00",
    },
    {
      title: "Consultas no Mês",
      value: stats?.consultasMes || 0,
      icon: <TrendingUp />,
      color: "#7b1fa2",
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visão geral do sistema de fisioterapia
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: card.color,
                      color: "white",
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Consultas por Mês
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
                color: "text.secondary",
              }}
            >
              Gráfico de consultas por mês será implementado aqui
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Status das Consultas
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Concluídas</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats?.consultasConcluidas || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Canceladas</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats?.consultasCanceladas || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Agendadas</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats?.totalConsultas || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Consultas
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                color: "text.secondary",
              }}
            >
              Lista de próximas consultas será implementada aqui
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
