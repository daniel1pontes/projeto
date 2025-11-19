import React from "react";
import { Box, Typography, Paper, Button, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import { useQuery } from "react-query";
import { api } from "../services/api";
import { Recepcionista } from "../types";

export const Recepcionistas: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: recepcionistas, isLoading } = useQuery<Recepcionista[]>(
    ["recepcionistas", searchTerm],
    async (): Promise<Recepcionista[]> => {
      const response = await api.get("/api/recepcionistas", {
        params: { search: searchTerm },
      });
      return response.data as Recepcionista[];
    }
  );

  const columns: GridColDef[] = [
    { field: "nome", headerName: "Nome", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "telefone", headerName: "Telefone", flex: 1 },
    { field: "createdAt", headerName: "Data de Cadastro", flex: 1 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Recepcionistas</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Novo Recepcionista
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar recepcionista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={recepcionistas || []}
          columns={columns}
          loading={isLoading}
          paginationModel={{ page: 0, pageSize: 10 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Paper>
    </Box>
  );
};
