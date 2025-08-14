
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Banknote, Book, HeartHandshake, Percent, ShieldCheck } from "lucide-react";

const features = [
    {
      icon: <Percent className="h-8 w-8 text-primary" />,
      text: "अपनी बचत खाते पर 9% तक का आकर्षक ब्याज पाएं।",
    },
    {
      icon: <Banknote className="h-8 w-8 text-primary" />,
      text: "आसान किस्तों और कम ब्याज दर पर तुरंत लोन की सुविधा।",
    },
    {
      icon: <Book className="h-8 w-8 text-primary" />,
      text: "आपके बच्चों की शिक्षा और विकास के लिए विशेष सहायता।",
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      text: "एक खास कम्युनिटी जहाँ परिवार के स्वास्थ्य का ख्याल रखा जाता है।",
    },
     {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      text: "एक मेंबरशिप में बचत, लोन, शिक्षा और स्वास्थ्य सुरक्षा पाएं।",
    },
  ];

interface HeroProps {
  heading?: string;
  button?: {
    text: string;
    url: string;
  };
}

const Hero = ({
  heading = "अमूल्य: आपका साथी",
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
          <div className="mt-6 grid max-w-3xl grid-cols-1 gap-x-6 gap-y-8 text-left sm:grid-cols-2 lg:gap-x-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <p className="text-lg text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
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
