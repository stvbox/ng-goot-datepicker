import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from './datepicker/datepicker.component';

@NgModule({
  declarations: [DatepickerComponent],
  imports: [CommonModule, FormsModule],
  exports: [DatepickerComponent],
})
export class GootPickerModule { }
