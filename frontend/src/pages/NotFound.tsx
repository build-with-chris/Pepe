import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6 px-6">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-500">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold">{t('notFound.title')}</h2>
        </div>
        
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          {t('notFound.description')}
        </p>
        
        <div className="pt-6">
          <Link 
            to="/home" 
            className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('notFound.homeButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}