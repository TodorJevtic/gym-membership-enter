import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  constructor(private service: ApiService, private userService: UserService, private router: Router) { }
  ngOnInit(): void {
    this.loadUsers()
  }
  errorMessage: any;
  successmsg: any;

  backgroundUrl = 'assets/wallpaper.jpg';
  brojKorisnika = 0;
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isModalOpenSecond: boolean = false;
  korisnici: any[] = [];
  singleKorisnik: any;

  loadUsers() {
    this.service.getAllData().subscribe((res) => {
      this.korisnici = res.data;
      this.brojKorisnika = res.data.length;
    })
  }

  loadSingleUser(id: any) {
    this.isModalOpenSecond = true;
    this.service.getSingleData(id).subscribe((res) => {
      this.singleKorisnik = res.data[0];
      this.userUpdateForm.patchValue({
        'ime': this.singleKorisnik.ime,
        'prezime': this.singleKorisnik.prezime,
        'email': this.singleKorisnik.email,
        'broj_ulazaka': this.singleKorisnik.broj_ulazaka,
      })
    })
  }

  filteredKorisnici() {
    return this.korisnici.filter(korisnik =>
      Object.values(korisnik).some(val =>
        val && typeof val === 'string' && val.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = false;
    this.successmsg = false;
  }
  openModal() {
    this.isModalOpen = true;
  }

  closeModalSecond() {
    this.isModalOpenSecond = false;
    this.errorMessage = false;
    this.successmsg = false;
  }

  userForm = new FormGroup({
    'ime': new FormControl('', Validators.required),
    'prezime': new FormControl('', Validators.required),
    'email': new FormControl('', Validators.required),
    'type': new FormControl('korisnik', Validators.required),
  })

  userUpdateForm = new FormGroup({
    'ime': new FormControl('', Validators.required),
    'prezime': new FormControl('', Validators.required),
    'email': new FormControl('', Validators.required),
    'broj_ulazaka': new FormControl('', Validators.required),
  })

  userSubmit() {
    if (this.userForm.valid) {
      this.service.createData(this.userForm.value).subscribe((res) => {
        if (res.message == 'Korisnik uspešno dodat') {
          this.errorMessage = false;
          this.successmsg = res.message;
          this.userForm = new FormGroup({
            'ime': new FormControl('', Validators.required),
            'prezime': new FormControl('', Validators.required),
            'email': new FormControl('', Validators.required),
            'type': new FormControl('korisnik', Validators.required),
          });
          this.loadUsers();
        } else {
          this.errorMessage = res.message;
        }
      })
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena !';
    }
  }

  userUpdate() {
    if (this.userUpdateForm.valid) {
      this.service.updateData(this.userUpdateForm.value, this.singleKorisnik.id).subscribe((res) => {
        this.successmsg = res.message;
        this.loadUsers();
      })
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena!'
    }
  }

  deleteUser(id: any) {
    this.service.deleteData(id).subscribe((res) => {
      this.loadUsers()
    })
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

}
