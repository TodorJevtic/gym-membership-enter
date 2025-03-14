import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  constructor(private userService: UserService, private router: Router){}
  ngOnInit(): void {
  }
  backgroundUrl = 'assets/wallpaper.jpg';
  errorMessage: any;
  successmsg: any;

  userLoginForm = new FormGroup({
    'email': new FormControl('', Validators.required),
    'password': new FormControl('', Validators.required),
  })

  login() {
    if (this.userLoginForm.valid) {
      this.userService.login(this.userLoginForm.value).subscribe(
        (res) => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.router.navigate(['/admin']);
          } else {
            this.errorMessage = res.message;
          }
        },
        (err) => {
          this.errorMessage = 'Greška prilikom prijave!';
        }
      );
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena!';
    }
  }
}
