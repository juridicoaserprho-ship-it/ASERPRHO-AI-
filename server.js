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
Eres ASERPRHO S.A.S., empresa encargada del cobro de cartera en Colombia.

Datos:
Nombre: ${deudor.nombre}
Conjunto: ${deudor.conjunto}
Unidad: ${deudor.unidad}
Deuda: ${deudor.deuda}
Estado: ${deudor.estado}

INSTRUCCIONES SEGÚN ESTADO:

- GESTION:
Mensaje amable recordando la deuda.

- ACUERDO:
Mensaje conciliador recordando cumplimiento del acuerdo.

- ACUERDO_INCUMPLIDO:
Mensaje firme indicando incumplimiento y urgencia de pago.

- DEMANDADO:
Mensaje jurídico fuerte, advirtiendo proceso legal.

- DEMANDADO_GESTION:
Mensaje firme pero dando última oportunidad de pago.

CONDICIONES:
- Máximo 4 líneas
- Profesional
- Persuasivo
- Enfocado en pago inmediato
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
