import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/recepcionistas:
 *   get:
 *     summary: Listar todos os recepcionistas
 *     tags: [Recepcionistas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recepcionistas
 *       401:
 *         description: Não autorizado
 */
router.get("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/recepcionistas/{id}:
 *   get:
 *     summary: Obter recepcionista por ID
 *     tags: [Recepcionistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do recepcionista
 *       404:
 *         description: Recepcionista não encontrado
 */
router.get("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/recepcionistas/{id}:
 *   put:
 *     summary: Atualizar recepcionista
 *     tags: [Recepcionistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recepcionista atualizado
 *       404:
 *         description: Recepcionista não encontrado
 */
router.put("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/recepcionistas/{id}:
 *   delete:
 *     summary: Excluir recepcionista
 *     tags: [Recepcionistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Recepcionista excluído
 *       404:
 *         description: Recepcionista não encontrado
 */
router.delete("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

export default router;
