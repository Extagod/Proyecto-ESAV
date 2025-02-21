import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReproductorAudComponent } from './reproductor-aud/reproductor-aud.component';
import { AudioOutputComponent } from './audio-output/audio-output.component';

@NgModule({
  declarations: [
    AppComponent,
    ReproductorAudComponent,
    AudioOutputComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
