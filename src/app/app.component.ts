import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MainLayoutComponent } from "./component/layout/main-layout/main-layout.component";
import { HeaderComponent } from "./component/layout/header/header.component";
import { FooterComponent } from './component/layout/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'club-attendance';
  constructor(private router: Router) { }

  ngOnInit() {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const empId = localStorage.getItem('empId');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (role === 'Admin') {
      this.router.navigate(['/employees']);
      return;
    }

    if (role === 'Employee' && empId) {
      this.router.navigate(['/employees', empId]);
    }

  }
}
