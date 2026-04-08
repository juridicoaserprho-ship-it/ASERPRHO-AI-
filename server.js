import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// =======================
app.post("/generar-mensaje", async (req, res) => {
    const { deudor } = req.body;

    const prompt = `
Redacta un mensaje de cobro para WhatsApp en Colombia.

Somos ASERPRHO S.A.S., empresa encargada del cobro de cartera.

Datos:
Conjunto: ${deudor.conjunto}
Unidad: ${deudor.unidad}
Propietario: ${deudor.propietario}
Deuda: $${deudor.deuda}

Condiciones:
- Tono humano, respetuoso pero firme
- Máximo 4 líneas
- Incluir invitación a pago o acuerdo
`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Experto en cobro jurídico en Colombia." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();

        const mensaje = data?.choices?.[0]?.message?.content || "Error IA";

        res.json({ mensaje });

    } catch {
        res.json({ mensaje: "Error IA" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 IA corriendo");
});
