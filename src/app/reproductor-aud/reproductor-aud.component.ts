import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-reproductor-aud',
  templateUrl: './reproductor-aud.component.html',
  styleUrls: ['./reproductor-aud.component.css']
})

export class ReproductorAudComponent implements AfterViewInit, OnDestroy {
  // Elementos del DOM
  @ViewChild('audio', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  // Variables de audio
  audioContext!: AudioContext;
  audioSource!: MediaElementAudioSourceNode;
  bandPassFilter!: BiquadFilterNode;
  highPassFilter!: BiquadFilterNode;
  lowPassFilters: BiquadFilterNode[] = [];
  gainNode!: GainNode;
  filterNodes: BiquadFilterNode[] = [];
  allFilters: BiquadFilterNode[] = [];

  activeSlider: string | null = null;  // Variable para controlar el slider habilitado
  bandPassDisabled: boolean = false;  // Controla si el filtro pasa banda está deshabilitado
  
  selectSlider(filterType: string) {
    this.activeSlider = filterType;
  
    // Desconectar todos los filtros antes de cambiar
    this.disconnectFilters();
  
    // Resetea los filtros no seleccionados
    this.resetInactiveFilters(filterType);
  
    // Forzar el reset inmediato de audio
    if (filterType === 'lowPass') {
      this.resetLowPass(); // Reset de pasa bajos
      this.connectLowPassFilters(); // Conectar pasa bajos
    } else if (filterType === 'highPass') {
      this.resetHighPass(); // Reset de pasa altos
      this.connectHighPassFilters(); // Conectar pasa altos
    } else if (filterType === 'bandPass') {
      this.connectBandPassFilter(); // Conectar pasa banda
    }
  }
  
  // Resetea los filtros no seleccionados
  resetInactiveFilters(filterType: string) {
    // Si el filtro seleccionado no es pasa bajos, resetea pasa bajos
    if (filterType !== 'lowPass') {
      this.resetLowPass();
    }
  
    // Si el filtro seleccionado no es pasa altos, resetea pasa altos
    if (filterType !== 'highPass') {
      this.resetHighPass();
    }
  }
  
  // Resetear filtro pasa bajos a 0 dB
  resetLowPass() {
    this.equalizerBands.forEach(band => {
      band.value = 0;  // Reiniciar valor a 0 dB visualmente
  
      // Resetear la ganancia en audio a 0 dB
      const filter = this.filterNodes[this.equalizerBands.indexOf(band)];
      if (filter && filter.gain) {
        filter.gain.setValueAtTime(0, this.audioContext.currentTime);  // Resetear ganancia
      }
    });
  
    // Asegurarse de que el filtro pasa bajos esté completamente desconectado
    this.filterNodes.forEach(filter => filter.disconnect());
  }
  
  // Resetear filtro pasa altos a 0 dB
  resetHighPass() {
    this.equalizerBands2.forEach(band => {
      band.value = 0;  // Reiniciar valor a 0 dB visualmente
  
      // Resetear la ganancia en audio a 0 dB
      const filter = this.filterNodes[this.equalizerBands.length + this.equalizerBands2.indexOf(band)];
      if (filter && filter.gain) {
        filter.gain.setValueAtTime(0, this.audioContext.currentTime);  // Resetear ganancia
      }
    });
  
    // Asegurarse de que el filtro pasa altos esté completamente desconectado
    this.filterNodes.forEach(filter => filter.disconnect());
  }
  
  // Desconectar todos los filtros
  disconnectFilters() {
    this.filterNodes.forEach(filter => filter.disconnect());
    this.bandPassFilter.disconnect();
  }
  
  // Conectar el filtro pasa bajos
  connectLowPassFilters() {
    this.audioSource.connect(this.filterNodes[0]);
    for (let i = 0; i < this.filterNodes.length - 1; i++) {
      this.filterNodes[i].connect(this.filterNodes[i + 1]);
    }
    this.filterNodes[this.filterNodes.length - 1].connect(this.audioContext.destination);
  }
  
  // Conectar el filtro pasa altos
  connectHighPassFilters() {
    this.audioSource.connect(this.filterNodes[0]);
    for (let i = 0; i < this.filterNodes.length - 1; i++) {
      this.filterNodes[i].connect(this.filterNodes[i + 1]);
    }
    this.filterNodes[this.filterNodes.length - 1].connect(this.audioContext.destination);
  }
  
  // Conectar el filtro pasa banda
  connectBandPassFilter() {
    this.audioSource.connect(this.bandPassFilter);
    this.bandPassFilter.connect(this.audioContext.destination);
  }
  

  // Lista de audios
  audioList = [
    { name: 'Audio 1', src: 'assets/audio/audio_5.mp3' },
    { name: 'Audio 2', src: 'assets/audio/audio_2.mp3' },
    { name: 'Audio 3', src: 'assets/audio/audio_3.mp4' },
    { name: 'Audio 4', src: 'assets/audio/audio_4.mp3' }
  ];

  // Audio seleccionado
  selectedAudio: string = this.audioList[0].src;

  // Equalizador: bandas de frecuencias
  equalizerBands = [
    { label: '100 Hz', min: -160, max: 0, step: 1, value: 0, frequency: 100 },
    { label: '250 Hz', min: -160, max: 0, step: 1, value: 0, frequency: 250 },
    { label: '500 Hz', min: -160, max: 0, step: 1, value: 0, frequency: 500 },
    { label: '1 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 1000 },
    { label: '2 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 2000 },
  ];

  equalizerBands2 = [
    { label: '2 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 2000 },
    { label: '4 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 4000 },
    { label: '8 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 8000 },
    { label: '16 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 16000 },
    { label: '20 kHz', min: -160, max: 0, step: 1, value: 0, frequency: 20000 }
  ];


  // Métodos del ciclo de vida del componente
  ngAfterViewInit() {
    this.initAudioContext();
    this.loadAudio(this.selectedAudio);
    this.requestAudioPermissions();
  }

  ngOnDestroy() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

    // Dispositivos de audio
    audioDevices: MediaDeviceInfo[] = [];
    selectedAudioDeviceId: string = '';
  
    // Banda pasa de audio
    equalizerBandPass = {
      label: 'Pasa Banda',
      minFreq: 20,
      maxFreq: 20000,
      stepFreq: 1,
      valueFreq: 1000,  // Frecuencia inicial
      bandWidth: 200   // Ancho de banda inicial
    };

  // Inicialización del contexto de audio
  initAudioContext() {
    this.audioContext = new AudioContext();
    const audio = this.audioElement.nativeElement;
    this.audioSource = this.audioContext.createMediaElementSource(audio);
  
    // Filtros pasa bajos y altos
    this.filterNodes = this.equalizerBands.map(band => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(band.frequency, this.audioContext.currentTime);
      filter.gain.setValueAtTime(band.value, this.audioContext.currentTime);
      return filter;
    });
  
    // Conectar los nodos de filtro del ecualizador en cadena
    this.audioSource.connect(this.filterNodes[0]);
    for (let i = 0; i < this.filterNodes.length - 1; i++) {
      this.filterNodes[i].connect(this.filterNodes[i + 1]);
    }
  
    // Filtro de paso de banda
    this.bandPassFilter = this.audioContext.createBiquadFilter();
    this.bandPassFilter.type = 'bandpass';
    this.bandPassFilter.frequency.value = this.equalizerBandPass.valueFreq;
    this.bandPassFilter.Q.value = this.calculateQ(this.equalizerBandPass.bandWidth);
  
    // Conectar el último nodo del ecualizador al filtro de paso de banda
    this.filterNodes[this.filterNodes.length - 1].connect(this.bandPassFilter);
  
    // Conectar el filtro de paso de banda al destino de audio
    this.bandPassFilter.connect(this.audioContext.destination);
  }
  

  // Métodos para seleccionar y cambiar audios
  onAudioSelect(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.selectAudio(selectedValue);
    }
  }

  selectAudio(audioSrc: string) {
    this.selectedAudio = audioSrc;
    this.loadAudio(this.selectedAudio);
  }

  loadAudio(src: string) {
    const audio = this.audioElement.nativeElement;
    audio.src = src;
    audio.load();
  }

  // Control de la reproducción
  play() {
    const audio = this.audioElement.nativeElement;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => audio.play());
    } else {
      audio.play();
    }
  }

  // Métodos para gestionar el filtro pasa banda
  updateBandPass(event: Event) {
    const input = event.target as HTMLInputElement;
    this.equalizerBandPass.valueFreq = parseFloat(input.value);
    this.bandPassFilter.frequency.setValueAtTime(this.equalizerBandPass.valueFreq, this.audioContext.currentTime);
  }

  updateBandPassWidth(event: Event) {
    const input = event.target as HTMLInputElement;
    this.equalizerBandPass.bandWidth = parseFloat(input.value);
    this.bandPassFilter.Q.setValueAtTime(this.calculateQ(this.equalizerBandPass.bandWidth), this.audioContext.currentTime);
  }

  calculateQ(bandWidth: number): number {
    return this.equalizerBandPass.valueFreq / bandWidth;
  }

  // Métodos para permisos de audio y selección de dispositivos
  async requestAudioPermissions() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.getAudioDevices();
    } catch (error) {
      console.error('Permisos de audio denegados o error al solicitar permisos:', error);
    }
  }

  async getAudioDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.audioDevices = devices.filter(device => device.kind === 'audiooutput');
  }

