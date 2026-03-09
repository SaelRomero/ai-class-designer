const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Aumentar tiempo limite a 5 minutos
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    try {
        const { subject, gradeLevel, topic, duration, specialRequirements } = req.body;
        
        const prompt = `Actúa como un profesor experto y crea un plan de clase estructurado EXACTAMENTE con el siguiente formato HTML.\nTema: ${topic}\nMateria: ${subject}\nGrado: ${gradeLevel}\nDuración: ${duration} minutos\nRequisitos extra: ${specialRequirements || 'Ninguno'}\n\nDevuelve SOLO código HTML válido (sin markdown \`\`\`).\nObligatorio:\n1. Un <header> con el título principal <h1> y los datos generales (Materia, Grado, Duración) en etiquetas <p> o <span>.\n2. Usa <section> para cada bloque importante: <section class="card"> para Objetivos, <section class="card"> para Materiales, <section class="card"> para Desarrollo y <section class="card"> para Evaluación/Notas.\n3. Dentro de Desarrollo, separa las etapas (Inicio, Desarrollo, Cierre) usando <article class="stage">.\n4. Usa <h2> para los títulos de cada sección y <h3> para las etapas de desarrollo.\n5. Usa listas <ul> y <li> para los objetivos y materiales.`;

        const response = await axios.post('http://host.docker.internal:11434/api/generate', {
            model: 'minimax-m2.5:cloud',
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
