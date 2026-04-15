import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {


  // isLoggedIn: boolean = false;
  empId: string | null = null;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.empId = this.authService.getEmpId();
  }

  // ngOnInit(): void {
  //   // نتابع التغيير في حالة تسجيل الدخول مباشرة
  //   this.authService.loggedIn$.subscribe(status => {
  //     this.isLoggedIn = status;
  //   });

  //   this.empId = this.authService.getEmpId();
  // }



  // logout() {

  //   Swal.fire({
  //     title: 'تسجيل الخروج',
  //     text: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#6c757d',
  //     confirmButtonText: 'نعم، خروج',
  //     cancelButtonText: 'إلغاء'
  //   }).then((result) => {

  //     if (result.isConfirmed) {

  //       localStorage.removeItem('token');
  //       localStorage.removeItem('empId');
  //       this.authService.logout();

  //       this.router.navigate(['/login']);

  //     }

  //   });

  // }
}
