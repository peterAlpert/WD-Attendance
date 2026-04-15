import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private baseUrl = environment.apiUrl + '/attendance';

  constructor(private http: HttpClient) { }

  // 👈 ترجع أيام الكنترول الحالي فقط
  getMyDays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }
}
