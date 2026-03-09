const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    try {
        const { subject, gradeLevel, topic, duration, specialRequirements } = req.body;
        
        const prompt = `Actúa como un profesor experto y crea un plan de clase estructurado usando HTML. 
Tema: ${topic}
Materia: ${subject}
Grado: ${gradeLevel}
Duración: ${duration} minutos
Requisitos extra: ${specialRequirements || 'Ninguno'}

Devuelve SOLO código HTML válido (sin markdown \`\`\`), usando etiquetas semánticas como <h1>, <h2>, <p>, <ul>. No incluyas explicaciones previas.`;

        const response = await axios.post('http://host.docker.internal:11434/api/generate', {
            model: 'llama3:8b',
            prompt: prompt,
            stream: false
        });

        res.json({ html: response.data.response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error comunicando con Ollama' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy corriendo en el puerto ${PORT}`);
});
