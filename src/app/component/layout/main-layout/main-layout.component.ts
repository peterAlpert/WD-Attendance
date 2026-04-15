import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isLoggedIn: boolean = false;
  empId: string | null = null;
  role: string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    // نتابع التغيير في حالة تسجيل الدخول مباشرة
    this.authService.loggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.empId = this.authService.getEmpId();
    this.role = this.authService.getRole();
  }


  goBack() {
    this.location.back();
  }

  goYearSum() {
    this.router.navigate(['/yearSummary']);
  }

  goHome() {
    this.router.navigate(['/employees/' + this.empId]);
  }
  goEmpList() {
    this.router.navigate(['/employees']);
  }

  logout() {

    Swal.fire({
      title: 'تسجيل الخروج',
      text: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'نعم، خروج',
      cancelButtonText: 'إلغاء'
    }).then((result) => {

      if (result.isConfirmed) {

        localStorage.removeItem('token');
        localStorage.removeItem('empId');
        this.authService.logout();

        this.router.navigate(['/login']);
        window.location.reload();
      }

    });

  }

}
