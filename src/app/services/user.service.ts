// auth.service.ts أو user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface CreateUserDto {
  userName: string;
  password: string;
  role: string;
  employeeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users'; // عدل حسب البورت

  constructor(private http: HttpClient) { }

  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}
