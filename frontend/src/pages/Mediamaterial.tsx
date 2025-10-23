import { Download, FileText, Image as ImageIcon, Video, ExternalLink } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Mediamaterial() {
  const { t } = useTranslation();
  return (
    <main>
      {/* Hero Section */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <h1 className="display-1 display-gradient mb-8">
              {t('mediamaterial.hero.title')}
            </h1>
            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('mediamaterial.hero.subtitle')}
            </p>
            <p className="body-lg mb-12 max-w-4xl mx-auto text-pepe-t80">
              {t('mediamaterial.hero.description')}
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-xl">
                <Download className="w-5 h-5 mr-2" />
                {t('mediamaterial.hero.download_button')}
              </button>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                {t('mediamaterial.hero.youtube_button')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* General Media Section */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.general.title')}</h2>
          </div>

          <div className="media-grid">
            <div className="media-card">
              <div className="media-card-preview">
                <ImageIcon className="w-16 h-16 text-pepe-gold" />
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">{t('mediamaterial.general.logos.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                {t('mediamaterial.general.logos.description')}
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.logos.download_button')}
                </button>
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.logos.brand_guide_button')}
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-preview">
                <ImageIcon className="w-16 h-16 text-pepe-gold" />
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">{t('mediamaterial.general.headers.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                {t('mediamaterial.general.headers.description')}
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.headers.format_16_9')}
                </button>
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.headers.format_5_4')}
                </button>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-icon">
                <FileText className="w-16 h-16 text-pepe-gold" />
              </div>
              <h3 className="h3 mb-3">{t('mediamaterial.general.press.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                {t('mediamaterial.general.press.description')}
              </p>
              <div className="media-actions">
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.press.press_button')}
                </a>
                <a href="#" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.press.rider_button')}
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-icon">
                <Video className="w-16 h-16 text-pepe-gold" />
              </div>
              <h3 className="h3 mb-3">{t('mediamaterial.general.trailer.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                {t('mediamaterial.general.trailer.description')}
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.trailer.download_button')}
                </button>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.trailer.youtube_button')}
                </a>
              </div>
            </div>

            <div className="media-card">
              <div className="media-card-preview">
                <div className="w-16 h-16 bg-pepe-gold/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <span className="preview-label">Vorschau</span>
              </div>
              <h3 className="h3 mb-3">{t('mediamaterial.general.qr.title')}</h3>
              <p className="body-sm text-pepe-t60 mb-6">
                {t('mediamaterial.general.qr.description')}
              </p>
              <div className="media-actions">
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.qr.png_button')}
                </button>
                <button className="btn btn-primary btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('mediamaterial.general.qr.svg_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.disciplines.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto text-pepe-t80">
              {t('mediamaterial.disciplines.description')}
            </p>
          </div>

          <div className="disciplines-grid">
            <div className="discipline-card">
              <h3 className="h2 mb-3">{t('mediamaterial.disciplines.cyr_wheel.title')}</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                {t('mediamaterial.disciplines.cyr_wheel.description')}
              </p>
              <button className="btn btn-ghost">
                {t('mediamaterial.disciplines.expand_button')}
              </button>
            </div>

            <div className="discipline-card">
              <h3 className="h2 mb-3">{t('mediamaterial.disciplines.juggling.title')}</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                {t('mediamaterial.disciplines.juggling.description')}
              </p>
              <button className="btn btn-ghost">
                {t('mediamaterial.disciplines.expand_button')}
              </button>
            </div>

            <div className="discipline-card">
              <h3 className="h2 mb-3">{t('mediamaterial.disciplines.acrobatics.title')}</h3>
              <p className="body-lg text-pepe-t80 mb-6">
                {t('mediamaterial.disciplines.acrobatics.description')}
              </p>
              <button className="btn btn-ghost">
                {t('mediamaterial.disciplines.expand_button')}
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="btn btn-primary btn-lg">
              <Download className="w-5 h-5 mr-2" />
              {t('mediamaterial.disciplines.download_all_button')}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">{t('mediamaterial.cta.title')}</h2>
          <div className="cta-actions">
            <button className="btn btn-primary btn-xl">
              <Download className="w-5 h-5 mr-2" />
              {t('mediamaterial.cta.download_button')}
            </button>
            <a href="mailto:info@pepeshows.de" className="btn btn-ghost btn-lg">
              {t('mediamaterial.cta.questions_button')}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}