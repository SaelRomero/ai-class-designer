import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import html2pdf from 'html2pdf.js';


export interface LessonPlan {
  titulo: string;
  grado: string;
  duracion: string;
  materia: string;
  tema: string;
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
export class AppComponent {
  title = 'ai-class-designer';
  

  // Signals for form
  subject = signal('');
  gradeLevel = signal('');
  topic = signal('');
  duration = signal('50');
  specialRequirements = signal('');

  // UI State
  isGenerating = signal(false);
  generatedLesson = signal<LessonPlan | null>(null);

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
          specialRequirements: this.specialRequirements()
        })
      });

      if (!response.ok) throw new Error('Error en la red');
      
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
      parsedData.desarrollo = parsedData.desarrollo || [];
      parsedData.cierre = parsedData.cierre || [];
      parsedData.evaluacion = parsedData.evaluacion || [];
      
      this.generatedLesson.set(parsedData);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al generar la planeación. Revisa que el proxy y Ollama estén corriendo.');
    } finally {
      this.isGenerating.set(false);
    }
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
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf().set(opt as any).from(element).save();
    } catch(err) {
      console.error('Error al generar PDF', err);
      alert('Hubo un problema al generar el PDF.');
    }
  }
}
