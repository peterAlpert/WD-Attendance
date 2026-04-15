import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface EmpoleeData {
  id: number;
  name: string;
  sap: number;
  job: string;
  role: string;
  annualLeave: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpoleeService {

  private baseUrl = environment.apiUrl + '/employees';

  constructor(private http: HttpClient) { }

  getEmpolees(): Observable<EmpoleeData[]> {
    return this.http.get<EmpoleeData[]>(`${this.baseUrl}/all`);
  }

  getEmpoleeById(id: string | null): Observable<EmpoleeData> {
    return this.http.get<EmpoleeData>(`${this.baseUrl}/${id}`);
  }

  editAnnualLeave(empId: string | null, newAnnualLeave: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-annual-leave?id=${empId}&days=${newAnnualLeave}`, {});
  }
}
