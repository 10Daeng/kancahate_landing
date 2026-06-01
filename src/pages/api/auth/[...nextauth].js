// Pages Router NextAuth handler — satu-satunya handler auth di project ini.
// authOptions ada di src/lib/authOptions.js dan dipakai oleh getServerSession() di seluruh project.
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export { authOptions };
export default NextAuth(authOptions);
