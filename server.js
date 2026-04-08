import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 NUNCA pongas la key aquí directamente
const GROK_API_KEY = process.env.GROK_API_KEY;

app.post("/generar-mensaje", async (req, res) => {
    const { deudor } = req.body;

    const prompt = `
Genera mensaje de cobro:

Unidad: ${deudor.unidad}
Deuda: $${deudor.deuda}
Estado: ${deudor.estado}

- Máximo 4 líneas
- Profesional
- Persuasivo
`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROK_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-2-mini",
                messages: [
                    { role: "system", content: "Experto en cobro de cartera." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();

        res.json({
            mensaje: data.choices?.[0]?.message?.content || "Error IA"
        });

    } catch (err) {
        res.status(500).json({ error: "Error IA" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 IA corriendo");
});