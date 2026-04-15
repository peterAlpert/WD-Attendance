
// create-user.component.ts
import { Component } from '@angular/core';
import { CreateUserDto, UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent {
  user: CreateUserDto = {
    userName: '',
    password: '',
    role: '',
    employeeId: 0
  };

  constructor(
    private userService: UserService
  ) { }

  saveUser() {
    if (!this.user.userName || !this.user.password || !this.user.role || !this.user.employeeId) {
      Swal.fire('تحذير!', 'تاكد من ادخال البيانات', 'warning');
      return;
    }

    this.userService.createUser(this.user).subscribe({
      next: (res) => {
        Swal.fire('تم!', 'تم إنشاء المستخدم بنجاح', 'success');
        this.user = { userName: '', password: '', role: '', employeeId: 0 };
      },
      error: (err) => Swal.fire('خطأ!', 'حصل خطأ أثناء الإنشاء', 'error')
    });
  }
}
