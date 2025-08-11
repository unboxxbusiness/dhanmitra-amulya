
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Star } from "lucide-react";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Hero7Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
}

const Hero7 = ({
  heading = "अमूल्य: जहाँ आपके पैसे बढ़ें, सपने पूरे हों और परिवार खुशहाल बने!",
  description = "अमूल्य से जुड़िए और पाएं आसान बचत, भरोसेमंद लोन और हर कदम पर साथ — ताकि आपका और आपके परिवार का भविष्य हो मजबूत और सुरक्षित।",
  button = {
    text: "Get Started",
    url: "/signup",
  },
}: Hero7Props) => {
  return (
    <section className="py-32">
      <div className="container text-center">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-6">
          <h1 className="text-3xl font-extrabold lg:text-6xl">{heading}</h1>
          <p className="text-balance text-muted-foreground lg:text-lg">
            {description}
          </p>
        </div>
        <Button asChild size="lg" className="mt-10">
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

  return <Hero7 />;
}
