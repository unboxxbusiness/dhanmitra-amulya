import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4">
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-600">
        अमूल्य सोसायटी
      </h1>
      <p className="max-w-xl mt-4 text-lg text-muted-foreground">
        विश्वास, सहयोग और समृद्धि का संगम
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/login">
            Login
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
