import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { DigitsPipe } from './digits.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DigitsPipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [DigitsPipe, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
