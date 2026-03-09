import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  generatedLesson = signal('');

  async generateLesson() {
    if(!this.subject() || !this.topic() || !this.gradeLevel()) {
      alert("Por favor llena Materia, Grado y Tema Principal.");
      return;
    }
    
    this.isGenerating.set(true);

    try {
      const response = await fetch('/api/generate', {
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
      this.generatedLesson.set(data.html || 'No se generó contenido.');
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
      // Configuramos html2canvas para que capture bien el estilo
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Planeacion_${this.topic() || 'Clase'}.pdf`);
    } catch(err) {
      console.error('Error al generar PDF', err);
      alert('Hubo un problema al generar el PDF.');
    }
  }
}
