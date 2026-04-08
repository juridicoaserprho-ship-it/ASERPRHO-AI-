import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROK_API_KEY = process.env.GROK_API_KEY;

// =======================
app.post("/generar-mensaje", async (req, res) => {
    const { deudor } = req.body;

    try {

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROK_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-2-latest", // 🔥 seguro
                messages: [
                    {
                        role: "system",
                        content: "Eres experto en cobro de cartera en Colombia. Responde corto y profesional."
                    },
                    {
                        role: "user",
                        content: `Unidad: ${deudor.unidad}, Deuda: ${deudor.deuda}, Estado: ${deudor.estado}. Genera mensaje de cobro corto para WhatsApp.`
                    }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();

        console.log("🔍 RESPUESTA GROK:", JSON.stringify(data, null, 2));

        // 🔥 VALIDACIÓN FUERTE
        if (!data || !data.choices || !data.choices[0]) {
            return res.json({
                mensaje: "⚠️ IA no respondió correctamente"
            });
        }

        const mensaje = data.choices[0].message.content;

        res.json({ mensaje });

    } catch (error) {
        console.error("❌ ERROR SERVIDOR:", error);

        res.json({
            mensaje: "⚠️ Error conectando IA"
        });
    }
});

// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 IA corriendo");
});
