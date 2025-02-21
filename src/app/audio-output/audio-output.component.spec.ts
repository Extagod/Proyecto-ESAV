import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioOutputComponent } from './audio-output.component';

describe('AudioOutputComponent', () => {
  let component: AudioOutputComponent;
  let fixture: ComponentFixture<AudioOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioOutputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AudioOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
