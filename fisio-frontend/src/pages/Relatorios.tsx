import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Download, FileDownload } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useMutation } from "react-query";
import { relatorioService, RelatorioParams } from "../services";
import toast from "react-hot-toast";

export const Relatorios: React.FC = () => {
  const [relatorioType, setRelatorioType] = React.useState<string>("pacientes");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const generateMutation = useMutation(
    async (params: RelatorioParams) => {
      const blob = await relatorioService.generateReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${relatorioType}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    {
      onSuccess: () => {
        toast.success("Relatório gerado com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao gerar relatório");
      },
    }
  );

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      toast.error("Selecione as datas");
      return;
    }

    const params: RelatorioParams = {
      type: relatorioType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format: "pdf",
    };

    generateMutation.mutate(params);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Relatórios
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={relatorioType}
                  label="Tipo de Relatório"
                  onChange={(e) => setRelatorioType(e.target.value)}
                >
                  <MenuItem value="pacientes">Pacientes</MenuItem>
                  <MenuItem value="consultas">Consultas</MenuItem>
                  <MenuItem value="faturamento">Faturamento</MenuItem>
                  <MenuItem value="estatisticas">Estatísticas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Data Inicial"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Data Final"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Download />}
                onClick={handleGenerate}
                disabled={generateMutation.isLoading}
                sx={{ height: 56 }}
              >
                Gerar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Relatórios Rápidos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => {
                  toast.loading("Gerando relatório de pacientes...");
                  relatorioService
                    .getRelatorioPacientes({
                      type: "pacientes",
                      startDate: new Date().toISOString(),
                      endDate: new Date().toISOString(),
                      format: "csv",
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `pacientes-${
                        new Date().toISOString().split("T")[0]
                      }.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    });
                }}
              >
                Pacientes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => {
                  toast.loading("Gerando relatório de consultas...");
                  relatorioService
                    .getRelatorioConsultas({
                      type: "consultas",
                      startDate: new Date().toISOString(),
                      endDate: new Date().toISOString(),
                      format: "csv",
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `consultas-${
                        new Date().toISOString().split("T")[0]
                      }.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    });
                }}
              >
                Consultas
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => {
                  toast.loading("Gerando relatório de faturamento...");
                  relatorioService
                    .getRelatorioFaturamento({
                      type: "faturamento",
                      startDate: new Date().toISOString(),
                      endDate: new Date().toISOString(),
                      format: "csv",
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `faturamento-${
                        new Date().toISOString().split("T")[0]
                      }.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    });
                }}
              >
                Faturamento
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => {
                  toast.loading("Gerando relatório de estatísticas...");
                  relatorioService
                    .getRelatorioEstatisticas({
                      type: "estatisticas",
                      startDate: new Date().toISOString(),
                      endDate: new Date().toISOString(),
                      format: "csv",
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `estatisticas-${
                        new Date().toISOString().split("T")[0]
                      }.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    });
                }}
              >
                Estatísticas
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};
