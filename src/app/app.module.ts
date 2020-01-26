import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DpPgComponent } from './dp-pg/dp-pg.component';
import { GootPickerModule } from './goot-picker/goot-picker.module';

@NgModule({
  declarations: [AppComponent, DpPgComponent],
  imports: [BrowserModule, GootPickerModule],
  providers: [],
  bootstrap: [DpPgComponent]
})
export class AppModule { }
