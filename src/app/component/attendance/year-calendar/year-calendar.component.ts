import { AuthService } from './../../../services/auth.service';
import { CalendarService, DayData } from './../../../services/calendar.service';
import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DayStatus } from '../../../models/day-status';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

registerLocaleData(localeAr);

@Component({
  selector: 'app-year-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './year-calendar.component.html',
  styleUrls: ['./year-calendar.component.css']
})
export class YearCalendarComponent implements OnInit, AfterViewInit {

  @Input() year = 2026;
  @Output() calendarChanged = new EventEmitter<DayData[]>();
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  @Output() monthChanged = new EventEmitter<number>();
  emitMonthDays(month: number) {
    this.monthChanged.emit(month);
  }

  holidays: any[] = [];
  selectedHoliday: any = null;

  constructor(private _calendarService: CalendarService,
    private route: ActivatedRoute,
    private _AuthService: AuthService
  ) { }



  DayStatus = DayStatus;
  selectedDate: string | null = null;
  dayStatusMap: Record<string, DayStatus> = {};
  calendarOptions: any;
  employeeId: string | null = '';
  isAdmin = false;
  lastClick = 0;

  currentMonth = new Date().getMonth();


  selectedStatus: DayStatus | null = null;
  selectedTimeSlot: string | null = null;

  halfTimeSlots = [
    { value: '1-5', label: 'من 1 إلى 5' },
    { value: '5-9', label: 'من 5 إلى 9' },
    { value: '3-7', label: 'من 3 إلى 7' },
    { value: '7-11', label: 'من 7 إلى 11' },
  ];


  // خريطة الألوان من Bootstrap
  statusClasses: Record<DayStatus, string> = {
    work: 'bg-success text-white',
    rest: 'bg-primary text-white',
    annual: 'bg-warning text-white',
    "half-annual": 'bg-warning opacity-75 text-white',
    casual: 'bg-secondary text-white',
    "half-casual": 'bg-secondary opacity-75 text-white',
    compensation: 'bg-info text-white',
    '2-hours': 'bg-info text-white',
    'absent-with-permission': 'bg-dark text-white',
    'absent-without-permission': 'bg-danger text-white',
    sick: 'bg-danger text-white opacity-75'
  };

  // خريطة الأسماء العربية
  statusLabels: Record<DayStatus, string> = {
    work: 'ش',
    rest: 'ر',
    annual: 'س',
    "half-annual": 'س½',
    casual: 'ع',
    "half-casual": 'ع½',
    compensation: 'بدل',
    '2-hours': 'ساعتين',
    'absent-with-permission': 'غ/إذن',
    'absent-without-permission': 'غ/بدون',
    sick: 'م'
  };

  months = [
    { name: 'يناير', value: 0 },
    { name: 'فبراير', value: 1 },
    { name: 'مارس', value: 2 },
    { name: 'أبريل', value: 3 },
    { name: 'مايو', value: 4 },
    { name: 'يونيو', value: 5 },
    { name: 'يوليو', value: 6 },
    { name: 'أغسطس', value: 7 },
    { name: 'سبتمبر', value: 8 },
    { name: 'أكتوبر', value: 9 },
    { name: 'نوفمبر', value: 10 },
    { name: 'ديسمبر', value: 11 }
  ];

