import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today, Add } from "@mui/icons-material";
import { useQuery } from "react-query";
import { api } from "../services/api";
import { Consulta } from "../types";
import toast from "react-hot-toast";

export const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  const { data: consultas, isLoading } = useQuery<Consulta[]>(
    ["agenda", currentDate, viewMode],
    async (): Promise<Consulta[]> => {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (viewMode === "week") {
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        endDate.setDate(endDate.getDate() + (6 - dayOfWeek));
      } else {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      const response = await api.get("/api/consultas/agenda", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data as Consulta[];
    }
  );

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getConsultasForDay = (day: Date) => {
    if (!consultas) return [];
    return consultas.filter((consulta) => {
      const consultaDate = new Date(consulta.dataHora);
      return consultaDate.toDateString() === day.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return "#1976d2";
      case "EM_ANDAMENTO":
        return "#ff9800";
      case "CONCLUIDA":
        return "#388e3c";
      case "CANCELADA":
        return "#d32f2f";
      case "NAO_COMPARECEU":
        return "#757575";
      default:
        return "#757575";
    }
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 15 }, (_, i) => i + 7);

    return (
      <Box>
        <Grid container>
          <Grid item sx={{ width: 80, p: 2, border: "1px solid #e0e0e0" }}>
            <Typography variant="caption" fontWeight="bold">
              Horário
            </Typography>
          </Grid>
          {weekDays.map((day, index) => (
            <Grid
              item
              key={index}
              sx={{
                flex: 1,
                p: 2,
                border: "1px solid #e0e0e0",
                textAlign: "center",
                backgroundColor:
                  day.toDateString() === new Date().toDateString()
                    ? "#f5f5f5"
                    : "white",
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {day.toLocaleDateString("pt-BR", { weekday: "short" })}
              </Typography>
              <Typography variant="h6">{day.getDate()}</Typography>
            </Grid>
          ))}
        </Grid>

        {hours.map((hour) => (
          <Grid container key={hour}>
            <Grid
              item
              sx={{
                width: 80,
                p: 2,
                border: "1px solid #e0e0e0",
                backgroundColor: "#fafafa",
              }}
            >
              <Typography variant="caption">
                {hour.toString().padStart(2, "0")}:00
              </Typography>
            </Grid>
            {weekDays.map((day, dayIndex) => (
              <Grid
                item
                key={dayIndex}
                sx={{
                  flex: 1,
                  height: 60,
                  border: "1px solid #e0e0e0",
                  p: 1,
                  position: "relative",
                }}
              >
                {getConsultasForDay(day)
                  .filter((consulta) => {
                    const consultaHour = new Date(consulta.dataHora).getHours();
                    return consultaHour === hour;
                  })
                  .map((consulta) => (
                    <Box
                      key={consulta.id}
                      sx={{
                        backgroundColor: getStatusColor(consulta.status),
                        color: "white",
                        p: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        mb: 0.5,
                      }}
                      onClick={() => {
                        toast(
                          `Consulta com ${consulta.paciente?.usuario?.nome}`
                        );
                      }}
                    >
                      {consulta.paciente?.usuario?.nome}
                    </Box>
                  ))}
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const firstDay = monthDays[0];
    const lastDay = monthDays[monthDays.length - 1];
    const startPadding = firstDay.getDay();
    const endPadding = 6 - lastDay.getDay();

    return (
      <Box>
        <Grid container>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <Grid
              item
              key={day}
              sx={{
                flex: 1,
                p: 2,
                border: "1px solid #e0e0e0",
                textAlign: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container>
          {Array.from({ length: startPadding }).map((_, index) => (
            <Grid
              item
              key={`empty-start-${index}`}
              sx={{
                flex: 1,
                height: 100,
                border: "1px solid #e0e0e0",
                backgroundColor: "#f5f5f5",
              }}
            />
          ))}

          {monthDays.map((day, index) => (
            <Grid
              item
              key={index}
              sx={{
                flex: 1,
                height: 100,
                border: "1px solid #e0e0e0",
                p: 1,
                backgroundColor:
                  day.toDateString() === new Date().toDateString()
                    ? "#f5f5f5"
                    : "white",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {day.getDate()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getConsultasForDay(day)
                  .slice(0, 3)
                  .map((consulta) => (
                    <Box
                      key={consulta.id}
                      sx={{
                        backgroundColor: getStatusColor(consulta.status),
                        color: "white",
                        p: 0.25,
                        borderRadius: 0.5,
                        fontSize: "0.6rem",
                        mb: 0.25,
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        toast(
                          `Consulta com ${consulta.paciente?.usuario?.nome}`
                        );
                      }}
                    >
                      {consulta.paciente?.usuario?.nome}
                    </Box>
                  ))}
                {getConsultasForDay(day).length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{getConsultasForDay(day).length - 3} mais
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}

          {Array.from({ length: endPadding }).map((_, index) => (
            <Grid
              item
              key={`empty-end-${index}`}
              sx={{
                flex: 1,
                height: 100,
                border: "1px solid #e0e0e0",
                backgroundColor: "#f5f5f5",
              }}
            />
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Agenda</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={viewMode === "week" ? "contained" : "outlined"}
            onClick={() => setViewMode("week")}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "contained" : "outlined"}
            onClick={() => setViewMode("month")}
          >
            Mês
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              toast("Formulário de consulta será implementado");
            }}
          >
            Nova Consulta
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() =>
                viewMode === "week"
                  ? navigateWeek("prev")
                  : navigateMonth("prev")
              }
            >
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6">
              {currentDate.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
              {viewMode === "week" && (
                <>
                  {" - Semana "}
                  {Math.ceil(
                    (currentDate.getDate() -
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1
                      ).getDay()) /
                      7
                  )}
                </>
              )}
            </Typography>
            <IconButton
              onClick={() =>
                viewMode === "week"
                  ? navigateWeek("next")
                  : navigateMonth("next")
              }
            >
              <ChevronRight />
            </IconButton>
          </Box>
          <Button variant="outlined" startIcon={<Today />} onClick={goToToday}>
            Hoje
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>Carregando agenda...</Typography>
          </Box>
        ) : viewMode === "week" ? (
          renderWeekView()
        ) : (
          renderMonthView()
        )}
      </Paper>
    </Box>
  );
};
