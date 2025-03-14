import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-order-ticket',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-ticket.component.html',
  styleUrl: './order-ticket.component.css'
})
export class OrderTicketComponent implements OnInit {

  constructor(private service: ApiService) { }
  ngOnInit(): void {
  }

  backgroundUrl = 'assets/wallpaper.jpg';
  balance = 2500;
  errorMessage: any;
  successmsg: any;
  vrstaKarte: any;

  ticketBuyForm = new FormGroup({
    'ime': new FormControl('', Validators.required),
    'prezime': new FormControl('', Validators.required),
    'email': new FormControl('', Validators.required),
    'vrstaKarte': new FormControl('dnevna'),
  })

  loadTicketType() {
    this.service.selectedTicketType$.subscribe(type => {
      this.ticketBuyForm.patchValue({ vrstaKarte: type });
    });
  }

  ticketBuy() {
    this.loadTicketType();
    if (this.ticketBuyForm.valid) {
      this.service.buyTicket(this.ticketBuyForm.value).subscribe((res) => {
        if (res.message == 'Uspešno ste uplatili članarinu') {
          this.errorMessage = false;
          this.successmsg = res.message;
        } else {
          this.errorMessage = res.message;
        }
      })
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena!'
    }
  }
}
