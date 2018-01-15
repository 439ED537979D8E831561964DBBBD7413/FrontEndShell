/* Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Capture Studio Imports */
import { CaptureStudioRoutingModule, CaptureStudioRoutingComponents } from './capture-studio-routing.module';
import { CaptureStudioComponent } from './capture-studio.component';
import { SharedModule } from '../shared/shared.module';
import { LayoutModule } from '../layout/layout.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    CaptureStudioRoutingModule
  ],
  declarations: [CaptureStudioRoutingComponents]
})
export class CaptureStudioModule { }
