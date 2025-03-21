import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  constructor(private service: ApiService) { }
  ngOnInit(): void {
  }

  backgroundUrl = 'assets/wallpaper.jpg';
  balance = 2500;
  isModalOpen: boolean = false;
  errorMessage: any;
  successmsg: any;

  texts = {
    sr: ['Dnevna karta', 'Mesečna karta', 'Novčanik', 'Vidi stanje karte'],
    en: ['Day card', 'Month card', 'Wallet', 'Check membership status']
  };

  currentText = this.texts.sr;

  membershipForm = new FormGroup({
    'email': new FormControl('', Validators.required),
  })

  changeLanguage(lang: 'sr' | 'en') {
    this.currentText = this.texts[lang];
  }

  selectTicket(type: string) {
    this.service.setTicketType(type);
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = false;
    this.successmsg = false;
    this.membershipForm.reset();
  }

  openModal() {
    this.isModalOpen = true;
  }

  membershipCheck() {
    if (this.membershipForm.valid) {
      this.service.checkMembership(this.membershipForm.value).subscribe((res) => {
        if (res.message == 'Uspesno') {
          this.errorMessage = false;
          const originalDate = res.user.datum_isteka_clanstva;
          const dateObj = new Date(originalDate);
          const formattedDate = dateObj.toLocaleDateString('sr-RS');
          this.successmsg = `E-mail: ${res.user.email} <br> 
          Datum isteka: ${formattedDate} <br> 
          Broj ulazaka: ${res.user.broj_ulazaka}`;
          this.membershipForm = new FormGroup({
            'email': new FormControl('', Validators.required),
          });
        } else {
          this.errorMessage = res.message;
        }
      })
    } else {
      this.errorMessage = 'Morate popuniti polje !';
    }
  }

}
