import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  constructor(private service: ApiService) { }
  ngOnInit(): void {
  }

  backgroundUrl = 'assets/wallpaper.jpg';
  balance = 2500;

  texts = {
    sr: ['Dnevna karta', 'Mesečna karta', 'Novčanik'],
    en: ['Day card', 'Month card', 'Wallet']
  };

  currentText = this.texts.sr;

  changeLanguage(lang: 'sr' | 'en') {
    this.currentText = this.texts[lang];
  }

  selectTicket(type: string) {
    this.service.setTicketType(type);
  }
}
