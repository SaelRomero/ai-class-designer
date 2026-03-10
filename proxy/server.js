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
        
        const prompt = `Actúa como un profesor experto de la Nueva Escuela Mexicana y crea un plan de clase basado en proyectos.\nTema: ${topic}\nMateria/Disciplina: ${subject}\nGrado: ${gradeLevel}\nDuración: ${duration} minutos\nRequisitos extra: ${specialRequirements || 'Ninguno'}\n\nEs OBLIGATORIO:\n1. Incluir los 4 Campos Formativos de la NEM y explicar cómo se vinculan al proyecto.\n2. Seleccionar de 2 a 3 Ejes Articuladores de la NEM (Inclusión, Pensamiento Crítico, Interculturalidad Crítica, Igualdad de Género, Vida Saludable, Apropiación de las culturas a través de la lectura y la escritura, Artes y experiencias estéticas) que apliquen.\n\nDevuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta, sin texto adicional ni bloques de markdown:\n{\n  "titulo": "string",\n  "grado": "string",\n  "duracion": "string",\n  "materia": "string",\n  "tema": "string",\n  "camposFormativos": [ { "campo": "string", "vinculacion": "string" } ],\n  "ejesArticuladores": ["string"],\n  "objetivos": ["string"],\n  "materiales": ["string"],\n  "inicio": ["string"],\n  "desarrollo": [ { "titulo": "string", "descripcion": "string", "duracion": "string" } ],\n  "cierre": ["string"],\n  "evaluacion": ["string"],\n  "observaciones": "string"\n}`;

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
