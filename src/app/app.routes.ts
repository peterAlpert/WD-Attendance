
import { Routes } from '@angular/router';
import { LoginComponent } from './component/Auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { CreateUserComponent } from './component/users/create-user/create-user.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './component/admin/admin-dashboard/admin-dashboard.component';
import { YearSummaryComponent } from './component/attendance/year-summary/year-summary.component';
import { EmployeeListComponent } from './component/employees/employee-list/employee-list.component';
import { EmployeeGuard } from './guards/employee.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'employees',
        loadComponent: () =>
            import('./component/employees/employee-list/employee-list.component')
                .then(m => m.EmployeeListComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'employees/:id',
        loadComponent: () =>
            import('./component/employees/employee-profile/employee-profile.component')
                .then(m => m.EmployeeProfileComponent),
        canActivate: [AuthGuard, EmployeeGuard]
    },
    {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'users', component: EmployeeListComponent },
            // { path: 'leaves', component: AdminLeavesComponent }
        ]
    },
    {
        path: 'employee-report/:id',
        loadComponent: () =>
            import('./component/employees/employee-report/employee-report.component')
                .then(m => m.EmployeeReportComponent),
        canActivate: [AuthGuard, EmployeeGuard],
    },
    {
        path: 'add-holiday',
        loadComponent: () =>
            import('./component/attendance/add-holiday/add-holiday.component')
                .then(m => m.AddHolidayComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    { path: 'login', component: LoginComponent },
    { path: 'addUser', component: CreateUserComponent, canActivate: [AuthGuard] },
    { path: 'yearSummary', component: YearSummaryComponent, canActivate: [AuthGuard] },
];
