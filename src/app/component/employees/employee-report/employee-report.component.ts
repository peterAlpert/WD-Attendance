import { Component } from '@angular/core';
import { CalendarService } from '../../../services/calendar.service';
import { ActivatedRoute } from '@angular/router';
import { DayStatus } from '../../../models/day-status';
import { EmpoleeService } from '../../../services/empolee.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-report.component.html',
  styleUrl: './employee-report.component.css'
})
export class EmployeeReportComponent {

  employeeId!: string | null;
  employee: any = {};
  allDays: any[] = [];
  weekSummary: any = {};

  yearSummary: any = {};
  annualLeave: number = 0;

  annualRemaining = 0;
  casualRemaining = 0;

  openedDay: string = 'السبت';

  yearChart: any;
  weekChart: any;

  leaveDetails: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private _calendarService: CalendarService,
    private _EmployeeService: EmpoleeService
  ) { }

  ngOnInit() {

    this.employeeId = this.route.snapshot.paramMap.get('id');

    forkJoin({
      emp: this._EmployeeService.getEmpoleeById(this.employeeId),
      days: this._calendarService.getDays(this.employeeId)
    }).subscribe(({ emp, days }) => {

      this.employee = emp;
      this.annualLeave = emp.annualLeave;

      this.allDays = days;

      this.calculateYearSummary();
      this.calculateRemaining();

      this.calculateWeekSummary();

      this.getLeaveDetails();

      this.renderYearChart();
      this.renderWeekChart();

    });

  }

  getLeaveDetails() {

    this.leaveDetails = this.allDays
      .filter(d =>
        d.status === DayStatus.Annual ||
        d.status === DayStatus.HalfAnnual ||
        d.status === DayStatus.Casual ||
        d.status === DayStatus.HalfCasual
      )
      .map(d => {

        const date = new Date(d.date);

        const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('ar-EG');

        let type = '';

        switch (d.status) {
          case DayStatus.Annual:
            type = 'سنوي';
            break;
          case DayStatus.HalfAnnual:
            type = 'نص سنوي';
            break;
          case DayStatus.Casual:
            type = 'عارضة';
            break;
          case DayStatus.HalfCasual:
            type = 'نص عارضة';
            break;
        }

        return {
          day: dayName,
          date: formattedDate,
          type,
          rawDate: date,
          timeSlot:
            d.status === DayStatus.HalfAnnual || d.status === DayStatus.HalfCasual
              ? (d.timeSlot || '—') // 👈 لو عندك time في الداتا
              : '--'
        };

      }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());


  }

  renderYearChart() {

    if (this.yearChart) this.yearChart.destroy();

    this.yearChart = new Chart('yearChart', {
      type: 'pie',
      data: {
        labels: ['شغل', 'راحة', 'سنوي', 'عارضة'],
        datasets: [{
          data: [
            this.yearSummary.work,
            this.yearSummary.rest,
            this.yearSummary.annual,
            this.yearSummary.casual
          ],
          backgroundColor: [
            '#198754', // شغل
            '#0d6efd', // راحة
            '#ffc107', // سنوي
            '#6c757d'  // عارضة
          ]
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000
        }
      }
    });

  }

  renderWeekChart() {

    if (this.weekChart) this.weekChart.destroy();

    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    this.weekChart = new Chart('weekChart', {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'راحة',
            data: days.map(d => this.weekSummary[d]?.rest || 0),
            backgroundColor: '#0d6efd'
          },
          {
            label: 'عارضة',
            data: days.map(d => this.weekSummary[d]?.casual || 0),
            backgroundColor: '#6c757d'
          }
        ]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000
        }
      }
    });

  }

  calculateWeekSummary() {

    const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    this.weekSummary = {};

    daysMap.forEach((dayName, index) => {

      const daysOfWeek = this.allDays.filter(d => {
        const date = new Date(d.date);
        return date.getDay() === index;
      });

      this.weekSummary[dayName] = {
        work: daysOfWeek.filter(d => d.status === DayStatus.Work).length,
        rest: daysOfWeek.filter(d => d.status === DayStatus.Rest).length,

        annual:
          daysOfWeek.filter(d => d.status === DayStatus.Annual).length +
          daysOfWeek.filter(d => d.status === DayStatus.HalfAnnual).length * 0.5,

        casual:
          daysOfWeek.filter(d => d.status === DayStatus.Casual).length +
          daysOfWeek.filter(d => d.status === DayStatus.HalfCasual).length * 0.5
      };

    });

  }

  editAnnualLeave() {
    this._EmployeeService.editAnnualLeave(this.employeeId, 24)
      .subscribe(res => {
        console.log('Annual leave updated successfully', res);
      });

  }

  calculateYearSummary() {

    this.yearSummary = {

      work: this.allDays.filter(d => d.status === DayStatus.Work).length,
      rest: this.allDays.filter(d => d.status === DayStatus.Rest).length,

      annual:
        this.allDays.filter(d => d.status === DayStatus.Annual).length +
        this.allDays.filter(d => d.status === DayStatus.HalfAnnual).length * 0.5,

      casual:
        this.allDays.filter(d => d.status === DayStatus.Casual).length +
        this.allDays.filter(d => d.status === DayStatus.HalfCasual).length * 0.5

    };

  }

  calculateRemaining() {

    const annualUsed = this.yearSummary.annual;
    const casualUsed = this.yearSummary.casual;

    this.annualRemaining = this.annualLeave - annualUsed;
    this.casualRemaining = 6 - casualUsed;

  }

  toggleDay(day: string) {
    this.openedDay = this.openedDay === day ? '' : day;
  }

}
