export interface User {
    id: number;
    ime: string;
    prezime: string;
    email: string;
    password: string;
    broj_ulazaka: number;
    datum_pocetka_clanstva: string; // ISO string format datuma
    datum_isteka_clanstva: string;
    qr_kod: string;
    admin: boolean; // 1 -> true, 0 -> false
    trener: boolean; // 1 -> true, 0 -> false
  }