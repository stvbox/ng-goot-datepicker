import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent implements OnInit {

  @Input() isRangeMode: boolean = false;
  @Input() showDropdowns: boolean = false;

  @ViewChild("inputElement", { static: true }) private inputElement: ElementRef<HTMLElement>;
  @ViewChild("parentElement", { static: true }) private parentElement: ElementRef<HTMLElement>;
  @ViewChild("dpContainer", { static: true }) private dpContainer: ElementRef<HTMLElement>;

  containerClasses: string[] = [];

  locale = {
    direction: 'ltr',
    //format: moment.localeData().longDateFormat('L'),
    format: 'DD.MM.YYYY',
    separator: ' - ',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    weekLabel: 'W',
    customRangeLabel: 'Custom Range',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek()
  };

  //default settings for options
  parentEl: JQuery;
  element;
  container;
  startDate = moment().startOf('day');
  endDate = moment().endOf('day');
  autoApply = false;
  //singleDatePicker = false;
  //showDropdowns = false;
  minYear = moment().subtract(100, 'year').format('YYYY');
  maxYear = moment().add(100, 'year').format('YYYY');
  showWeekNumbers = false;
  showISOWeekNumbers = false;
  showCustomRangeLabel = true;
  timePicker = false;
  timePicker24Hour = false;
  timePickerIncrement = 1;
  timePickerSeconds = false;
  linkedCalendars = true;
  autoUpdateInput = true;
  alwaysShowCalendars = false;
  ranges = {};
  opens = 'right';
  drops = 'down';

  buttonClasses = 'btn btn-sm';
  applyButtonClasses = 'btn-primary';
  cancelButtonClasses = 'btn-default';

  //some state information
  isShowing = false;

  leftCalendar: any = {};
  rightCalendar: any = {};


  constructor(private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.leftCalendar = {};
    this.rightCalendar = {};
    this.init(this.inputElement.nativeElement, {});
  }

  applyValue(start, end, label) {
    console.log([start, end, label]);
  }

  timepicker: any;

  init(domElement, options) {
    this.element = $(domElement);

    if (this.element.hasClass('pull-right'))
      this.opens = 'left';

    if (this.element.hasClass('dropup'))
      this.drops = 'up';

    this.initOptions(options);

    this.container.addClass(this.locale.direction);
    this.containerClasses.push(this.locale.direction);

    this.initDates(options);

    if (typeof options.applyButtonClasses === 'string')
      this.applyButtonClasses = options.applyButtonClasses;

    if (typeof options.applyClass === 'string') //backwards compat
      this.applyButtonClasses = options.applyClass;

    if (typeof options.cancelButtonClasses === 'string')
      this.cancelButtonClasses = options.cancelButtonClasses;

    if (typeof options.cancelClass === 'string') //backwards compat
      this.cancelButtonClasses = options.cancelClass;

    if (typeof options.maxSpan === 'object')
      this.maxSpan = options.maxSpan;

    if (typeof options.dateLimit === 'object') //backwards compat
      this.maxSpan = options.dateLimit;

    if (typeof options.opens === 'string')
      this.opens = options.opens;

    if (typeof options.drops === 'string')
      this.drops = options.drops;

    if (typeof options.showWeekNumbers === 'boolean')
      this.showWeekNumbers = options.showWeekNumbers;

    if (typeof options.showISOWeekNumbers === 'boolean')
      this.showISOWeekNumbers = options.showISOWeekNumbers;

    if (typeof options.buttonClasses === 'string')
      this.buttonClasses = options.buttonClasses;

    if (typeof options.buttonClasses === 'object')
      this.buttonClasses = options.buttonClasses.join(' ');

    //if (typeof options.showDropdowns === 'boolean')
    //  this.showDropdowns = options.showDropdowns;

    if (typeof options.minYear === 'number')
      this.minYear = options.minYear;

    if (typeof options.maxYear === 'number')
      this.maxYear = options.maxYear;

    if (typeof options.showCustomRangeLabel === 'boolean')
      this.showCustomRangeLabel = options.showCustomRangeLabel;

    if (!this.isRangeMode) {
      this.endDate = this.startDate.clone();
    }

    if (typeof options.timePicker === 'boolean')
      this.timePicker = options.timePicker;

    if (typeof options.timePickerSeconds === 'boolean')
      this.timePickerSeconds = options.timePickerSeconds;

    if (typeof options.timePickerIncrement === 'number')
      this.timePickerIncrement = options.timePickerIncrement;

    if (typeof options.timePicker24Hour === 'boolean')
      this.timePicker24Hour = options.timePicker24Hour;

    if (typeof options.autoApply === 'boolean')
      this.autoApply = options.autoApply;

    if (typeof options.autoUpdateInput === 'boolean')
      this.autoUpdateInput = options.autoUpdateInput;

    if (typeof options.linkedCalendars === 'boolean')
      this.linkedCalendars = options.linkedCalendars;

    if (typeof options.isInvalidDate === 'function')
      this.isInvalidDate = options.isInvalidDate;

    if (typeof options.isCustomDate === 'function')
      this.isCustomDate = options.isCustomDate;

    if (typeof options.alwaysShowCalendars === 'boolean')
      this.alwaysShowCalendars = options.alwaysShowCalendars;

    // update day names order to firstDay
    if (this.locale.firstDay != 0) {
      var iterator = this.locale.firstDay;
      while (iterator > 0) {
        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
        iterator--;
      }
    }

    let start, end, range;

    //if no start/end dates set, check if an input element contains initial values
    if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
      if ($(this.element).is(':text')) {
        const val = String($(this.element).val());
        const split = val.split(this.locale.separator);

        start = end = null;

        if (split.length == 2) {
          start = moment(split[0], this.locale.format);
          end = moment(split[1], this.locale.format);
        } else if (!this.isRangeMode && val !== "") {
          start = moment(val, this.locale.format);
          end = moment(val, this.locale.format);
        }
        if (start !== null && end !== null) {
          this.setStartDate(start);
          this.setEndDate(end);
        }
      }
    }

    if (typeof options.ranges === 'object') {
      for (range in options.ranges) {

        if (typeof options.ranges[range][0] === 'string')
          start = moment(options.ranges[range][0], this.locale.format);
        else
          start = moment(options.ranges[range][0]);

        if (typeof options.ranges[range][1] === 'string')
          end = moment(options.ranges[range][1], this.locale.format);
        else
          end = moment(options.ranges[range][1]);

        // If the start or end date exceed those allowed by the minDate or maxSpan
        // options, shorten the range to the allowable period.
        if (this.minDate && start.isBefore(this.minDate))
          start = this.minDate.clone();

        var maxDate = this.maxDate;
        if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate))
          maxDate = start.clone().add(this.maxSpan);
        if (maxDate && end.isAfter(maxDate))
          end = maxDate.clone();

        // If the end of the range is before the minimum or the start of the range is
        // after the maximum, don't display this range option at all.
        if ((this.minDate && end.isBefore(this.minDate, this.timepicker ? 'minute' : 'day'))
          || (maxDate && start.isAfter(maxDate, this.timepicker ? 'minute' : 'day')))
          continue;

        //Support unicode chars in the range names.
        var elem = document.createElement('textarea');
        elem.innerHTML = range;
        var rangeHtml = elem.value;

        this.ranges[rangeHtml] = [start, end];
      }

      var list = '<ul>';
      for (range in this.ranges) {
        list += '<li data-range-key="' + range + '">' + range + '</li>';
      }
      if (this.showCustomRangeLabel) {
        list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
      }
      list += '</ul>';
      this.container.find('.ranges').prepend(list);
    }

    if (!this.timePicker) {
      this.startDate = this.startDate.startOf('day');
      this.endDate = this.endDate.endOf('day');
      this.container.find('.calendar-time').hide();
    }

    //can't be used together for now
    if (this.timePicker && this.autoApply)
      this.autoApply = false;

    if (this.autoApply) {
      this.container.addClass('auto-apply');
      this.containerClasses.push('auto-apply');
    }

    if (typeof options.ranges === 'object') {
      this.container.addClass('show-ranges');
      this.containerClasses.push('show-ranges');
    }


    if (!this.isRangeMode) { // перенесено
      this.container.addClass('single');
      this.containerClasses.push('single');
      this.container.find('.drp-calendar.left').addClass('single');
      this.container.find('.drp-calendar.left').show();
      this.container.find('.drp-calendar.right').hide();
      if (!this.timePicker) {
        this.container.addClass('auto-apply');
        this.containerClasses.push('auto-apply');
      }
    }

    if ((typeof options.ranges === 'undefined' && this.isRangeMode) || this.alwaysShowCalendars) {
      this.container.addClass('show-calendar');
      this.containerClasses.push('show-calendar');
    }

    this.container.addClass('opens' + this.opens);
    this.containerClasses.push('opens' + this.opens);

    //apply CSS classes and labels to buttons
    this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
    if (this.applyButtonClasses.length)
      this.container.find('.applyBtn').addClass(this.applyButtonClasses);
    if (this.cancelButtonClasses.length)
      this.container.find('.cancelBtn').addClass(this.cancelButtonClasses);
    this.container.find('.applyBtn').html(this.locale.applyLabel);
    this.container.find('.cancelBtn').html(this.locale.cancelLabel);

    //
    // event listeners
    //

    this.container.find('.drp-calendar')
      .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
      .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
      //.on('mousedown.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
      .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
      //.on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
      //.on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
      .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))

    this.container.find('.ranges')
      .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))

    this.container.find('.drp-buttons')
      .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
      .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))

    if (this.element.is('input') || this.element.is('button')) {
      this.element.on({
        'click.daterangepicker': $.proxy(this.show, this),
        'focus.daterangepicker': $.proxy(this.show, this),
        'keyup.daterangepicker': $.proxy(this.elementChanged, this),
        'keydown.daterangepicker': $.proxy(this.keydown, this) //IE 11 compatibility
      });
    } else {
      this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
      this.element.on('keydown.daterangepicker', $.proxy(this.toggle, this));
    }

    //
    // if attached to a text input, set the initial value
    //

    this.updateElement();

  }

  initOptions(options) {
    //custom options from user
    if (typeof options !== 'object' || options === null) options = {};

    //allow setting options with data attributes
    //data-api options will be overwritten with custom javascript options
    options = $.extend(this.element.data(), options);

    //html template for the picker UI
    this.parentEl = $(this.parentElement.nativeElement);
    this.container = $(this.dpContainer.nativeElement);

    //
    // handle all the possible options overriding defaults
    //

    if (typeof options.locale === 'object') {

      if (typeof options.locale.direction === 'string')
        this.locale.direction = options.locale.direction;

      if (typeof options.locale.format === 'string')
        this.locale.format = options.locale.format;

      if (typeof options.locale.separator === 'string')
        this.locale.separator = options.locale.separator;

      if (typeof options.locale.daysOfWeek === 'object')
        this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

      if (typeof options.locale.monthNames === 'object')
        this.locale.monthNames = options.locale.monthNames.slice();

      if (typeof options.locale.firstDay === 'number')
        this.locale.firstDay = options.locale.firstDay;

      if (typeof options.locale.applyLabel === 'string')
        this.locale.applyLabel = options.locale.applyLabel;

      if (typeof options.locale.cancelLabel === 'string')
        this.locale.cancelLabel = options.locale.cancelLabel;

      if (typeof options.locale.weekLabel === 'string')
        this.locale.weekLabel = options.locale.weekLabel;

      if (typeof options.locale.customRangeLabel === 'string') {
        //Support unicode chars in the custom range name.
        const elem = document.createElement('textarea');
        elem.innerHTML = options.locale.customRangeLabel;
        const rangeHtml = elem.value;
        this.locale.customRangeLabel = rangeHtml;
      }
    }
  }

  minDate: moment.Moment;
  maxDate: moment.Moment;

  initDates(options) {
    if (typeof options.startDate === 'string')
      this.startDate = moment(options.startDate, this.locale.format);

    if (typeof options.endDate === 'string')
      this.endDate = moment(options.endDate, this.locale.format);

    if (typeof options.minDate === 'string')
      this.minDate = moment(options.minDate, this.locale.format);

    if (typeof options.maxDate === 'string')
      this.maxDate = moment(options.maxDate, this.locale.format);

    if (typeof options.startDate === 'object')
      this.startDate = moment(options.startDate);

    if (typeof options.endDate === 'object')
      this.endDate = moment(options.endDate);

    if (typeof options.minDate === 'object')
      this.minDate = moment(options.minDate);

    if (typeof options.maxDate === 'object')
      this.maxDate = moment(options.maxDate);

    // sanity check for bad options
    if (this.minDate && this.startDate.isBefore(this.minDate))
      this.startDate = this.minDate.clone();

    // sanity check for bad options
    if (this.maxDate && this.endDate.isAfter(this.maxDate))
      this.endDate = this.maxDate.clone();
  }

  setStartDate(startDate) {
    if (typeof startDate === 'string')
      this.startDate = moment(startDate, this.locale.format);

    if (typeof startDate === 'object')
      this.startDate = moment(startDate);

    if (!this.timePicker)
      this.startDate = this.startDate.startOf('day');

    if (this.timePicker && this.timePickerIncrement)
      this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

    if (this.minDate && this.startDate.isBefore(this.minDate)) {
      this.startDate = this.minDate.clone();
      if (this.timePicker && this.timePickerIncrement)
        this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
    }

    if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
      this.startDate = this.maxDate.clone();
      if (this.timePicker && this.timePickerIncrement)
        this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
    }

    if (!this.isShowing)
      this.updateElement();

    this.updateMonthsInView();
  }

  maxSpan: any;
  previousRightTime: any;
  drpSelected: string;
  setEndDate(endDate) {
    if (typeof endDate === 'string')
      this.endDate = moment(endDate, this.locale.format);

    if (typeof endDate === 'object')
      this.endDate = moment(endDate);

    if (!this.timePicker)
      this.endDate = this.endDate.endOf('day');

    if (this.timePicker && this.timePickerIncrement)
      this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

    if (this.endDate.isBefore(this.startDate))
      this.endDate = this.startDate.clone();

    if (this.maxDate && this.endDate.isAfter(this.maxDate))
      this.endDate = this.maxDate.clone();

    if (this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate))
      this.endDate = this.startDate.clone().add(this.maxSpan);

    this.previousRightTime = this.endDate.clone();

    this.drpSelected = this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);
    this.container.find('.drp-selected').html(this.drpSelected);

    if (!this.isShowing)
      this.updateElement();

    this.updateMonthsInView();
  }

  updateView() {
    if (this.timePicker) {
      this.renderTimePicker('left');
      this.renderTimePicker('right');
      if (!this.endDate) {
        this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
      } else {
        this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
      }
    }
    if (this.endDate) {
      this.drpSelected = this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format);
      this.container.find('.drp-selected').html(this.drpSelected);
    }

    this.updateMonthsInView();
    this.updateCalendars();
    this.updateFormInputs();
  }

  updateMonthsInView() {
    if (this.endDate) {

      //this.leftCalendar = this.leftCalendar || {};
      //this.rightCalendar = this.rightCalendar || {};

      //if both dates are visible already, do nothing
      if (this.isRangeMode && this.leftCalendar.month && this.rightCalendar.month &&
        (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
        &&
        (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
      ) {
        return;
      }

      this.leftCalendar.month = this.startDate.clone().date(2);
      if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
        this.rightCalendar.month = this.endDate.clone().date(2);
      } else {
        this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
      }

    } else {
      if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
        this.leftCalendar.month = this.startDate.clone().date(2);
        this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
      }
    }
    if (this.maxDate && this.linkedCalendars && this.isRangeMode && this.rightCalendar.month > this.maxDate) {
      this.rightCalendar.month = this.maxDate.clone().date(2);
      this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
    }
  }

  updateCalendars() {

    if (this.timePicker) {
      var hour, minute, second;
      if (this.endDate) {
        hour = parseInt(this.container.find('.left .hourselect').val(), 10);
        minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.left .minuteselect option:last').val(), 10);
        }
        second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
        if (!this.timePicker24Hour) {
          var ampm = this.container.find('.left .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
      } else {
        hour = parseInt(this.container.find('.right .hourselect').val(), 10);
        minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.right .minuteselect option:last').val(), 10);
        }
        second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
        if (!this.timePicker24Hour) {
          var ampm = this.container.find('.right .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
      }
      this.leftCalendar.month.hour(hour).minute(minute).second(second);
      this.rightCalendar.month.hour(hour).minute(minute).second(second);
    }

    this.renderCalendar('left');
    this.renderCalendar('right');

    //highlight any predefined range matching the current start and end dates
    this.container.find('.ranges li').removeClass('active');
    if (this.endDate == null) return;

    this.calculateChosenLabel();
  }

  view: any = {
    left: {},
    right: {},
  };

  renderCalendar(side) {

    //
    // Build the matrix of dates that will populate the calendar
    //

    const calendar: any = side == 'left' ? this.leftCalendar : this.rightCalendar;
    const month = calendar.month.month();
    const year = calendar.month.year();
    const hour = calendar.month.hour();
    const minute = calendar.month.minute();
    const second = calendar.month.second();
    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]);
    const lastDay = moment([year, month, daysInMonth]);
    const lastMonth = moment(firstDay).subtract(1, 'month').month();
    const lastYear = moment(firstDay).subtract(1, 'month').year();
    const daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
    const dayOfWeek = firstDay.day();

    //initialize a 6 rows x 7 columns array for the calendar
    //var calendar = [];
    calendar.firstDay = firstDay;
    calendar.lastDay = lastDay;

    for (let i = 0; i < 6; i++) {
      calendar[i] = [];
    }

    //populate the calendar with date objects
    let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
    if (startDay > daysInLastMonth)
      startDay -= 7;

    if (dayOfWeek == this.locale.firstDay)
      startDay = daysInLastMonth - 6;

    let curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

    for (let i = 0, col = 0, row = 0; i < 42; i++ , col++ , curDate = moment(curDate).add(24, 'hour')) {
      if (i > 0 && col % 7 === 0) {
        col = 0;
        row++;
      }
      calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
      curDate.hour(12);

      if (this.minDate && calendar[row][col].format('DD.MM.YYYY') == this.minDate.format('DD.MM.YYYY') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
        calendar[row][col] = this.minDate.clone();
      }

      if (this.maxDate && calendar[row][col].format('DD.MM.YYYY') == this.maxDate.format('DD.MM.YYYY') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
        calendar[row][col] = this.maxDate.clone();
      }

    }

    //make the calendar object available to hoverDate/clickDate
    if (side == 'left') {
      this.leftCalendar.calendar = calendar;
    } else {
      this.rightCalendar.calendar = calendar;
    }

    //
    // Display the calendar
    //

    const minDate = side == 'left' ? this.minDate : this.startDate;
    let maxDate = this.maxDate;
    const selected = side == 'left' ? this.startDate : this.endDate;
    const arrow = this.locale.direction == 'ltr' ? { left: 'chevron-left', right: 'chevron-right' } : { left: 'chevron-right', right: 'chevron-left' };

    let html = '<table class="table-condensed">';
    html += '<thead>';
    html += '<tr>';

    // add empty cell for week number
    if (this.showWeekNumbers || this.showISOWeekNumbers)
      html += '<th></th>';


    // view
    this.view[side]['showPrevBtn'] = (!minDate || minDate.isBefore(calendar.firstDay))
      && (!this.linkedCalendars || side == 'left');

    if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
      html += '<th class="prev available"><span></span></th>';
    } else {
      html += '<th></th>';
    }

    // view
    this.view[side]['dateHtml'] = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");
    var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

    if (this.showDropdowns) {
      var currentMonth = calendar[1][1].month();
      var currentYear = calendar[1][1].year();
      var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
      var minYear = (minDate && minDate.year()) || (this.minYear);
      var inMinYear = currentYear == minYear;
      var inMaxYear = currentYear == maxYear;

      const months = [];

      let monthHtml = '<select class="monthselect">';
      for (var value = 0; value < 12; value++) {
        const text = this.locale.monthNames[value];
        const selected = value === currentMonth;

        if (selected) {
          this.monthYearSelects[side + '_month'] = value;
        }

        if ((!inMinYear || (minDate && value >= minDate.month())) && (!inMaxYear || (maxDate && value <= maxDate.month()))) {
          monthHtml += "<option value='" + value + "'" +
            (selected ? " selected='selected'" : "") +
            ">" + text + "</option>";
          months.push({ value: value, selected, disabled: false, text });
        } else {
          monthHtml += "<option value='" + value + "'" +
            (selected ? " selected='selected'" : "") +
            " disabled='disabled'>" + text + "</option>";
          months.push({ value: value, selected, disabled: true, text });
        }
      }
      monthHtml += "</select>";
      // view
      this.view[side]['months'] = months;

      const years = [];
      let yearHtml = '<select class="yearselect">';
      for (let value: number = Number(minYear); value <= maxYear; value++) {
        const selected = value === currentYear;
        const text = value;

        if (selected) {
          this.monthYearSelects[side + '_year'] = value;
        }

        yearHtml += '<option value="' + value + '"' +
          (selected ? ' selected="selected"' : '') +
          '>' + value + '</option>';
        years.push({ value, selected, text });
      }
      yearHtml += '</select>';
      // view
      this.view[side]['years'] = years;

      dateHtml = monthHtml + yearHtml;
    }

    html += '<th colspan="5" class="month">' + dateHtml + '</th>';

    // view
    this.view[side]['showNextBtn'] = (!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || !this.isRangeMode);
    if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || !this.isRangeMode)) {
      html += '<th class="next available"><span></span></th>';
    } else {
      html += '<th></th>';
    }

    html += '</tr>';
    html += '<tr>';

    // view
    this.view[side]['showWeekNumbers'] = this.showWeekNumbers || this.showISOWeekNumbers;
    // add week number label
    if (this.showWeekNumbers || this.showISOWeekNumbers)
      html += '<th class="week">' + this.locale.weekLabel + '</th>';

    $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
      html += '<th>' + dayOfWeek + '</th>';
    });

    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    //adjust maxDate to reflect the maxSpan setting in order to
    //grey out end dates beyond the maxSpan
    if (this.endDate == null && this.maxSpan) {
      var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
      if (!maxDate || maxLimit.isBefore(maxDate)) {
        maxDate = maxLimit;
      }
    }

    // view
    this.view[side]['cells'] = [];

    for (let row = 0; row < 6; row++) {
      html += '<tr>';

      // add week number
      if (this.showWeekNumbers) {
        html += '<td class="week">' + calendar[row][0].week() + '</td>';
        // view
        this.view[side]['cells'][row][0] = { text: calendar[row][0].week() };
      }
      else if (this.showISOWeekNumbers) {
        html += '<td class="week">' + calendar[row][0].isoWeek() + '</td>';
        // view
        this.view[side]['cells'][row][0] = { text: calendar[row][0].isoWeek() };
      }

      for (let col = 0; col < 7; col++) {

        var classes = [];

        //highlight today's date
        if (calendar[row][col].isSame(new Date(), "day"))
          classes.push('today');

        //highlight weekends
        if (calendar[row][col].isoWeekday() > 5)
          classes.push('weekend');

        //grey out the dates in other months displayed at beginning and end of this calendar
        if (calendar[row][col].month() != calendar[1][1].month())
          classes.push('off', 'ends');

        //don't allow selection of dates before the minimum date
        if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day'))
          classes.push('off', 'disabled');

        //don't allow selection of dates after the maximum date
        if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
          classes.push('off', 'disabled');

        //don't allow selection of date if a custom function decides it's invalid
        if (this.isInvalidDate(calendar[row][col]))
          classes.push('off', 'disabled');

        //highlight the currently selected start date
        if (calendar[row][col].format('DD.MM.YYYY') == this.startDate.format('DD.MM.YYYY'))
          classes.push('active', 'start-date');

        //highlight the currently selected end date
        if (this.endDate != null && calendar[row][col].format('DD.MM.YYYY') == this.endDate.format('DD.MM.YYYY'))
          classes.push('active', 'end-date');

        //highlight dates in-between the selected dates
        if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
          classes.push('in-range');

        //apply custom classes for this date
        var isCustom = this.isCustomDate(calendar[row][col]);
        if (isCustom !== false) {
          if (typeof isCustom === 'string')
            classes.push(isCustom);
          else
            Array.prototype.push.apply(classes, isCustom);
        }

        var cname = '', disabled = false;
        for (var i = 0; i < classes.length; i++) {
          cname += classes[i] + ' ';
          if (classes[i] == 'disabled') {
            disabled = true;
          }
        }

        if (!disabled) {
          cname += 'available';
          classes.push('available');
        }

        // view
        if (this.view[side]['cells'][row] == null) {
          this.view[side]['cells'][row] = [];
        }

        this.view[side]['cells'][row][col] = {
          text: calendar[row][col].date(),
          available: !disabled,
          classes: classes,
          row,
          col,
        };

        html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

      }
      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    this.container.find('.drp-calendar.' + side + ' .calendar-table').html(html);

    this.cd.detectChanges();
  }

  renderTimePicker(side) {

    // Don't bother updating the time picker if it's currently disabled
    // because an end date hasn't been clicked yet
    if (side == 'right' && !this.endDate) return;

    var html, selected, minDate, maxDate = this.maxDate;

    if (this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isBefore(this.maxDate)))
      maxDate = this.startDate.clone().add(this.maxSpan);

    if (side == 'left') {
      selected = this.startDate.clone();
      minDate = this.minDate;
    } else if (side == 'right') {
      selected = this.endDate.clone();
      minDate = this.startDate;

      //Preserve the time already selected
      var timeSelector = this.container.find('.drp-calendar.right .calendar-time');
      if (timeSelector.html() != '') {

        selected.hour(!isNaN(selected.hour()) ? selected.hour() : timeSelector.find('.hourselect option:selected').val());
        selected.minute(!isNaN(selected.minute()) ? selected.minute() : timeSelector.find('.minuteselect option:selected').val());
        selected.second(!isNaN(selected.second()) ? selected.second() : timeSelector.find('.secondselect option:selected').val());

        if (!this.timePicker24Hour) {
          var ampm = timeSelector.find('.ampmselect option:selected').val();
          if (ampm === 'PM' && selected.hour() < 12)
            selected.hour(selected.hour() + 12);
          if (ampm === 'AM' && selected.hour() === 12)
            selected.hour(0);
        }

      }

      if (selected.isBefore(this.startDate))
        selected = this.startDate.clone();

      if (maxDate && selected.isAfter(maxDate))
        selected = maxDate.clone();

    }

    //
    // hours
    //

    html = '<select class="hourselect">';

    var start = this.timePicker24Hour ? 0 : 1;
    var end = this.timePicker24Hour ? 23 : 12;

    for (var i = start; i <= end; i++) {
      var i_in_24 = i;
      if (!this.timePicker24Hour)
        i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);

      var time = selected.clone().hour(i_in_24);
      var disabled = false;
      if (minDate && time.minute(59).isBefore(minDate))
        disabled = true;
      if (maxDate && time.minute(0).isAfter(maxDate))
        disabled = true;

      if (i_in_24 == selected.hour() && !disabled) {
        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
      } else if (disabled) {
        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
      } else {
        html += '<option value="' + i + '">' + i + '</option>';
      }
    }

    html += '</select> ';

    //
    // minutes
    //

    html += ': <select class="minuteselect">';

    for (var i = 0; i < 60; i += this.timePickerIncrement) {
      var padded = i < 10 ? '0' + i : i;
      var time = selected.clone().minute(i);

      var disabled = false;
      if (minDate && time.second(59).isBefore(minDate))
        disabled = true;
      if (maxDate && time.second(0).isAfter(maxDate))
        disabled = true;

      if (selected.minute() == i && !disabled) {
        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
      } else if (disabled) {
        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
      } else {
        html += '<option value="' + i + '">' + padded + '</option>';
      }
    }

    html += '</select> ';

    //
    // seconds
    //

    if (this.timePickerSeconds) {
      html += ': <select class="secondselect">';

      for (var i = 0; i < 60; i++) {
        var padded = i < 10 ? '0' + i : i;
        var time = selected.clone().second(i);

        var disabled = false;
        if (minDate && time.isBefore(minDate))
          disabled = true;
        if (maxDate && time.isAfter(maxDate))
          disabled = true;

        if (selected.second() == i && !disabled) {
          html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
        } else if (disabled) {
          html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
        } else {
          html += '<option value="' + i + '">' + padded + '</option>';
        }
      }

      html += '</select> ';
    }

    //
    // AM/PM
    //

    if (!this.timePicker24Hour) {
      html += '<select class="ampmselect">';

      var am_html = '';
      var pm_html = '';

      if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
        am_html = ' disabled="disabled" class="disabled"';

      if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
        pm_html = ' disabled="disabled" class="disabled"';

      if (selected.hour() >= 12) {
        html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
      } else {
        html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
      }

      html += '</select>';
    }

    this.container.find('.drp-calendar.' + side + ' .calendar-time').html(html);

  }

  applyBtnDisabled: boolean = true;

  updateFormInputs() {
    if (!this.isRangeMode || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
      this.container.find('button.applyBtn').removeAttr('disabled');
      this.applyBtnDisabled = false;
    } else {
      this.container.find('button.applyBtn').attr('disabled', 'disabled');
      this.applyBtnDisabled = true;
    }
  }

  move() {
    let containerTop;
    let parentOffset = { top: 0, left: 0 };
    let parentRightEdge = $(window).width();
    if (!this.parentEl.is('body')) {
      parentOffset = {
        top: this.parentEl.offset().top - this.parentEl.scrollTop(),
        left: this.parentEl.offset().left - this.parentEl.scrollLeft()
      };
      parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
    }

    if (this.drops == 'up') {
      containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
    } else {
      containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
    }


    // Force the container to it's actual width
    this.setContainerCss({
      top: 0,
      left: 0,
      right: 'auto'
    });

    var containerWidth = this.container.outerWidth();

    this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('drop-up');

    if (this.opens == 'left') {
      var containerRight = parentRightEdge - this.element.offset().left - this.element.outerWidth();
      if (containerWidth + containerRight > $(window).width()) {
        this.setContainerCss({
          top: containerTop + 'px',
          right: 'auto',
          left: 9
        });
      } else {
        this.setContainerCss({
          top: containerTop + 'px',
          right: containerRight + 'px',
          left: 'auto'
        });
      }
    } else if (this.opens == 'center') {
      var containerLeft = this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
        - containerWidth / 2;
      if (containerLeft < 0) {
        this.setContainerCss({
          top: containerTop + 'px',
          right: 'auto',
          left: 9
        });
      } else if (containerLeft + containerWidth > $(window).width()) {
        this.setContainerCss({
          top: containerTop + 'px',
          left: 'auto',
          right: 0
        });
      } else {
        this.setContainerCss({
          top: containerTop + 'px',
          left: containerLeft + 'px',
          right: 'auto'
        });
      }
    } else {
      var containerLeft = this.element.offset().left - parentOffset.left;
      if (containerLeft + containerWidth > $(window).width()) {
        this.setContainerCss({
          top: containerTop + 'px',
          left: 'auto',
          right: 0
        });
      } else {
        this.setContainerCss({
          top: containerTop + 'px',
          left: containerLeft + 'px',
          right: 'auto'
        });
      }
    }
  }

  containerStyle: any;
  private setContainerCss(style) {
    this.containerStyle = style;
    //this.container.css(style);
  }

  _outsideClickProxy;
  oldStartDate;
  oldEndDate;

  show(e) {
    if (this.isShowing) return;

    // Create a click proxy that is private to this instance of datepicker, for unbinding
    this._outsideClickProxy = $.proxy(function (e) { this.outsideClick(e); }, this);

    // Bind global datepicker mousedown for hiding and
    $(document)
      .on('mousedown.daterangepicker', this._outsideClickProxy)
      // also support mobile devices
      .on('touchend.daterangepicker', this._outsideClickProxy)
      // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
      .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
      // and also close when focus changes to outside the picker (eg. tabbing between controls)
      .on('focusin.daterangepicker', this._outsideClickProxy);

    // Reposition the picker if the window is resized while it's open
    $(window).on('resize.daterangepicker', $.proxy((e) => {
      this.move();
    }, this));

    this.oldStartDate = this.startDate.clone();
    this.oldEndDate = this.endDate.clone();
    this.previousRightTime = this.endDate.clone();

    this.updateView();
    // Раскомментировать для раскрытия оригинального пикера
    //this.container.show();
    this.move();
    this.element.trigger('show.daterangepicker', this);
    this.isShowing = true;
    this.cd.detectChanges();
  }

  hide(e: Event) {
    this.element.blur();
    if (!this.isShowing) return;

    //incomplete date selection, revert to last values
    if (!this.endDate) {
      this.startDate = this.oldStartDate.clone();
      this.endDate = this.oldEndDate.clone();
    }

    //if a new date range was selected, invoke the user callback function
    if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)) {
      this.applyValue(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);
    }

    //if picker is attached to a text input, update it
    this.updateElement();

    $(document).off('.daterangepicker');
    $(window).off('.daterangepicker');
    this.container.hide();
    this.element.trigger('hide.daterangepicker', this);
    this.isShowing = false;
    this.cd.detectChanges();
  }

  toggle(e) {
    if (this.isShowing) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  outsideClick(e) {
    var target = $(e.target);
    // if the page is clicked anywhere except within the daterangerpicker/button
    // itself then call this.hide()
    if (
      // ie modal dialog fix
      e.type == "focusin" ||
      target.closest(this.element).length ||
      target.closest(this.container).length ||
      target.closest('.calendar-table').length
    ) return;
    this.hide(e);
    this.element.trigger('outsideClick.daterangepicker', this);
  }

  showCalendars() {
    this.container.addClass('show-calendar');
    this.containerClasses.push('show-calendar');
    this.move();
    this.element.trigger('showCalendar.daterangepicker', this);
  }

  hideCalendars() {
    this.container.removeClass('show-calendar');
    this.element.trigger('hideCalendar.daterangepicker', this);
  }

  chosenLabel: string;

  clickRange(e) {
    var label = e.target.getAttribute('data-range-key');
    this.chosenLabel = label;
    if (label == this.locale.customRangeLabel) {
      this.showCalendars();
    } else {
      var dates = this.ranges[label];
      this.startDate = dates[0];
      this.endDate = dates[1];

      if (!this.timePicker) {
        this.startDate.startOf('day');
        this.endDate.endOf('day');
      }

      if (!this.alwaysShowCalendars)
        this.hideCalendars();
      this.clickApply(e);
    }
  }

  clickPrevBtn(side: string) {
    if (side === 'left') {
      this.leftCalendar.month.subtract(1, 'month');
      if (this.linkedCalendars)
        this.rightCalendar.month.subtract(1, 'month');
    } else {
      this.rightCalendar.month.subtract(1, 'month');
    }
    this.updateCalendars();
    this.cd.detectChanges();
  }

  clickPrev(e: Event) {
    var cal = $(e.target).parents('.drp-calendar');
    if (cal.hasClass('left')) {
      this.leftCalendar.month.subtract(1, 'month');
      if (this.linkedCalendars)
        this.rightCalendar.month.subtract(1, 'month');
    } else {
      this.rightCalendar.month.subtract(1, 'month');
    }
    this.updateCalendars();
  }

  clickNextBtn(side: string) {
    if (side === 'left') {
      this.leftCalendar.month.add(1, 'month');
    } else {
      this.rightCalendar.month.add(1, 'month');
      if (this.linkedCalendars) {
        this.leftCalendar.month.add(1, 'month');
      }
    }
    this.updateCalendars();
    this.cd.detectChanges();
  }

  clickNext(e: Event) {
    const cal = $(e.target).parents('.drp-calendar');
    if (cal.hasClass('left')) {
      this.leftCalendar.month.add(1, 'month');
    } else {
      this.rightCalendar.month.add(1, 'month');
      if (this.linkedCalendars) {
        this.leftCalendar.month.add(1, 'month');
      }
    }
    this.updateCalendars();
  }

  hoverDateCell({ cell, side, row, col }) {
    //ignore dates that can't be selected
    if (!cell.available) return;

    const leftCalendar = this.leftCalendar.calendar;
    const rightCalendar = this.rightCalendar.calendar;
    const startDate = this.startDate;

    const date = (side === 'left')
      ? leftCalendar[row][col]
      : rightCalendar[row][col];

    //highlight the dates between the start date and the date being hovered as a potential end date
    if (!this.endDate) {

      const cells: any[] = this.view[side].cells.reduce((memo, row: any[]) => {
        const noWeeks = row.filter((cell) => !cell.classes.includes('week'));
        return [...memo, ...noWeeks];
      }, []);

      cells.forEach((cell) => {
        const { col, row } = cell;
        const dt = (side === 'left')
          ? leftCalendar[row][col]
          : rightCalendar[row][col];
        const isInRange = (dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day');

        cell.classes = isInRange
          ? [...cell.classes, 'in-range']
          : cell.classes.filter((cls) => cls !== 'in-range');
      });
    }

    this.cd.detectChanges();
  }

  hoverDate(e) {

    //ignore dates that can't be selected
    if (!$(e.target).hasClass('available')) return;

    const leftCalendar = this.leftCalendar.calendar;
    const rightCalendar = this.rightCalendar.calendar;
    const startDate = this.startDate;

    var title = $(e.target).attr('data-title');
    var row = title.substr(1, 1);
    var col = title.substr(3, 1);
    var cal = $(e.target).parents('.drp-calendar');
    var date = cal.hasClass('left')
      ? leftCalendar[row][col]
      : rightCalendar[row][col];

    //highlight the dates between the start date and the date being hovered as a potential end date
    if (!this.endDate) {
      this.container.find('.drp-calendar tbody td').each(function (index, el) {

        //skip week numbers, only look at dates
        if ($(el).hasClass('week')) return;

        var title = $(el).attr('data-title');
        var row = title.substr(1, 1);
        var col = title.substr(3, 1);
        var cal = $(el).parents('.drp-calendar');
        var dt = cal.hasClass('left')
          ? leftCalendar[row][col]
          : rightCalendar[row][col];

        if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
          $(el).addClass('in-range');
        } else {
          $(el).removeClass('in-range');
        }

      });
    }

  }

  clickDateCell({ event, side, row, col }) {
    let date = side === 'left'
      ? this.leftCalendar.calendar[row][col]
      : this.rightCalendar.calendar[row][col];

    if (this.endDate || date.isBefore(this.startDate, 'day')) { //picking start
      if (this.timePicker) {
        let hour = parseInt(this.container.find('.left .hourselect').val(), 10);
        if (!this.timePicker24Hour) {
          const ampm = this.container.find('.left .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
        let minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.left .minuteselect option:last').val(), 10);
        }
        var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
        date = date.clone().hour(hour).minute(minute).second(second);
      }
      this.endDate = null;
      this.setStartDate(date.clone());
    } else if (!this.endDate && date.isBefore(this.startDate)) {
      //special case: clicking the same date for start/end,
      //but the time of the end date is before the start date
      this.setEndDate(this.startDate.clone());
    } else { // picking end
      if (this.timePicker) {
        var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
        if (!this.timePicker24Hour) {
          var ampm = this.container.find('.right .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
        var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.right .minuteselect option:last').val(), 10);
        }
        var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
        date = date.clone().hour(hour).minute(minute).second(second);
      }
      this.setEndDate(date.clone());
      if (this.autoApply) {
        this.calculateChosenLabel();
        this.clickApply(event);
      }
    }

    if (!this.isRangeMode) {
      this.setEndDate(this.startDate);
      if (!this.timePicker)
        this.clickApply(event);
    }

    this.updateView();

    //This is to cancel the blur event handler if the mouse was in one of the inputs
    event.stopPropagation();
  }

  /*clickDate(e) {

    if (!$(e.target).hasClass('available')) return;

    const title = $(e.target).attr('data-title');
    const row = title.substr(1, 1);
    const col = title.substr(3, 1);
    const cal = $(e.target).parents('.drp-calendar');
    let date = cal.hasClass('left')
      ? this.leftCalendar.calendar[row][col]
      : this.rightCalendar.calendar[row][col];

    //
    // this function needs to do a few things:
    // * alternate between selecting a start and end date for the range,
    // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
    // * if autoapply is enabled, and an end date was chosen, apply the selection
    // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
    // * if one of the inputs above the calendars was focused, cancel that manual input
    //

    if (this.endDate || date.isBefore(this.startDate, 'day')) { //picking start
      if (this.timePicker) {
        let hour = parseInt(this.container.find('.left .hourselect').val(), 10);
        if (!this.timePicker24Hour) {
          const ampm = this.container.find('.left .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
        let minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.left .minuteselect option:last').val(), 10);
        }
        var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
        date = date.clone().hour(hour).minute(minute).second(second);
      }
      this.endDate = null;
      this.setStartDate(date.clone());
    } else if (!this.endDate && date.isBefore(this.startDate)) {
      //special case: clicking the same date for start/end,
      //but the time of the end date is before the start date
      this.setEndDate(this.startDate.clone());
    } else { // picking end
      if (this.timePicker) {
        var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
        if (!this.timePicker24Hour) {
          var ampm = this.container.find('.right .ampmselect').val();
          if (ampm === 'PM' && hour < 12)
            hour += 12;
          if (ampm === 'AM' && hour === 12)
            hour = 0;
        }
        var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
        if (isNaN(minute)) {
          minute = parseInt(this.container.find('.right .minuteselect option:last').val(), 10);
        }
        var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
        date = date.clone().hour(hour).minute(minute).second(second);
      }
      this.setEndDate(date.clone());
      if (this.autoApply) {
        this.calculateChosenLabel();
        this.clickApply(e);
      }
    }

    if (!this.isRangeMode) {
      this.setEndDate(this.startDate);
      if (!this.timePicker)
        this.clickApply(e);
    }

    this.updateView();

    //This is to cancel the blur event handler if the mouse was in one of the inputs
    e.stopPropagation();
  }*/

  calculateChosenLabel() {
    let customRange = true;
    let i = 0;
    for (var range in this.ranges) {
      if (this.timePicker) {
        var format = this.timePickerSeconds ? "DD.MM.YYYY HH:mm:ss" : "DD.MM.YYYY HH:mm";
        //ignore times when comparing dates if time picker seconds is not enabled
        if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
          customRange = false;
          this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
          break;
        }
      } else {
        //ignore times when comparing dates if time picker is not enabled
        if (this.startDate.format('DD.MM.YYYY') == this.ranges[range][0].format('DD.MM.YYYY') && this.endDate.format('DD.MM.YYYY') == this.ranges[range][1].format('DD.MM.YYYY')) {
          customRange = false;
          this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
          break;
        }
      }
      i++;
    }

    if (customRange) {
      if (this.showCustomRangeLabel) {
        this.chosenLabel = this.container.find('.ranges li:last').addClass('active').attr('data-range-key');
      } else {
        this.chosenLabel = null;
      }
      this.showCalendars();
    }
  }

  clickApply(e: Event) {
    this.hide(e);
    this.element.trigger('apply.daterangepicker', this);
  }

  clickCancel(e: Event) {
    this.startDate = this.oldStartDate;
    this.endDate = this.oldEndDate;
    this.hide(e);
    this.element.trigger('cancel.daterangepicker', this);
  }

  monthYearSelects: any = {
    left_month: null,
    right_month: null,
    left_year: null,
    right_year: null,
  };

  monthOrYearSelect({ event, side, field }) {
    const isLeft = side === 'left';

    let month = this.monthYearSelects[side + '_month'];
    let year = this.monthYearSelects[side + '_year'];

    if (!isLeft) {
      if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
        month = this.startDate.month();
        year = this.startDate.year();
      }
    }

    if (this.minDate) {
      if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
        month = this.minDate.month();
        year = this.minDate.year();
      }
    }

    if (this.maxDate) {
      if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
        month = this.maxDate.month();
        year = this.maxDate.year();
      }
    }

    if (isLeft) {
      this.leftCalendar.month.month(month).year(year);
      if (this.linkedCalendars)
        this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
    } else {
      this.rightCalendar.month.month(month).year(year);
      if (this.linkedCalendars)
        this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
    }
    this.updateCalendars();
  }

  /*monthOrYearChanged(e) {
    var isLeft = $(e.target).closest('.drp-calendar').hasClass('left'),
      leftOrRight = isLeft ? 'left' : 'right',
      cal = this.container.find('.drp-calendar.' + leftOrRight);

    // Month must be Number for new moment versions
    var month = parseInt(cal.find('.monthselect').val(), 10);
    var year = cal.find('.yearselect').val();

    if (!isLeft) {
      if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
        month = this.startDate.month();
        year = this.startDate.year();
      }
    }

    if (this.minDate) {
      if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
        month = this.minDate.month();
        year = this.minDate.year();
      }
    }

    if (this.maxDate) {
      if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
        month = this.maxDate.month();
        year = this.maxDate.year();
      }
    }

    if (isLeft) {
      this.leftCalendar.month.month(month).year(year);
      if (this.linkedCalendars)
        this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
    } else {
      this.rightCalendar.month.month(month).year(year);
      if (this.linkedCalendars)
        this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
    }
    this.updateCalendars();
    this.cd.detectChanges();
  }*/

  timeChanged(e) {
    const cal = $(e.target).closest('.drp-calendar');
    const isLeft = cal.hasClass('left');

    const hourselect = String(cal.find('.hourselect').val());
    let hour = parseInt(hourselect, 10);
    const minuteselect = String(cal.find('.minuteselect').val());
    let minute = parseInt(minuteselect, 10);
    if (isNaN(minute)) {
      const minuteselectOption = String(cal.find('.minuteselect option:last').val());
      minute = parseInt(minuteselectOption, 10);
    }
    const secondselect = String(cal.find('.secondselect').val());
    const second = this.timePickerSeconds ? parseInt(secondselect, 10) : 0;

    if (!this.timePicker24Hour) {
      var ampm = cal.find('.ampmselect').val();
      if (ampm === 'PM' && hour < 12)
        hour += 12;
      if (ampm === 'AM' && hour === 12)
        hour = 0;
    }

    if (isLeft) {
      var start = this.startDate.clone();
      start.hour(hour);
      start.minute(minute);
      start.second(second);
      this.setStartDate(start);
      if (!this.isRangeMode) {
        this.endDate = this.startDate.clone();
      } else if (this.endDate && this.endDate.format('DD.MM.YYYY') == start.format('DD.MM.YYYY') && this.endDate.isBefore(start)) {
        this.setEndDate(start.clone());
      }
    } else if (this.endDate) {
      var end = this.endDate.clone();
      end.hour(hour);
      end.minute(minute);
      end.second(second);
      this.setEndDate(end);
    }

    //update the calendars so all clickable dates reflect the new time component
    this.updateCalendars();

    //update the form inputs above the calendars with the new time
    this.updateFormInputs();

    //re-render the time pickers because changing one selection can affect what's enabled in another
    this.renderTimePicker('left');
    this.renderTimePicker('right');

  }

  elementChanged() {
    if (!this.element.is('input')) return;
    if (!this.element.val().length) return;

    var dateString = this.element.val().split(this.locale.separator),
      start = null,
      end = null;

    if (dateString.length === 2) {
      start = moment(dateString[0], this.locale.format);
      end = moment(dateString[1], this.locale.format);
    }

    if (!this.isRangeMode || start === null || end === null) {
      start = moment(this.element.val(), this.locale.format);
      end = start;
    }

    if (!start.isValid() || !end.isValid()) return;

    this.setStartDate(start);
    this.setEndDate(end);
    this.updateView();
  }

  keydown(e) {
    //hide on tab or enter
    if ((e.keyCode === 9) || (e.keyCode === 13)) {
      this.hide(e);
    }

    //hide on esc and prevent propagation
    if (e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();

      this.hide(e);
    }
  }

  updateElement() {
    if (this.element.is('input') && this.autoUpdateInput) {
      var newValue = this.startDate.format(this.locale.format);
      if (this.isRangeMode) {
        newValue += this.locale.separator + this.endDate.format(this.locale.format);
      }
      if (newValue !== this.element.val()) {
        this.element.val(newValue).trigger('change');
      }
    }
  }

  remove() {
    this.container.remove();
    this.element.off('.daterangepicker');
    this.element.removeData();
  }

  isInvalidDate(fake) {
    return false;
  }

  isCustomDate(fake) {
    return false;
  }

  /*$_fn_daterangepicker(options, callback) {
    var implementOptions = $.extend(true, {}, $.fn.daterangepicker.defaultOptions, options);
    this.each(function () {
      var el = $(this);
      if (el.data('daterangepicker'))
        el.data('daterangepicker').remove();
      el.data('daterangepicker', new DateRangePicker(el, implementOptions, callback));
    });
    return this;
  }*/

}
