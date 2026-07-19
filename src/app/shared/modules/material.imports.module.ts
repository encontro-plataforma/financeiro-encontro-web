import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

registerLocaleData(localePtBr);

// ─── MaterialGlobalModule ─────────────────────────────────────────────────────
// Todos os componentes Angular Material. Use como import geral nos componentes.
// Nota: não inclui date adapter — use MaterialDatepickerModule para isso.

const MATERIAL_MODULES = [
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
];

@NgModule({ imports: MATERIAL_MODULES, exports: MATERIAL_MODULES })
export class MaterialGlobalModule {}

// ─── MaterialFormsModule ──────────────────────────────────────────────────────
// Angular forms + campos de formulário Material.

const FORM_MODULES = [
  FormsModule,
  ReactiveFormsModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule,
];

@NgModule({ imports: FORM_MODULES, exports: FORM_MODULES })
export class MaterialFormsModule {}

// ─── MaterialListModule ───────────────────────────────────────────────────────
// Tabelas, paginação, ordenação, chips e badges.

const LIST_MODULES = [
  MatBadgeModule,
  MatChipsModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule,
];

@NgModule({ imports: LIST_MODULES, exports: LIST_MODULES })
export class MaterialListModule {}

// ─── MaterialDatepickerModule ─────────────────────────────────────────────────
// Datepicker com Moment.js e locale pt-BR (formato DD/MM/YYYY).

export const PT_BR_DATE_FORMATS = {
  parse:   { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput:          'DD/MM/YYYY',
    monthYearLabel:     'MMM/YYYY',
    dateA11yLabel:      'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const DATEPICKER_MODULES = [MatDatepickerModule, MatMomentDateModule];

@NgModule({
  imports:   DATEPICKER_MODULES,
  exports:   DATEPICKER_MODULES,
  providers: [
    { provide: LOCALE_ID,        useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE,  useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS },
  ],
})
export class MaterialDatepickerModule {}
