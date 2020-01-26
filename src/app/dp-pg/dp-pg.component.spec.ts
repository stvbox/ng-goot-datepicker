import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DpPgComponent } from './dp-pg.component';

describe('DpPgComponent', () => {
  let component: DpPgComponent;
  let fixture: ComponentFixture<DpPgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DpPgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DpPgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
