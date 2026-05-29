import LoginForm from '../components/auth/LoginForm';
import Card from '../components/ui/Card';
import Head from 'next/head';

export default function Login() {
  return (
    <>
      <Head>
        <title>Masuk | Smart EcoKids</title>
        <meta name="description" content="Masuk ke akun Smart EcoKids Anda untuk mulai mendeteksi sampah dan belajar tentang kelestarian lingkungan." />
      </Head>
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 select-none">
        <Card className="w-full max-w-md p-8 sm:p-10 shadow-xl border-3 border-primary-bg/50">
          <LoginForm />
        </Card>
      </div>
    </>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

// Redirect if already authenticated
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (session && session.user) {
    const destination = session.user.role === 'guru' ? '/dashboard/teacher' : '/dashboard/student';
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
