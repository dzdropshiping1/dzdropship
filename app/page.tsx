import { getCurrentUser } from '@/lib/auth';
import LandingClient from './LandingClient';

export default async function Home() {
  const session = await getCurrentUser();
  
  const initialUser = session ? {
    name: session.name,
    email: session.email
  } : null;

  return <LandingClient initialUser={initialUser} />;
}
