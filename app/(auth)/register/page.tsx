import RegisterForm from '@/components/auth/RegisterForm'
import { auth } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Sign Up - Lead Alert Pro',
  description: 'Create your Lead Alert Pro account'
}

export default async function RegisterPage() {
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return <RegisterForm />
}