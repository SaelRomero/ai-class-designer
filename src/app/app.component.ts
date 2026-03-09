import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ai-class-designer';
  sanitizer = inject(DomSanitizer);

  // Signals for form
  subject = signal('');
  gradeLevel = signal('');
  topic = signal('');
  duration = signal('50');
  specialRequirements = signal('');

  // UI State
  isGenerating = signal(false);
  generatedLesson = signal<SafeHtml | string>('');

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
      const rawHtml = data.html || 'No se generó contenido.';
      this.generatedLesson.set(this.sanitizer.bypassSecurityTrustHtml(rawHtml));
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
      const opt = {
        margin:       10,
        filename:     `Planeacion_${this.topic() || 'Clase'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
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