  getDeviceLabel(device: MediaDeviceInfo): string {
    return device.label || 'Dispositivo de audio desconocido';
  }

  async changeAudioOutputDevice(deviceId: string) {
    const audioElement = this.audioElement.nativeElement;
    if ('setSinkId' in audioElement) {
      try {
        await audioElement.setSinkId(deviceId);
        console.log(`Salida de audio cambiada al dispositivo con ID: ${deviceId}`);
      } catch (error) {
        console.error('Error al cambiar la salida de audio:', error);
      }
    } else {
      console.warn('El navegador no soporta la función de cambiar la salida de audio.');
    }
  }

  onAudioDeviceChange(event: Event) {
    const deviceId = (event.target as HTMLSelectElement).value;
    this.selectedAudioDeviceId = deviceId;
    this.changeAudioOutputDevice(deviceId);
  }

  // Método para el selector de archivos
  openFileSelector() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedAudio = URL.createObjectURL(file);
      this.loadAudio(this.selectedAudio);
    }
  }

  // Métodos para actualizar las bandas del ecualizador
  updateBand(band: any, event: Event, bandsArray: any[]) {
    const input = event.target as HTMLInputElement;
    band.value = parseFloat(input.value);

    const index = bandsArray.indexOf(band);
    const filter = this.filterNodes[index];

    if (filter && filter.gain) {
      filter.gain.setValueAtTime(band.value, this.audioContext.currentTime);
    } else {
      console.error('Filter or filter.gain is not defined.');
    }
  }
}