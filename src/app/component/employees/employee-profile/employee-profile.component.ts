import { UserService } from './../../../services/user.service';
import { EmpoleeService } from './../../../services/empolee.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { YearCalendarComponent } from '../../attendance/year-calendar/year-calendar.component';
import { DayStatus } from '../../../models/day-status';
import { EmpoleeData } from '../../../services/empolee.service';
import { AuthService } from '../../../services/auth.service';
import { CalendarService } from '../../../services/calendar.service';


@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, YearCalendarComponent],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent implements OnInit {

  employeeId!: string | null;

  employee = {} as EmpoleeData;
  currentMonth = new Date().getMonth(); // الشهر الحالي
  allDays: any[] = [];

  annualLeaves = 0;
  annualRemaining = 0;
  casualRemaining = 0;


  constructor(private route: ActivatedRoute,
    private _EmpoleeService: EmpoleeService,
    private _AuthService: AuthService,
    private _user: UserService,
  ) {


  }
  ngOnInit(): void {

    const role = this._AuthService.getRole();

    if (role === 'Admin') {
      this.employeeId = this.route.snapshot.paramMap.get('id');
    } else {
      this.employeeId = this._AuthService.getEmpId();
    }

    this._EmpoleeService.getEmpoleeById(this.employeeId).subscribe({
      next: (data) => {
        this.employee = data;
        this.annualLeaves = this.employee.annualLeave;
      },
      error: (err) => {
        console.error('Error fetching employee', err);
      }
    });

    this._user.addVisit().subscribe(res => {
      console.log("عدد الزيارات:", res);
    });


  }

  summary = {
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
  };

  summaryItems = [
    { label: 'شغل', value: this.summary.work, bgClass: 'bg-success' },
    { label: 'راحة', value: this.summary.rest, bgClass: 'bg-primary' },
    { label: 'سنوي', value: this.summary.annual, bgClass: 'bg-warning text-dark' },
    { label: 'ن سنوي', value: this.summary.halfAnnual, bgClass: 'bg-warning opacity-75 text-dark' },
    { label: 'عارضة', value: this.summary.casual, bgClass: 'bg-secondary text-white' },
    { label: 'ن عارضة', value: this.summary.halfCasual, bgClass: 'bg-secondary opacity-75 text-white' },
    { label: 'بدل', value: this.summary.compensation, bgClass: 'bg-info text-dark' },
    { label: 'ساعتين', value: this.summary.twoHours, bgClass: 'bg-primary text-info opacity-75' },
    { label: 'غ بإذن', value: this.summary.absentWithPermission, bgClass: 'bg-dark text-white' },
    { label: 'غ بدون', value: this.summary.absentWithoutPermission, bgClass: 'bg-danger text-white' },
    { label: 'مرضي', value: this.summary.sick, bgClass: 'bg-danger text-white opacity-75' }
  ];

  calculateRemainingLeaves() {

    const annualUsed =
      this.allDays.filter(d => d.status === DayStatus.Annual).length +
      this.allDays.filter(d => d.status === DayStatus.HalfAnnual).length * 0.5;

    const casualUsed =
      this.allDays.filter(d => d.status === DayStatus.Casual).length +
      this.allDays.filter(d => d.status === DayStatus.HalfCasual).length * 0.5;

    this.annualRemaining = this.annualLeaves - annualUsed;
    this.casualRemaining = 6 - casualUsed;

  }


  updateSummaryItems() {
    this.summaryItems = [
      { label: 'شغل', value: this.summary.work, bgClass: 'bg-success' },
      { label: 'راحة', value: this.summary.rest, bgClass: 'bg-primary' },
      { label: 'سنوي', value: this.summary.annual, bgClass: 'bg-warning text-dark' },
      { label: 'ن سنوي', value: this.summary.halfAnnual, bgClass: 'bg-warning opacity-75 text-dark' },
      { label: 'عارضة', value: this.summary.casual, bgClass: 'bg-secondary text-white' },
      { label: 'ن عارضة', value: this.summary.halfCasual, bgClass: 'bg-secondary opacity-75 text-white' },
      { label: 'بدل', value: this.summary.compensation, bgClass: 'bg-info text-dark' },
      { label: 'ساعتين', value: this.summary.twoHours, bgClass: 'bg-primary text-info opacity-75' },
      { label: 'غ بإذن', value: this.summary.absentWithPermission, bgClass: 'bg-dark text-white' },
      { label: 'غ بدون', value: this.summary.absentWithoutPermission, bgClass: 'bg-danger text-white' },
      { label: 'مرضي', value: this.summary.sick, bgClass: 'bg-danger text-white opacity-75' }
    ];
  }

  calculateMonthSummary() {
    const monthDays = this.allDays.filter(d => {
      const month = Number(d.date.split('-')[1]) - 1;
      return month === this.currentMonth;
    });

    this.summary = {
      work: monthDays.filter(d => d.status === DayStatus.Work).length,
      rest: monthDays.filter(d => d.status === DayStatus.Rest).length,
      annual: monthDays.filter(d => d.status === DayStatus.Annual).length,
      halfAnnual: monthDays.filter(d => d.status === DayStatus.HalfAnnual).length,
      casual: monthDays.filter(d => d.status === DayStatus.Casual).length,
      halfCasual: monthDays.filter(d => d.status === DayStatus.HalfCasual).length,
      compensation: monthDays.filter(d => d.status === DayStatus.Compensation).length,
      twoHours: monthDays.filter(d => d.status === DayStatus.TwoHours).length,
      absentWithPermission: monthDays.filter(d => d.status === DayStatus.AbsentWithPermission).length,
      absentWithoutPermission: monthDays.filter(d => d.status === DayStatus.AbsentWithoutPermission).length,
      sick: monthDays.filter(d => d.status === DayStatus.Sick).length
    };

    this.updateSummaryItems();
  }

  onCalendarChanged(days: any[]) {
    this.allDays = days;
    this.calculateMonthSummary();
    this.calculateRemainingLeaves();
  }

  changeMonth(month: number) {
    this.currentMonth = month;
    this.calculateMonthSummary();
  }


  resetCounters() {
    Object.keys(this.summary).forEach(
      key => (this.summary as any)[key] = 0
    );
  }

}
