import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { prisma } from "./database/prisma";
import { errorHandler } from "./middlewares/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import pacienteRoutes from "./routes/pacienteRoutes";
import fisioterapeutaRoutes from "./routes/fisioterapeutaRoutes";
import recepcionistaRoutes from "./routes/recepcionistaRoutes";
import consultaRoutes from "./routes/consultaRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fisio API",
      version: "1.0.0",
      description: "API do sistema de gestão de fisioterapia",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined")); // HTTP request logger
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Fisio API Documentation",
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/fisioterapeutas", fisioterapeutaRoutes);
app.use("/api/recepcionistas", recepcionistaRoutes);
app.use("/api/consultas", consultaRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Bem-vindo à API do Sistema de Gestão de Fisioterapia",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close database connection
    await prisma.$disconnect();
    console.log("Database connection closed.");

    // Close server
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle process signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
