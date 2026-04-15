import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class EmployeeGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {

        const role = localStorage.getItem('role');
        const empId = localStorage.getItem('empId');
        const routeId = route.paramMap.get('id');

        if (role === 'Admin') {
            return true;
        }

        if (role === 'Employee' && empId === routeId) {
            return true;
        }

        this.router.navigate(['/employees', empId]);
        return false;
    }
}