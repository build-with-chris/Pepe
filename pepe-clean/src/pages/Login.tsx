import { useTranslation } from 'react-i18next'
import { Login } from '@/components/login-form'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const { t } = useTranslation()
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-pepe-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img 
              src="/src/assets/Logos/icon_pepe.svg" 
              alt="Pepe Shows" 
              className="mx-auto h-16 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-pepe-white">
            Sign in to your account
          </h2>
        </div>
        
        <Login />
      </div>
    </main>
  )
}