import LoginForm from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Sign In - Lead Alert Pro',
  description: 'Sign in to your Lead Alert Pro account'
}

export default async function LoginPage() {
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}