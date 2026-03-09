import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: this.subject(),
          gradeLevel: this.gradeLevel(),
          topic: this.topic(),
          duration: this.duration(),
          specialRequirements: this.specialRequirements()
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor proxy');
      }

      const data = await response.json();
      this.generatedLesson.set(data.html);
    } catch (error) {
      console.error('Error generando la planeación:', error);
      this.generatedLesson.set('<p class="text-red-500">Ocurrió un error al contactar al servidor o a la IA. Revisa la consola para más detalles.</p>');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
