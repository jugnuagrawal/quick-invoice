import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportComponent } from './import/import.component';
import { InvoiceComponent } from './invoice/invoice.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'import' },
    { path: 'import', component: ImportComponent },
    { path: 'invoice', component: InvoiceComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: true
        })
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
