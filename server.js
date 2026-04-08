import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 API KEY DESDE RENDER
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// =======================
// ENDPOINT IA (GROQ)
// =======================
app.post("/generar-mensaje", async (req, res) => {
    const { deudor } = req.body;

    const prompt = `
Genera mensaje de cobro para WhatsApp:

Unidad: ${deudor.unidad}
Deuda: $${deudor.deuda}
Estado: ${deudor.estado}

Condiciones:
- Máximo 4 líneas
- Profesional
- Persuasivo
- Enfocado en pago
`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // 🔥 TU MODELO
                messages: [
                    {
                        role: "system",
                        content: "Eres experto en cobro de cartera en Colombia. Responde corto y profesional."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();

        console.log("🔥 RESPUESTA GROQ:", JSON.stringify(data, null, 2));

        // VALIDACIÓN
        if (!data || !data.choices || !data.choices[0]) {
            return res.json({
                mensaje: "⚠️ IA no respondió correctamente"
            });
        }

        const mensaje = data.choices[0].message.content;

        res.json({ mensaje });

    } catch (error) {
        console.error("❌ ERROR IA:", error);

        res.json({
            mensaje: "⚠️ Error conectando IA"
        });
    }
});

// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 IA GROQ corriendo");
});
