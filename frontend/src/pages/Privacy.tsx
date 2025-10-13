import { useTranslation } from 'react-i18next'

export default function Privacy() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-pepe-dark py-16">
      <div className="stage-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="display-2 mb-8 text-center">Datenschutzerklärung / Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8 mb-8">
              <h2 className="h2 mb-4">Deutsch</h2>
              
              <h3 className="h3 mb-4">1. Datenschutz auf einen Blick</h3>
              <h4 className="h4 mb-2">Allgemeine Hinweise</h4>
              <p className="body mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können.
              </p>

              <h4 className="h4 mb-2">Datenerfassung auf dieser Website</h4>
              <p className="body mb-4">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
                Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
              </p>

              <p className="body mb-4">
                <strong>Wie erfassen wir Ihre Daten?</strong><br />
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
                z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
              </p>

              <h3 className="h3 mb-4">2. Hosting</h3>
              <p className="body mb-4">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, 
                werden auf den Servern des Hosters gespeichert.
              </p>

              <h3 className="h3 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h3>
              <h4 className="h4 mb-2">Datenschutz</h4>
              <p className="body mb-4">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen 
                Datenschutzbestimmungen sowie dieser Datenschutzerklärung.
              </p>

              <h4 className="h4 mb-2">Kontaktformular</h4>
              <p className="body mb-4">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
                Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung 
                der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>

              <h4 className="h4 mb-2">Ihre Rechte</h4>
              <p className="body mb-4">
                Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck 
                Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, 
                die Berichtigung oder Löschung dieser Daten zu verlangen.
              </p>
            </div>

            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-8">
              <h2 className="h2 mb-4">English</h2>
              
              <h3 className="h3 mb-4">1. Data Protection at a Glance</h3>
              <h4 className="h4 mb-2">General Information</h4>
              <p className="body mb-4">
                The following gives a simple overview of what happens to your personal information when you visit 
                this website. Personal information is any data with which you could be personally identified.
              </p>

              <h4 className="h4 mb-2">Data Collection on this Website</h4>
              <p className="body mb-4">
                <strong>Who is responsible for data collection on this website?</strong><br />
                Data processing on this website is carried out by the website operator. 
                You can find their contact details in the legal notice on this website.
              </p>

              <h4 className="h4 mb-2">Your Rights</h4>
              <p className="body mb-4">
                You always have the right to request information about your stored data, its origin, 
                its recipients, and the purpose of its collection at no charge. You also have the right 
                to request that it be corrected or deleted.
              </p>

              <h3 className="h3 mb-4">2. Contact Forms</h3>
              <p className="body mb-4">
                Should you send us questions via the contact form, we will collect the data entered on the form, 
                including the contact details you provide, to answer your question and any follow-up questions.
              </p>

              <h3 className="h3 mb-4">3. Contact Information</h3>
              <p className="body mb-4">
                If you have questions about data protection, please contact us at: info@pepe-shows.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}