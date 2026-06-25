import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CalendarService } from '../../../services/calendar.service';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-add-holiday',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-holiday.component.html',
  styleUrl: './add-holiday.component.css'
})
export class AddHolidayComponent {

  name = '';
  date = '';

  constructor(private attendanceService: AttendanceService) { }

  save() {

    if (!this.name || !this.date) {

      Swal.fire({
        icon: 'warning',
        title: 'اكمل البيانات'
      });

      return;
    }

    this.attendanceService.addHoliday({
      name: this.name,
      date: this.date
    }).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'تم إضافة البدل',
          timer: 1500,
          showConfirmButton: false
        });

        this.name = '';
        this.date = '';
      },

      error: () => {

        Swal.fire({
          icon: 'error',
          title: 'هذا التاريخ مسجل بالفعل'
        });

      }

    });

  }

}
