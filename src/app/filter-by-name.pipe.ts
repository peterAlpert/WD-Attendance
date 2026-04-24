import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName',
  standalone: true
})
export class FilterByNamePipe implements PipeTransform {

  transform(employees: any[], searchText: string): any[] {

    if (!searchText) return employees;

    return employees.filter(emp =>
      emp.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

}