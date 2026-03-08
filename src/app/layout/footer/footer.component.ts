import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <footer class="pc-footer">
      <div class="pc-footer__top">

        <!-- Colonne 1 : Marque -->
        <div class="pc-footer__col pc-footer__brand">
          <div class="pc-footer__logo">🐾 PetCare</div>
          <p class="pc-footer__tagline">
            Le réseau d'entraide pour les propriétaires d'animaux — conseils, communauté et bienveillance.
          </p>
          <div class="pc-footer__socials">
            <a href="#" aria-label="Facebook" class="pc-social-btn">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="#" aria-label="Instagram" class="pc-social-btn">
              <mat-icon>photo_camera</mat-icon>
            </a>
            <a href="#" aria-label="Twitter" class="pc-social-btn">
              <mat-icon>alternate_email</mat-icon>
            </a>
          </div>
        </div>

        <!-- Colonne 2 : Navigation -->
        <div class="pc-footer__col">
          <h4 class="pc-footer__heading">Navigation</h4>
          <nav class="pc-footer__links">
            <a routerLink="/" class="pc-footer__link">
              <mat-icon>home</mat-icon> Accueil
            </a>
            <a routerLink="/publications" class="pc-footer__link">
              <mat-icon>article</mat-icon> Publications
            </a>
            <a routerLink="/profile" class="pc-footer__link">
              <mat-icon>person</mat-icon> Mon profil
            </a>
          </nav>
        </div>

        <!-- Colonne 3 : Contact -->
        <div class="pc-footer__col">
          <h4 class="pc-footer__heading">Contact</h4>
          <div class="pc-footer__contact-item">
            <mat-icon>email</mat-icon>
            <span>contact&#64;petcare.app</span>
          </div>
          <div class="pc-footer__contact-item">
            <mat-icon>location_on</mat-icon>
            <span>Tunisie, 2026</span>
          </div>
        </div>

      </div>

      <!-- Ligne basse -->
      <div class="pc-footer__bottom">
        <span>© 2026 PetCare — Tous droits réservés.</span>
        <span>Fait avec ❤️ pour les animaux</span>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Footer ── */
    .pc-footer {
      background: linear-gradient(135deg, #2d2b55 0%, #1e1e3a 100%);
      color: rgba(255,255,255,0.88);
      font-family: 'Poppins', 'Roboto', sans-serif;
      padding: 0;
    }

    .pc-footer__top {
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
      justify-content: space-between;
      padding: 48px 60px 32px;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* Colonnes */
    .pc-footer__col { flex: 1; min-width: 180px; }
    .pc-footer__brand { max-width: 300px; }

    /* Logo */
    .pc-footer__logo {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .pc-footer__tagline {
      font-size: 13px;
      line-height: 1.7;
      color: rgba(255,255,255,0.65);
      margin: 0 0 18px;
    }

    /* Réseaux sociaux */
    .pc-footer__socials { display: flex; gap: 10px; }
    .pc-social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: background 0.2s, transform 0.2s;
    }
    .pc-social-btn:hover {
      background: #6c63ff;
      color: #fff;
      transform: translateY(-2px);
      text-decoration: none;
    }
    .pc-social-btn mat-icon { font-size: 18px; width:18px; height:18px; }

    /* Titres colonnes */
    .pc-footer__heading {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,0.5);
      margin: 0 0 16px;
    }

    /* Liens navigation */
    .pc-footer__links { display: flex; flex-direction: column; gap: 10px; }
    .pc-footer__link {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: rgba(255,255,255,0.78);
      text-decoration: none;
      transition: color 0.2s, padding-left 0.2s;
    }
    .pc-footer__link mat-icon { font-size: 16px; width:16px; height:16px; }
    .pc-footer__link:hover {
      color: #a78bfa;
      padding-left: 4px;
      text-decoration: none;
    }

    /* Contact */
    .pc-footer__contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: rgba(255,255,255,0.78);
      margin-bottom: 12px;
    }
    .pc-footer__contact-item mat-icon { font-size: 17px; width:17px; height:17px; color: #a78bfa; }

    /* Barre inférieure */
    .pc-footer__bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px 60px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pc-footer__top { padding: 32px 20px 24px; gap: 28px; }
      .pc-footer__bottom { padding: 14px 20px; flex-direction: column; text-align: center; }
      .pc-footer__brand { max-width: 100%; }
    }
  `]
})
export class FooterComponent {}

