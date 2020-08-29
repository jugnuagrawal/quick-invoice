import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { DigitsPipe } from './digits.pipe';
import { ImportComponent } from './import/import.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { AppRoutingModule } from './app.routing.module';

@NgModule({
  declarations: [
    AppComponent,
    DigitsPipe,
    ImportComponent,
    InvoiceComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [DigitsPipe, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
