import { EmpoleeData, EmpoleeService } from './../../../services/empolee.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {

  employees: EmpoleeData[] = [];

  constructor(private _EmpoleeService: EmpoleeService) {
    this._EmpoleeService.getEmpolees().subscribe({
      next: (data) => {
        this.employees = data.filter(emp => emp.role !== 'Admin');
        console.log('Fetched employees', this.employees);
      },
      error: (err) => {
        console.error('Error fetching employees', err);
      }
    });
  }

}
