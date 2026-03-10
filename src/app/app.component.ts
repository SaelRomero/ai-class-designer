import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import html2pdf from 'html2pdf.js';


export interface LessonPlan {
  id?: string;
  updatedAt?: number;
  titulo: string;
  grado: string;
  duracion: string;
  materia: string;
  tema: string;
  camposFormativos?: { campo: string, vinculacion: string }[];
  ejesArticuladores?: string[];
  objetivos: string[];
  materiales: string[];
  inicio: string[];
  desarrollo: { titulo: string; descripcion: string; duracion: string; }[];
  cierre: string[];
  evaluacion: string[];
  observaciones: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
// Autoguardado e Historial
  lessonHistory = signal<LessonPlan[]>([]);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    try {
      const savedHistory = localStorage.getItem('lessonHistory');
      if (savedHistory) {
        this.lessonHistory.set(JSON.parse(savedHistory));
      }
      const currentLesson = localStorage.getItem('currentLesson');
      if (currentLesson) {
        this.generatedLesson.set(JSON.parse(currentLesson));
      }
    } catch (e) {
      console.error('Error loading history', e);
    }
  }

  saveToHistory(lesson: LessonPlan) {
    lesson.id = lesson.id || Date.now().toString();
    lesson.updatedAt = Date.now();
    
    const currentHistory = this.lessonHistory();
    const index = currentHistory.findIndex(l => l.id === lesson.id);
    
    let newHistory;
    if (index !== -1) {
      newHistory = [...currentHistory];
      newHistory[index] = lesson;
    } else {
      newHistory = [lesson, ...currentHistory].slice(0, 15); // Keep last 15
    }
    
    this.lessonHistory.set(newHistory);
    localStorage.setItem('lessonHistory', JSON.stringify(newHistory));
    localStorage.setItem('currentLesson', JSON.stringify(lesson));
  }

  loadFromHistory(lesson: LessonPlan) {
    this.generatedLesson.set(lesson);
    localStorage.setItem('currentLesson', JSON.stringify(lesson));
  }

  clearCurrentLesson() {
    if (confirm('¿Estás seguro de que quieres crear una nueva planeación? Se mantendrá en tu historial.')) {
      this.generatedLesson.set(null);
      localStorage.removeItem('currentLesson');
    }
  }

  title = 'ai-class-designer';
  

  // Signals for form
  subject = signal('');
  gradeLevel = signal('');
  topic = signal('');
  duration = signal('50');
  specialRequirements = signal('');

  // NEM Options
  camposOptions = [
    'Lenguajes',
    'Saberes y Pensamiento Científico',
    'Ética, Naturaleza y Sociedades',
    'De lo Humano y lo Comunitario'
  ];

  ejesOptions = [
    'Inclusión',
    'Pensamiento Crítico',
    'Interculturalidad Crítica',
    'Igualdad de Género',
    'Vida Saludable',
    'Apropiación de las culturas a través de la lectura y la escritura',
    'Artes y experiencias estéticas'
  ];

  selectedCampos = signal<string[]>([]);
  selectedEjes = signal<string[]>([]);

  toggleSelection(list: ReturnType<typeof signal<string[]>>, item: string) {
    const current = list();
    if (current.includes(item)) {
      list.set(current.filter(i => i !== item));
    } else {
      list.set([...current, item]);
    }
  }


  // UI State
  isGenerating = signal(false);
  generatedLesson = signal<LessonPlan | null>(null);

  refinementPrompt = signal('');
  isRefining = signal(false);

  // Adaptaciones Inclusivas (Fase 2)
  quickAdaptations = [
    { id: 'tdah', label: 'TDAH', icon: '⚡', prompt: 'Modifica y adapta esta clase para alumnos con TDAH. Incluye periodos más cortos de atención, pausas activas, instrucciones paso a paso muy claras y material visual estimulante.' },
    { id: 'dislexia', label: 'Dislexia', icon: '📝', prompt: 'Modifica y adapta esta clase para alumnos con Dislexia. Reduce la carga de lectura pesada en voz alta, usa más apoyos visuales/auditivos y fomenta la evaluación oral o práctica.' },
    { id: 'tea', label: 'TEA', icon: '🧩', prompt: 'Modifica y adapta esta clase para alumnos con Trastorno del Espectro Autista (TEA). Crea una estructura predecible, transiciones claras, minimiza la sobrecarga sensorial e incluye apoyos visuales y concretos.' },
    { id: 'altas', label: 'Altas Capac.', icon: '🚀', prompt: 'Modifica y adapta esta clase para alumnos con Altas Capacidades. Incluye actividades de extensión, retos cognitivos más profundos, pensamiento crítico extra y fomenta la investigación autónoma.' }
  ];

  applyQuickAdaptation(adaptation: any) {
    if (!this.generatedLesson()) return;
    this.refinementPrompt.set(adaptation.prompt);
    this.refineLesson();
  }

  // Motor de Evaluación (Fase 3)
  generateRubric() {
    if (!this.generatedLesson()) return;
    this.refinementPrompt.set("Agrega al final del documento una Rúbrica de Evaluación detallada para esta clase. Usa estrictamente una tabla en formato Markdown con las columnas: Criterio, Excelente, Bueno, Suficiente y Requiere Mejora. No borres el contenido original de la clase, solo anexa la tabla al final.");
    this.refineLesson();
  }



  async refineLesson() {
    if (!this.refinementPrompt().trim() || !this.generatedLesson()) {
      return;
    }
    
    this.isRefining.set(true);

    try {
      const response = await fetch('/ai-class-designer-api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: this.generatedLesson(),
          prompt: this.refinementPrompt()
        })
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      const rawResponse = data.html || '';
      
      const startIndex = rawResponse.indexOf('{');
      const endIndex = rawResponse.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('El modelo no devolvió un JSON válido');
      }
      
      const jsonString = rawResponse.substring(startIndex, endIndex + 1);
      const parsedData = JSON.parse(jsonString) as LessonPlan;
      
      parsedData.objetivos = parsedData.objetivos || ['No se especificaron objetivos'];
      parsedData.materiales = parsedData.materiales || ['No se especificaron materiales'];
      parsedData.inicio = parsedData.inicio || [];
      
      if (Array.isArray(parsedData.desarrollo)) {
        parsedData.desarrollo = parsedData.desarrollo.map(item => {
          if (typeof item === 'string') {
            return { titulo: 'Actividad de desarrollo', descripcion: item, duracion: 'Tiempo estimado' };
          }
          return item;
        });
      } else {
        parsedData.desarrollo = [];
      }

      parsedData.cierre = parsedData.cierre || [];
      parsedData.evaluacion = parsedData.evaluacion || [];
      
      this.generatedLesson.set(parsedData);
      this.saveToHistory(parsedData);
      this.refinementPrompt.set('');
    } catch (error) {
      console.error(error);
      alert(`Hubo un error al refinar: ${error instanceof Error ? error.message : 'Desconocido'}.`);
    } finally {
      this.isRefining.set(false);
    }
  }

  async generateLesson() {
    if(!this.subject() || !this.topic() || !this.gradeLevel()) {
      alert("Por favor llena Materia, Grado y Tema Principal.");
      return;
    }
    
    this.isGenerating.set(true);

    try {
      const response = await fetch('/ai-class-designer-api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: this.subject(),
          gradeLevel: this.gradeLevel(),
          topic: this.topic(),
          duration: this.duration(),
          specialRequirements: this.specialRequirements(),
          campos: this.selectedCampos(),
          ejes: this.selectedEjes()
        })
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      const rawResponse = data.html || '';
      
      // Extracción matemática brutal del JSON (Lección de MEMORY.md)
      const startIndex = rawResponse.indexOf('{');
      const endIndex = rawResponse.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('El modelo no devolvió un JSON válido');
      }
      
      const jsonString = rawResponse.substring(startIndex, endIndex + 1);
      const parsedData = JSON.parse(jsonString) as LessonPlan;
      
      // Validación básica y fallbacks
      parsedData.objetivos = parsedData.objetivos || ['No se especificaron objetivos'];
      parsedData.materiales = parsedData.materiales || ['No se especificaron materiales'];
      parsedData.inicio = parsedData.inicio || [];
      
      // Mutación defensiva: interceptar textos crudos y envolverlos en el formato correcto
      if (Array.isArray(parsedData.desarrollo)) {
        parsedData.desarrollo = parsedData.desarrollo.map(item => {
          if (typeof item === 'string') {
            return { titulo: 'Actividad de desarrollo', descripcion: item, duracion: 'Tiempo estimado' };
          }
          return item;
        });
      } else {
        parsedData.desarrollo = [];
      }

      parsedData.cierre = parsedData.cierre || [];
      parsedData.evaluacion = parsedData.evaluacion || [];
      
      this.generatedLesson.set(parsedData);
      this.saveToHistory(parsedData);
    } catch (error) {
      console.error(error);
      alert(`Hubo un error: ${error instanceof Error ? error.message : 'Desconocido'}. Revisa la conexión o intenta de nuevo si fue un timeout por carga del modelo.`);
    } finally {
      this.isGenerating.set(false);
    }
  }

  
  downloadTxt() {
    const lesson = this.generatedLesson();
    if (!lesson) return;
    
    let txt = `====================================================\n`;
    txt += `PLANEACIÓN DE CLASE: ${lesson.titulo}\n`;
    txt += `====================================================\n\n`;
    txt += `▶ DATOS GENERALES\n`;
    txt += `- Grado: ${lesson.grado}\n`;
    txt += `- Materia: ${lesson.materia}\n`;
    txt += `- Tema: ${lesson.tema}\n`;
    txt += `- Duración: ${lesson.duracion}\n\n`;

    if (lesson.camposFormativos && lesson.camposFormativos.length > 0) {
      txt += `▶ CAMPOS FORMATIVOS (NEM)\n`;
      lesson.camposFormativos.forEach(c => txt += `- ${c.campo}: ${c.vinculacion}\n`);
      txt += `\n`;
    }

    if (lesson.ejesArticuladores && lesson.ejesArticuladores.length > 0) {
      txt += `▶ EJES ARTICULADORES\n`;
      lesson.ejesArticuladores.forEach(e => txt += `- ${e}\n`);
      txt += `\n`;
    }

    txt += `▶ OBJETIVOS\n`;
    lesson.objetivos.forEach(o => txt += `- ${o}\n`);
    txt += `\n`;

    txt += `▶ MATERIALES\n`;
    lesson.materiales.forEach(m => txt += `- ${m}\n`);
    txt += `\n`;

    txt += `====================================================\n`;
    txt += `DESARROLLO DE LA CLASE\n`;
    txt += `====================================================\n\n`;

    txt += `[INICIO]\n`;
    lesson.inicio.forEach(i => txt += `- ${i}\n`);
    txt += `\n`;

    txt += `[DESARROLLO]\n`;
    lesson.desarrollo.forEach(d => {
      txt += `* ${d.titulo} (${d.duracion})\n`;
      txt += `  ${d.descripcion}\n`;
    });
    txt += `\n`;

    txt += `[CIERRE]\n`;
    lesson.cierre.forEach(c => txt += `- ${c}\n`);
    txt += `\n`;

    txt += `====================================================\n`;
    txt += `EVALUACIÓN Y OBSERVACIONES\n`;
    txt += `====================================================\n\n`;

    txt += `▶ EVALUACIÓN\n`;
    lesson.evaluacion.forEach(e => txt += `- ${e}\n`);
    txt += `\n`;

    if (lesson.observaciones) {
      txt += `▶ OBSERVACIONES / RÚBRICA\n`;
      txt += `${lesson.observaciones}\n`;
    }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planeacion_${lesson.titulo || 'Clase'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async downloadPDF() {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    
    try {
      // FIX CORE: Esperar a que las fuentes web y de sistema estén 100% parseadas 
      // para que html2canvas pueda medir la línea base (baseline) real de la tipografía.
      await document.fonts.ready;

      const opt = {
        margin:       10,
        filename:     `Planeacion_${this.topic() || 'Clase'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, logging: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.keep-together', '.stage', 'header', 'h2', 'h3', 'li'] }
      };
      
      html2pdf().set(opt as any).from(element).save();
    } catch(err) {
      console.error('Error al generar PDF', err);
      alert('Hubo un problema al generar el PDF.');
    }
  }
}
