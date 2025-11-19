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
import { Add, Search, Edit, Delete, Visibility } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { Fisioterapeuta } from "../types";
import toast from "react-hot-toast";

export const Fisioterapeutas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: fisioterapeutas, isLoading } = useQuery<Fisioterapeuta[]>(
    ["fisioterapeutas", searchTerm],
    async (): Promise<Fisioterapeuta[]> => {
      const response = await api.get("/api/fisioterapeutas", {
        params: { search: searchTerm },
      });
      return response.data as Fisioterapeuta[];
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await api.delete(`/api/fisioterapeutas/${id}`);
    },
    {
      onSuccess: () => {
        toast.success("Fisioterapeuta excluído com sucesso!");
        queryClient.invalidateQueries("fisioterapeutas");
      },
      onError: () => {
        toast.error("Erro ao excluir fisioterapeuta");
      },
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este fisioterapeuta?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "usuario",
      headerName: "Nome",
      flex: 1,
      renderCell: (params) => params.row.usuario?.nome || "-",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => params.row.usuario?.email || "-",
    },
    {
      field: "telefone",
      headerName: "Telefone",
      width: 130,
      renderCell: (params) => params.row.usuario?.telefone || "-",
    },
    {
      field: "crefito",
      headerName: "CREFITO",
      width: 100,
      renderCell: (params) => params.row.crefito || "-",
    },
    {
      field: "especialidade",
      headerName: "Especialidade",
      width: 150,
      renderCell: (params) => params.row.especialidade || "-",
    },
    {
      field: "ativo",
      headerName: "Status",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.row.ativo ? "Ativo" : "Inativo"}
          color={params.row.ativo ? "success" : "error"}
          size="small"
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
        <Typography variant="h4">Fisioterapeutas</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            toast("Formulário de fisioterapeuta será implementado");
          }}
        >
          Novo Fisioterapeuta
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar fisioterapeutas..."
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
                label="Todos"
                clickable
                color="primary"
                variant="outlined"
              />
              <Chip label="Ativos" clickable variant="outlined" />
              <Chip label="Inativos" clickable variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={fisioterapeutas || []}
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
