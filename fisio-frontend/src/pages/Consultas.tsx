import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  EventAvailable,
  EventBusy,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { Consulta } from "../types";
import toast from "react-hot-toast";

export const Consultas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: consultas, isLoading } = useQuery<Consulta[]>(
    ["consultas", searchTerm],
    async (): Promise<Consulta[]> => {
      const response = await api.get("/api/consultas", {
        params: { search: searchTerm },
      });
      return response.data as Consulta[];
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await api.delete(`/api/consultas/${id}`);
    },
    {
      onSuccess: () => {
        toast.success("Consulta excluída com sucesso!");
        queryClient.invalidateQueries("consultas");
      },
      onError: () => {
        toast.error("Erro ao excluir consulta");
      },
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta consulta?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return "primary";
      case "EM_ANDAMENTO":
        return "warning";
      case "CONCLUIDA":
        return "success";
      case "CANCELADA":
        return "error";
      case "NAO_COMPARECEU":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return <CalendarToday />;
      case "EM_ANDAMENTO":
        return <EventAvailable />;
      case "CONCLUIDA":
        return <EventAvailable />;
      case "CANCELADA":
        return <EventBusy />;
      case "NAO_COMPARECEU":
        return <EventBusy />;
      default:
        return <CalendarToday />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "paciente",
      headerName: "Paciente",
      flex: 1,
      renderCell: (params) => params.row.paciente?.usuario?.nome || "-",
    },
    {
      field: "fisioterapeuta",
      headerName: "Fisioterapeuta",
      flex: 1,
      renderCell: (params) => params.row.fisioterapeuta?.usuario?.nome || "-",
    },
    {
      field: "dataHora",
      headerName: "Data/Hora",
      width: 150,
      renderCell: (params) => {
        if (!params.row.dataHora) return "-";
        return new Date(params.row.dataHora).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "duracao",
      headerName: "Duração",
      width: 80,
      renderCell: (params) => `${params.row.duracao || 0}min`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.status?.replace("_", " ") || "-"}
          color={getStatusColor(params.row.status) as any}
          size="small"
          icon={getStatusIcon(params.row.status)}
        />
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton size="small" color="primary">
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" color="primary">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Consultas</Typography>
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar consultas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label="Todas"
                clickable
                color="primary"
                variant="outlined"
              />
              <Chip label="Agendadas" clickable variant="outlined" />
              <Chip label="Em Andamento" clickable variant="outlined" />
              <Chip label="Concluídas" clickable variant="outlined" />
              <Chip label="Canceladas" clickable variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={consultas || []}
          columns={columns}
          loading={isLoading}
          paginationModel={{ page: 0, pageSize: 10 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fafafa",
              borderBottom: "2px solid #e0e0e0",
            },
          }}
        />
      </Paper>
    </Box>
  );
};
