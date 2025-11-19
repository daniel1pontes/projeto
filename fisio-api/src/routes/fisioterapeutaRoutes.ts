import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/fisioterapeutas:
 *   get:
 *     summary: Listar todos os fisioterapeutas
 *     tags: [Fisioterapeutas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fisioterapeutas
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
 * /api/fisioterapeutas/{id}:
 *   get:
 *     summary: Obter fisioterapeuta por ID
 *     tags: [Fisioterapeutas]
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
 *         description: Dados do fisioterapeuta
 *       404:
 *         description: Fisioterapeuta não encontrado
 */
router.get("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/fisioterapeutas/{id}:
 *   put:
 *     summary: Atualizar fisioterapeuta
 *     tags: [Fisioterapeutas]
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
 *               crefito:
 *                 type: string
 *               especialidade:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Fisioterapeuta atualizado
 *       404:
 *         description: Fisioterapeuta não encontrado
 */
router.put("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

/**
 * @swagger
 * /api/fisioterapeutas/{id}:
 *   delete:
 *     summary: Excluir fisioterapeuta
 *     tags: [Fisioterapeutas]
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
 *         description: Fisioterapeuta excluído
 *       404:
 *         description: Fisioterapeuta não encontrado
 */
router.delete("/:id", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint não implementado ainda",
  });
});

export default router;
