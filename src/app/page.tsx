
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
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero7 = ({
  heading = "Welcome to Amulya",
  description = "A secure, modern, and trustworthy digital platform for all your financial needs. Join our cooperative society to grow with us.",
  button = {
    text: "Get Started",
    url: "/signup",
  },
  reviews = {
    count: 200,
    avatars: [
      {
        src: "https://placehold.co/100x100.png",
        alt: "Avatar 1",
      },
      {
        src: "https://placehold.co/100x100.png",
        alt: "Avatar 2",
      },
      {
        src: "https://placehold.co/100x100.png",
        alt: "Avatar 3",
      },
      {
        src: "https://placehold.co/100x100.png",
        alt: "Avatar 4",
      },
      {
        src: "https://placehold.co/100x100.png",
        alt: "Avatar 5",
      },
    ],
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
        <div className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
          <span className="mx-4 inline-flex items-center -space-x-4">
            {reviews.avatars.map((avatar, index) => (
              <Avatar key={index} className="size-14 border">
                <AvatarImage src={avatar.src} alt={avatar.alt} />
                <AvatarFallback>{avatar.alt.slice(-2)}</AvatarFallback>
              </Avatar>
            ))}
          </span>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className="size-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-left font-medium text-muted-foreground">
              from {reviews.count}+ reviews
            </p>
          </div>
        </div>
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
