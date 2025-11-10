import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-impressum-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>gavel</mat-icon>
      Impressum
    </h2>
    <mat-dialog-content>
      <div class="impressum-content">
        <h3>Angaben gemäß § 5 TMG</h3>
        <p>
          <strong>Mario Muja</strong><br>
          Hohe Liedt 45 F<br>
          22417 Hamburg<br>
          Deutschland
        </p>

        <h3>Kontakt</h3>
        <p>
          <strong>Telefon Deutschland:</strong> <a href="tel:+4915204641473">+49 1520 464 1473</a><br>
          <strong>Telefon Italien:</strong> <a href="tel:+393453450098">+39 345 345 0098</a><br>
          <strong>E-Mail:</strong> <a href="mailto:mario.muja@gmail.com">mario.muja@gmail.com</a>
        </p>

        <h3>Haftungsausschluss</h3>
        
        <h4>Haftung für Inhalte</h4>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>

        <h4>Haftung für Links</h4>
        <p>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
        </p>

        <h4>Urheberrecht</h4>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
          Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>

        <h3>Datenschutz</h3>
        <p>
          Diese Webseite speichert keine personenbezogenen Daten. Es werden keine Cookies gesetzt 
          und keine Analysetools verwendet. Die Analyse der Webseiten erfolgt in Echtzeit und es 
          werden keine Daten gespeichert.
        </p>

        <h3>Technische Informationen</h3>
        <p>
          <strong>Web Inspector</strong><br>
          Version 1.0.0<br>
          © 2025 Mario Muja<br>
          Erstellt mit Angular und TypeScript<br>
          Gehostet auf Vercel
        </p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close color="primary">Schließen</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .impressum-content {
      max-width: 600px;
      line-height: 1.6;

      h3 {
        color: #667eea;
        margin-top: 24px;
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 500;
      }

      h4 {
        color: rgba(0, 0, 0, 0.87);
        margin-top: 16px;
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: 500;
      }

      p {
        margin-bottom: 12px;
        color: rgba(0, 0, 0, 0.7);
      }

      a {
        color: #667eea;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #667eea;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class ImpressumDialogComponent {}

