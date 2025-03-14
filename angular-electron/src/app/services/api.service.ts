import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  apiUrl = 'http://localhost:5000/user';
  apiUrlAllUsers = 'http://localhost:5000/users';
  buyTicketUrl = 'http://localhost:5000/buyTicket';

  private selectedTicketType = new BehaviorSubject<string>('');
  selectedTicketType$ = this.selectedTicketType.asObservable();

  setTicketType(type: string) {
    this.selectedTicketType.next(type);
  }

  //get all data
  getAllData(): Observable<any> {
    return this.http.get(`${this.apiUrlAllUsers}`)
  }

  //create data
  createData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data)
  }

  //delete data
  deleteData(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  //update data
  updateData(data: any, id: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data)
  }

  //get single data 
  getSingleData(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }

  buyTicket(data: any): Observable<any> {
    return this.http.post(`${this.buyTicketUrl}`, data);
  }

}
