import { EmpoleeData, EmpoleeService } from './../../../services/empolee.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { FilterByNamePipe } from '../../../filter-by-name.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FilterByNamePipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {

  employees: EmpoleeData[] = [];

  constructor(
    private _EmpoleeService: EmpoleeService,
    private _user: UserService,
    private router: Router
  ) {
    this._EmpoleeService.getEmpolees().subscribe({
      next: (data) => {
        this.employees = data.filter(emp => emp.role !== 'Admin')
          .sort((a, b) => a.sap - b.sap);
        console.log('Fetched employees', this.employees);
      },
      error: (err) => {
        console.error('Error fetching employees', err);
      }
    });
  }
  ngOnInit(): void {
    this.showVisitCounter()
  }


  visitorCount = 0;
  searchText: string = '';

  showVisitCounter() {
    this._user.visitCount().subscribe({
      next: (visitCount) => {
        this.visitorCount = visitCount;
      },
      error: (err) => {
        console.error('Error fetching visit count', err);
      }
    });
  }

  animateCounter(finalValue: number) {
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = finalValue / steps;

    const interval = setInterval(() => {
      start += increment;

      if (start >= finalValue) {
        this.visitorCount = finalValue;
        clearInterval(interval);
      } else {
        this.visitorCount = Math.floor(start);
      }
    }, stepTime);
  }

}
