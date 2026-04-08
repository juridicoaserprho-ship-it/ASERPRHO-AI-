import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// =======================
// ENDPOINT IA
// =======================
app.post("/generar-mensaje", async (req, res) => {
    const { deudor } = req.body;

    if (!deudor) {
        return res.json({ mensaje: "⚠️ No se recibió información del deudor" });
    }

    // 🔥 PROMPT AQUÍ (DENTRO DEL ENDPOINT)
    const prompt = `
Eres ${deudor.asesor}, asesor de cartera de ASERPRHO S.A.S.

Tu estilo:
- Tono: ${deudor.tono}
- Forma de escribir: ${deudor.estilo}

DATOS:
Nombre: ${deudor.nombre}
Conjunto: ${deudor.conjunto}
Unidad: ${deudor.unidad}
Deuda: ${deudor.deuda}
Estado: ${deudor.estado}

INSTRUCCIONES:

- GESTION: mensaje amable
- ACUERDO: mensaje conciliador
- ACUERDO_INCUMPLIDO: mensaje firme
- DEMANDADO: mensaje jurídico
- DEMANDADO_GESTION: mensaje previo a legal

REGLAS:
- Máximo 4 líneas
- Profesional
- Incluir nombre, conjunto, unidad y deuda
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
                    {
                        role: "system",
                        content: "Eres experto en cobro de cartera en Colombia."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.4
            })
        });

        const data = await response.json();

        if (!data?.choices?.[0]?.message?.content) {
            return res.json({ mensaje: "⚠️ IA no respondió correctamente" });
        }

        res.json({
            mensaje: data.choices[0].message.content
        });

    } catch (error) {
        console.error("❌ ERROR IA:", error);

        res.json({
            mensaje: "⚠️ Error conectando IA"
        });
    }
});

// =======================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🔥 IA GROQ corriendo en puerto", PORT);
});
