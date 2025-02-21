import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';

@Component({
  selector: 'app-audio-output',
  templateUrl: './audio-output.component.html',
  styleUrls: ['./audio-output.component.css']
})
export class AudioOutputComponent {
  audioList = [
    { name: 'Sonido 1', src: 'path/to/audio1.mp3' },
    { name: 'Sonido 2', src: 'path/to/audio2.mp3' },
    { name: 'Sonido 3', src: 'path/to/audio3.mp3' },
    // Añadir más sonidos según sea necesario
  ];

  audioContext: AudioContext | undefined;
  
  // Obtener todas las referencias a los reproductores de audio
  @ViewChildren('audioPlayer') audioPlayers!: QueryList<ElementRef>;

  constructor() {}

  // Función para inicializar el AudioContext y reproducir el audio
  initAudioAndPlay(index: number) {
    // Inicializar el AudioContext si no está ya inicializado
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext iniciado');
    }

    // Obtener el reproductor de audio correspondiente al índice
    const audioPlayer = this.audioPlayers.toArray()[index].nativeElement;

    // Reproducir el audio
    audioPlayer.play().then(() => {
      console.log('Reproducción de audio iniciada para:', audioPlayer);
    }).catch((error: any) => {
      console.error('Error al reproducir el audio:', error);
    });
  }
}
