import { Component } from '@angular/core';
import { CalendarService, DayData } from '../../../services/calendar.service';
import { AuthService } from '../../../services/auth.service';
import { DayStatus } from '../../../models/day-status';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-year-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './year-summary.component.html',
  styleUrl: './year-summary.component.css'
})
export class YearSummaryComponent {


  employeeId: string | null = null;
  allDays: DayData[] = [];
  // هيكل ملخص السنة
  yearSummary: { month: number, name: string, summary: any }[] = [];
  yearTotal: any = {};

  annualRemaining = 15;
  casualRemaining = 6;


  constructor(
    private _calendarService: CalendarService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    // ناخد EmployeeId زي صفحة البروفايل
    this.employeeId = this._authService.getEmpId();

    if (this.employeeId) {
      this._calendarService.getDays(this.employeeId).subscribe(days => {
        this.allDays = days;
        this.allDays = days;
        this.buildYearSummary();
        console.log('ملخص السنة:', this.yearSummary);
        console.log('إجمالي السنة:', this.yearTotal);
        console.log('All days of employee:', this.allDays);
      });
    }

    this.loadCompensations();

  }

  buildYearSummary() {

    // دالة لإعادة summary فارغ
    const emptySummary = () => ({
      work: 0,
      rest: 0,
      annual: 0,
      halfAnnual: 0,
      casual: 0,
      halfCasual: 0,
      compensation: 0,
      twoHours: 0,
      absentWithPermission: 0,
      absentWithoutPermission: 0,
      sick: 0
    });

    // 12 شهر
    this.yearSummary = Array.from({ length: 12 }, (_, month) => ({
      month,
      name: new Date(2026, month).toLocaleString('ar', { month: 'long' }),
      summary: emptySummary()
    }));


    this.yearTotal = emptySummary();

    // نجمع البيانات حسب الشهر
    this.allDays.forEach(d => {
      const date = new Date(d.date);
      const month = date.getMonth();
      const statusKey = this.mapStatusKey(d.status);

      if (!statusKey) return;

      this.yearSummary[month].summary[statusKey]++;
      this.yearTotal[statusKey]++;
    });

  }

  mapStatusKey(status: DayStatus): keyof typeof this.yearTotal | null {
    switch (status) {
      case DayStatus.Work: return 'work';
      case DayStatus.Rest: return 'rest';
      case DayStatus.Annual: return 'annual';
      case DayStatus.HalfAnnual: return 'halfAnnual';
      case DayStatus.Casual: return 'casual';
      case DayStatus.HalfCasual: return 'halfCasual';
      case DayStatus.Compensation: return 'compensation';
      case DayStatus.TwoHours: return 'twoHours';
      case DayStatus.AbsentWithPermission: return 'absentWithPermission';
      case DayStatus.AbsentWithoutPermission: return 'absentWithoutPermission';
      case DayStatus.Sick: return 'sick';
      default: return null;
    }
  }

  statusClasses: Record<string, string> = {
    work: 'bg-success text-white',
    rest: 'bg-primary text-white',
    annual: 'bg-warning text-dark',
    halfAnnual: 'bg-warning opacity-75 text-dark',
    casual: 'bg-secondary text-white',
    halfCasual: 'bg-secondary opacity-75 text-white',
    compensation: 'bg-info text-dark',
    twoHours: 'bg-info text-white opacity-75',
    absentWithPermission: 'bg-dark text-white',
    absentWithoutPermission: 'bg-danger text-white',
    sick: 'bg-danger text-white opacity-75'
  };


  summaryItems(summary: any) {
    return [
      { label: 'شغل', value: summary['work'], bgClass: this.statusClasses['work'] },
      { label: 'راحة', value: summary['rest'], bgClass: this.statusClasses['rest'] },
      { label: 'سنوي', value: summary['annual'], bgClass: this.statusClasses['annual'] },
      { label: 'ن سنوي', value: summary['halfAnnual'], bgClass: this.statusClasses['halfAnnual'] },
      { label: 'عارضة', value: summary['casual'], bgClass: this.statusClasses['casual'] },
      { label: 'ن عارضة', value: summary['halfCasual'], bgClass: this.statusClasses['halfCasual'] },
      { label: 'بدل', value: summary['compensation'], bgClass: this.statusClasses['compensation'] },
      { label: 'ساعتين', value: summary['twoHours'], bgClass: this.statusClasses['twoHours'] },
      { label: 'غ بإذن', value: summary['absentWithPermission'], bgClass: this.statusClasses['absentWithPermission'] },
      { label: 'غ بدون', value: summary['absentWithoutPermission'], bgClass: this.statusClasses['absentWithoutPermission'] },
      { label: 'مرضي', value: summary['sick'], bgClass: this.statusClasses['sick'] }
    ];
  }

  getMonthColor(month: number): string {
    const colors = [
      '#0d6efd', // يناير - أزرق
      '#198754', // فبراير - أخضر
      '#ffc107', // مارس - أصفر
      '#fd7e14', // أبريل - برتقالي
      '#6f42c1', // مايو - بنفسجي
      '#e83e8c', // يونيو - وردي
      '#0dcaf0', // يوليو - سماوي
      '#20c997', // أغسطس - زمردي
      '#6610f2', // سبتمبر - أرجواني غامق
      '#dc3545', // أكتوبر - أحمر
      '#6c757d', // نوفمبر - رمادي
      '#343a40'  // ديسمبر - داكن
    ];
    return colors[month] || '#0d6efd';
  }



  calculateRemainingLeaves() {

    const annualUsed =
      this.allDays.filter(d => d.status === DayStatus.Annual).length +
      this.allDays.filter(d => d.status === DayStatus.HalfAnnual).length * 0.5;

    const casualUsed =
      this.allDays.filter(d => d.status === DayStatus.Casual).length +
      this.allDays.filter(d => d.status === DayStatus.HalfCasual).length * 0.5;

    this.annualRemaining = 15 - annualUsed;
    this.casualRemaining = 6 - casualUsed;

  }

  compensations: any[] = [];

  loadCompensations() {
    this._calendarService.getHolidays(this.employeeId)
      .subscribe(res => {
        this.compensations = res;
        console.log(res);

      });
  }

}