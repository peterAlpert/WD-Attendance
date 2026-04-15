import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + '/login';


  private loggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  loggedIn$ = this.loggedInSubject.asObservable();


  constructor(private http: HttpClient, private router: Router) { }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }


  saveEmpId(empId: string) {
    localStorage.setItem('empId', empId);
  }
  getEmpId(): string | null {
    return localStorage.getItem('empId');
  }

  saveRole(role: string) {
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  login(data: { userName: string; password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}`, data).subscribe({
        next: (res: any) => {
          localStorage.setItem('isLoggedIn', 'true');
          this.loggedInSubject.next(true); // نخبر كل الـ subscribers أن المستخدم سجل دخول
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('token');
    localStorage.removeItem('empId');
    localStorage.removeItem('role');
    this.loggedInSubject.next(false); // المستخدم سجل خروج
  }

  redirectUser() {

    const role = localStorage.getItem('role');
    const empId = localStorage.getItem('empId');

    if (role === 'Admin') {
      this.router.navigate(['/employees']);
      return;
    }

    if (role === 'Employee') {
      this.router.navigate(['/employees', empId]);
    }

  }

}