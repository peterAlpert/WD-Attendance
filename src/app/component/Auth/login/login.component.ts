import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  userName = '';
  password = '';
  errorMessage = '';

  constructor(
    private _AuthService: AuthService
  ) { }

  login() {

    this.errorMessage = '';

    this._AuthService.login({
      userName: this.userName,
      password: this.password
    }).subscribe({
      next: res => {

        this._AuthService.saveToken(res.token);
        this._AuthService.saveEmpId(res.id);
        this._AuthService.saveRole(res.role);

        this._AuthService.redirectUser();

      },
      error: () => {
        this.errorMessage = 'اسم المستخدم أو كلمة السر غير صحيحة';
      }
    });

  }
}