  goToMonth(month: number) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(new Date(this.year, month, 1));
  }


  ngOnInit(): void {
    this.initCalendar();
    this.employeeId = this._AuthService.getEmpId();
    console.log("Employee ID: " + this.employeeId);

    this.isAdmin = this._AuthService.getRole() === 'Admin';
    console.warn("Admin? " + this.isAdmin);

  }

  ngAfterViewInit(): void {
    this.loadDays();
  }

  openHalfModal(status: DayStatus) {
    this.selectedStatus = status;
    this.selectedTimeSlot = null;
  }

  confirmHalfStatus(timeSlot: string) {

    if (!this.selectedDate || !this.selectedStatus) return;

    this._calendarService.upsertDay(
      this.employeeId,
      this.selectedDate,
      this.selectedStatus,
      timeSlot
    ).subscribe(() => {

      // تحديث الكاليندر
      this.loadDays();

      // Reset
      this.selectedStatus = null;
      this.selectedDate = null;
      this.selectedTimeSlot = null;

    });

  }

  closeHalfModal() {
    this.selectedStatus = null;
  }

  getDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'ar',
      height: 'auto',
      aspectRatio: 1,
      initialDate: `${this.year}-01-01`,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      fixedWeekCount: false,
      dayMaxEventRows: 1,
      datesSet: (arg: any) => {
        const currentMonth = arg.view.currentStart.getMonth();
        this.emitMonthDays(currentMonth);
      },
      dateClick: (info: any) => {

        const clickedMonth = info.date.getMonth();
        const currentMonth = info.view.currentStart.getMonth();

        if (clickedMonth !== currentMonth) return;

        const date = info.dateStr;

        // 👇 لو اليوم عليه حالة متفتحش مودال
        if (this.dayStatusMap[date]) return;

        this.selectedDate = date;
      },
      events: [],

      // نستخدم eventContent عشان نتحكم في الشكل
      eventContent: (arg: any) => {
        const status: DayStatus = arg.event.extendedProps.status;
        const label = this.statusLabels[status];
        const classes = this.statusClasses[status] || '';

        const time = arg.event.extendedProps.timeSlot;
        const holidayDate = arg.event.extendedProps.holidayDate;



        // عنصر يحتوي الاسم العربي
        const wrapper = document.createElement('div');
        wrapper.className = `d-flex flex-column align-items-center justify-content-center ${classes}`;
        wrapper.style.width = '120%';
        wrapper.style.height = '120%';
        wrapper.style.borderRadius = '0px';

        if (time && (status === 'half-annual' || status === 'half-casual')) {
          const small = document.createElement('small');
          small.textContent = time;
          small.style.fontSize = '0.5rem';
          wrapper.appendChild(small);
        }

        const span = document.createElement('span');
        span.textContent = label;

        span.style.width = '40px';
        span.style.height = '25px';
        span.style.alignContent = 'center';
        span.style.fontSize = '0.75rem';
        span.style.fontWeight = '900';

        wrapper.appendChild(span);

        if (status === 'compensation' && holidayDate) {

          const date = new Date(holidayDate);
          const day = date.getDate();
          const month = date.getMonth() + 1;

          const small = document.createElement('small');
          small.textContent = `${day}/${month}`;
          small.style.fontSize = '0.6rem';
          small.style.fontWeight = 'bold';

          wrapper.appendChild(small);
        }

        // console.log(arg.event.extendedProps);

        return { domNodes: [wrapper] };
      },
      eventClick: (info: any) => {

        const date = info.event.startStr;

        if (this.isAdmin) return;

        // 👇 double click detection
        if (this.lastClick && (new Date().getTime() - this.lastClick < 300)) {

          this.lastClick = 0;

          this.onDoubleClick(date); // delete

          return;
        }

        this.lastClick = new Date().getTime();

        // ❌ مهم: لا تفتح مودال هنا
      }
    };
  }


  loadDays() {
    this._calendarService.getDays(this.employeeId).subscribe(days => {
      this.dayStatusMap = {};
      const events: any[] = [];

      days.forEach(d => {
        this.dayStatusMap[d.date] = d.status;
        // console.log(d);
        events.push({
          title: '',
          start: d.date,
          allDay: true,
          extendedProps: {
            status: d.status,
            timeSlot: d.timeSlot,
            holidayDate: d.holidayDate
          }
        });

      });

      if (this.calendarComponent?.getApi) {
        this.calendarComponent.getApi().removeAllEvents();
        this.calendarComponent.getApi().addEventSource(events);
      }

      // console.log(days);
      this.calendarChanged.emit(days);
    });
  }


  setStatus(status: DayStatus) {

    if (!this.selectedDate) return;
    if (this.isAdmin) return;

    if (status === DayStatus.Compensation) {
      this.openHolidayModal();
      return;
    }


    // لو الحالة نص يوم افتح اختيار الوقت
    if (status === DayStatus.HalfAnnual || status === DayStatus.HalfCasual) {
      this.openHalfModal(status);
      return;
    }

    // أي حالة تانية نمسح timeSlot
    this._calendarService.upsertDay(
      this.employeeId,
      this.selectedDate,
      status,
      null
    ).subscribe(() => {

      this.loadDays();

      this.selectedDate = null;
      this.selectedTimeSlot = null;

    });
  }



  close() {
    this.selectedDate = null;
  }

  openHolidayModal() {
    this._calendarService.getHolidays(this.employeeId)
      .subscribe(res => {
        this.holidays = res;
        this.selectedHoliday = true;
      });
  }
  closeHolidayModal() {
    this.selectedHoliday = null;
  }

  useHoliday(holiday: any) {

    Swal.fire({
      title: 'تأكيد اختيار البدل',
      text: `هل تريد استخدام بدل يوم: ${holiday.name} ؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم استخدمه',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d'
    }).then((result) => {

      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'جاري الحفظ...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // console.log("selectedDate:", this.selectedDate);
      // console.log("holiday:", holiday);

      // 1️⃣ استخدم العيد
      this._calendarService.useHoliday(this.employeeId, holiday.id)
        .subscribe(() => {

          // 2️⃣ سجل اليوم كـ بدل في الكاليندر
          this._calendarService.upsertDay(
            this.employeeId,
            this.selectedDate!,
            DayStatus.Compensation,
            null,
            holiday.date
          ).subscribe(() => {

            this.loadDays();

            Swal.fire({
              icon: 'success',
              title: 'تم بنجاح',
              text: 'تم تسجيل البدل بنجاح',
              timer: 1500,
              showConfirmButton: false
            });

            this.closeHolidayModal();
            this.selectedDate = null;

          });

        });

    });

  }

  onDoubleClick(date: string) {

    if (this.isAdmin) return;

    Swal.fire({
      title: 'حذف اليوم',
      text: 'هل تريد حذف حالة هذا اليوم؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم احذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {

      if (!result.isConfirmed) return;

      this._calendarService.deleteDay(this.employeeId, date)
        .subscribe(() => {

          this.loadDays();

          Swal.fire({
            icon: 'success',
            title: 'تم الحذف',
            timer: 1200,
            showConfirmButton: false
          });

        });

    });

  }


}
