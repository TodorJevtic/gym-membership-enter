import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-order-ticket',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-ticket.component.html',
  styleUrl: './order-ticket.component.css'
})
export class OrderTicketComponent implements OnInit {

  constructor(private service: ApiService, private router: Router) { }
  ngOnInit(): void {
  }

  backgroundUrl = 'assets/wallpaper.jpg';
  balance = 2500;
  errorMessage: any;
  successmsg: any;
  vrstaKarte: any;
  isModalOpen: boolean = false;

  timeLeft: number = 0;
  minutes: number = 5;
  seconds: number = 0;

  qrCodeImage: string | null = null;

  ticketBuyForm = new FormGroup({
    'ime': new FormControl('', Validators.required),
    'prezime': new FormControl('', Validators.required),
    'email': new FormControl('', Validators.required),
    'vrstaKarte': new FormControl('dnevna'),
  })

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = false;
    this.successmsg = false;
  }

  loadTicketType() {
    this.service.selectedTicketType$.subscribe(type => {
      this.ticketBuyForm.patchValue({ vrstaKarte: type });
    });
  }

  startTimer() {
    this.timeLeft = 300;
    setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.minutes = Math.floor(this.timeLeft / 60);
        this.seconds = this.timeLeft % 60;
      } else if (this.timeLeft == 0) {
        this.isModalOpen = false;
      }
    }, 1000);
  }

  ticketBuy() {
    this.loadTicketType();
    if (this.ticketBuyForm.valid) {
      this.service.buyTicket(this.ticketBuyForm.value).subscribe((res) => {
        if (res.message == 'Uspešno ste uplatili članarinu') {
          this.ticketBuyForm.reset();
          this.startTimer();
          this.errorMessage = false;
          this.isModalOpen = true;
          this.successmsg = res.message;
          if (res.qrCode) {
            this.qrCodeImage = res.qrCode;
          }
        } else {
          this.errorMessage = res.message;
        }
      })
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena!'
    }
  }
}
