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

  generateLesson() {
    if(!this.subject() || !this.topic() || !this.gradeLevel()) {
      alert("Por favor llena Materia, Grado y Tema Principal.");
      return;
    }
    
    this.isGenerating.set(true);

    // Simulated Ollama Response (Fase 1 Placeholder)
    setTimeout(() => {
      const mockHTML = `
        <h1 class="text-3xl font-bold mb-4 border-b pb-2">Plan de Clase: ${this.topic()}</h1>
        <div class="mb-4 text-gray-700">
          <p><strong>Materia:</strong> ${this.subject()}</p>
          <p><strong>Grado:</strong> ${this.gradeLevel()}</p>
          <p><strong>Duración:</strong> ${this.duration()} minutos</p>
          <p><strong>Requisitos Extra:</strong> ${this.specialRequirements() || 'Ninguno'}</p>
        </div>
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-blue-600">🎯 Objetivo</h2>
        <p class="mb-4 text-gray-800">El alumno comprenderá los conceptos básicos de ${this.topic()} al final de la sesión.</p>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-blue-600">🚀 Apertura (10 min)</h2>
        <p class="mb-4 text-gray-800">Pregunta detonadora para atrapar la atención. Actividad breve de diagnóstico.</p>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-blue-600">📖 Desarrollo (30 min)</h2>
        <p class="mb-4 text-gray-800">Explicación magistral del tema seguida de ejercicios prácticos en parejas.</p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-blue-600">✅ Cierre (10 min)</h2>
        <p class="mb-4 text-gray-800">Revisión de respuestas, dudas finales y ticket de salida (una pregunta en papelito).</p>
      `;
      this.generatedLesson.set(mockHTML);
      this.isGenerating.set(false);
    }, 1500);
  }
}
