import { redirect } from 'next/navigation';
import DefaultNavbar from './components/DefaultNavbar';

export default function Home() {
  redirect('/list');
}
