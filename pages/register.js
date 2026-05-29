import RegisterForm from '../components/auth/RegisterForm';
import Card from '../components/ui/Card';
import Head from 'next/head';

export default function Register() {
  return (
    <>
      <Head>
        <title>Daftar | Smart EcoKids</title>
        <meta name="description" content="Daftarkan akun Smart EcoKids Anda dan mulailah petualangan melestarikan lingkungan." />
      </Head>
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 select-none">
        <Card className="w-full max-w-xl p-8 sm:p-10 shadow-xl border-3 border-primary-bg/50">
          <RegisterForm />
        </Card>
      </div>
    </>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

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
