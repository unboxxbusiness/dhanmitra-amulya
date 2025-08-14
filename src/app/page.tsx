
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Banknote, Book, HeartHandshake, Percent, ShieldCheck } from "lucide-react";

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
}

const Hero = ({
  heading = "अमूल्य: आपका साथी",
  description = "अभी जुड़िए और पाएं अपनी बचत पर 9% ब्याज + आसान लोन सुविधा — अपने और अपने परिवार की खुशहाली की ओर पहला कदम!",
  button = {
    text: "आज ही जुड़ें",
    url: "/signup",
  },
}: HeroProps) => {
  return (
    <section className="py-24 sm:py-32">
      <div className="container text-center">
        <div className="mx-auto flex max-w-screen-lg flex-col items-center gap-8">
          <h1 className="text-4xl font-extrabold lg:text-6xl">{heading}</h1>
           <p className="text-balance text-muted-foreground lg:text-lg">
            {description}
          </p>
        </div>
        <Button asChild size="lg" className="mt-12">
          <Link href={button.url}>{button.text}</Link>
        </Button>
      </div>
    </section>
  );
};


export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return <Hero />;
}
