import { useTranslation } from 'react-i18next'

export default function Terms() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-pepe-dark py-16">
      <div className="stage-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="display-2 mb-8 text-center">AGB / Terms of Service</h1>
          
          <div className="prose max-w-none">
            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8 mb-8">
              <h2 className="h2 mb-6">Allgemeine Geschäftsbedingungen (AGB)</h2>
              
              <h3 className="h3 mb-4">§ 1 Geltungsbereich</h3>
              <p className="body mb-4">
                Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen 
                PepeShows Entertainment GmbH (nachfolgend "Anbieter") und dem Kunden 
                über die Erbringung von Entertainment-Dienstleistungen.
              </p>

              <h3 className="h3 mb-4">§ 2 Vertragsschluss</h3>
              <p className="body mb-4">
                Der Vertrag kommt durch die Bestätigung der Buchungsanfrage durch den 
                Anbieter zustande. Alle Angebote des Anbieters sind freibleibend, 
                sofern nicht ausdrücklich anders vereinbart.
              </p>

              <h3 className="h3 mb-4">§ 3 Leistungen</h3>
              <p className="body mb-4">
                Der Anbieter erbringt Entertainment-Dienstleistungen in Form von 
                Künstleraufführungen, Shows und verwandten Dienstleistungen. 
                Art, Umfang und Dauer der Leistung richten sich nach der jeweiligen 
                Vereinbarung.
              </p>

              <h3 className="h3 mb-4">§ 4 Preise und Zahlung</h3>
              <p className="body mb-4">
                Die Preise verstehen sich als Nettopreise zuzüglich der gesetzlichen 
                Mehrwertsteuer. Die Zahlung erfolgt nach Rechnungsstellung binnen 
                14 Tagen ohne Abzug.
              </p>

              <h3 className="h3 mb-4">§ 5 Stornierung</h3>
              <p className="body mb-4">
                Stornierungen durch den Kunden sind jederzeit möglich. Bei Stornierungen 
                werden folgende Kosten berechnet:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1 text-pepe-t80">
                <li>Bis 30 Tage vor der Veranstaltung: kostenfrei</li>
                <li>29-15 Tage vor der Veranstaltung: 25% des Auftragswerts</li>
                <li>14-7 Tage vor der Veranstaltung: 50% des Auftragswerts</li>
                <li>6-1 Tag vor der Veranstaltung: 75% des Auftragswerts</li>
                <li>Am Tag der Veranstaltung: 100% des Auftragswerts</li>
              </ul>

              <h3 className="h3 mb-4">§ 6 Haftung</h3>
              <p className="body mb-4">
                Der Anbieter haftet nur für Schäden, die auf Vorsatz oder grober 
                Fahrlässigkeit beruhen. Die Haftung für mittelbare Schäden und 
                entgangenen Gewinn ist ausgeschlossen.
              </p>

              <h3 className="h3 mb-4">§ 7 Datenschutz</h3>
              <p className="body mb-4">
                Der Umgang mit personenbezogenen Daten erfolgt entsprechend unserer 
                Datenschutzerklärung und den geltenden datenschutzrechtlichen Bestimmungen.
              </p>

              <h3 className="h3 mb-4">§ 8 Schlussbestimmungen</h3>
              <p className="body mb-4">
                Es gilt deutsches Recht. Gerichtsstand ist Berlin. 
                Sollten einzelne Bestimmungen unwirksam sein, bleibt der übrige 
                Vertrag davon unberührt.
              </p>
            </div>

            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8">
              <h2 className="h2 mb-6">Terms of Service (English)</h2>
              
              <h3 className="h3 mb-4">§ 1 Scope of Application</h3>
              <p className="body mb-4">
                These General Terms and Conditions apply to all contracts between 
                PepeShows Entertainment GmbH (hereinafter "Provider") and the customer 
                for the provision of entertainment services.
              </p>

              <h3 className="h3 mb-4">§ 2 Contract Formation</h3>
              <p className="body mb-4">
                The contract is concluded through confirmation of the booking request 
                by the Provider. All offers by the Provider are subject to change 
                unless expressly agreed otherwise.
              </p>

              <h3 className="h3 mb-4">§ 3 Services</h3>
              <p className="body mb-4">
                The Provider provides entertainment services in the form of artist 
                performances, shows and related services. The type, scope and duration 
                of the service are determined by the respective agreement.
              </p>

              <h3 className="h3 mb-4">§ 4 Prices and Payment</h3>
              <p className="body mb-4">
                Prices are net prices plus statutory VAT. Payment is due within 
                14 days of invoicing without deduction.
              </p>

              <h3 className="h3 mb-4">§ 5 Cancellation</h3>
              <p className="body mb-4">
                Cancellations by the customer are possible at any time. 
                The following costs apply for cancellations:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1 text-pepe-t80">
                <li>Up to 30 days before the event: free of charge</li>
                <li>29-15 days before the event: 25% of the order value</li>
                <li>14-7 days before the event: 50% of the order value</li>
                <li>6-1 days before the event: 75% of the order value</li>
                <li>On the day of the event: 100% of the order value</li>
              </ul>

              <h3 className="h3 mb-4">§ 6 Liability</h3>
              <p className="body mb-4">
                The Provider is only liable for damages based on intent or gross 
                negligence. Liability for indirect damages and lost profits is excluded.
              </p>

              <h3 className="h3 mb-4">§ 7 Data Protection</h3>
              <p className="body mb-4">
                The handling of personal data is carried out in accordance with our 
                privacy policy and the applicable data protection regulations.
              </p>

              <h3 className="h3 mb-4">§ 8 Final Provisions</h3>
              <p className="body">
                German law applies. The place of jurisdiction is Berlin. 
                Should individual provisions be invalid, the remainder of the 
                contract remains unaffected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}