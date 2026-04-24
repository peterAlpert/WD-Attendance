import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DayStatus } from '../models/day-status';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface DayData {
  date: string;
  status: DayStatus;
  timeSlot?: string; // 👈 جديد (اختياري)
  holidayDate?: string; // 👈 جديد (اختياري)
}


@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private baseUrl = environment.apiUrl + '/calendar';
  private baseUrlHolidays = environment.apiUrl + '/holidays';

  constructor(private http: HttpClient) { }

  getDays(employeeId: string | null): Observable<DayData[]> {
    return this.http.get<DayData[]>(`${this.baseUrl}/${employeeId}`);
  }



  upsertDay(
    employeeId: string | null,
    date: string,
    status: DayStatus,
    timeSlot?: string | null,
    holidayDate?: string | null
  ) {
    return this.http.post(`${this.baseUrl}`, {
      employeeId,
      date,
      status,
      timeSlot,
      holidayDate // 👈 جديد
    });
  }

  getOfficialHolidays(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/official-holidays`
    );
  }

  getHolidays(employeeId: string | null): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrlHolidays}/${employeeId}`
    );
  }

  useHoliday(employeeId: string | null, holidayId: number) {
    return this.http.post(
      `${this.baseUrlHolidays}/use`,
      { employeeId, holidayId }
    );
  }


  getCompensationStatus(employeeId: string | null) {
    return this.http.get<any[]>(
      `${this.baseUrlHolidays}/compensation-status/${employeeId}`
    );
  }

  unuseHoliday(employeeId: number, holidayId: number) {
    return this.http.delete(
      `${this.baseUrlHolidays}/unuse?employeeId=${employeeId}&holidayId=${holidayId}`
    );
  }

  deleteDay(employeeId: string | null, date: string) {
    return this.http.delete(
      `${this.baseUrl}?employeeId=${employeeId}&date=${date}`
    );
  }


}