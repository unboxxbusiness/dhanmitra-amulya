import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { ArrowRight, Lock, Sparkles, Star, BadgeCheck, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4 py-8">
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-600">
        अमूल्य सोसायटी
      </h1>
      <p className="max-w-xl mt-4 text-lg text-muted-foreground">
        विश्वास, सहयोग और समृद्धि का संगम
      </p>

      <Card className="max-w-2xl mt-8 shadow-lg bg-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-primary">
            <Sparkles className="h-6 w-6" /> विशेष ऑफ़र – सीमित समय के लिए!
          </CardTitle>
          <CardDescription>अभी जुड़ें अमूल्य सोसायटी से और पाएं फ्री मेंबरशिप अकाउंट!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <ul className="text-left space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <span><strong>कोई रजिस्ट्रेशन शुल्क नहीं:</strong> अपनी बचत यात्रा बिना किसी लागत के शुरू करें।</span>
                </li>
                 <li className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                    <span><strong>आसान ऑनलाइन आवेदन:</strong> घर बैठे आराम से, कुछ ही मिनटों में आवेदन करें।</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                    <span><strong>तुरंत अकाउंट एक्टिवेशन:</strong> अनुमोदन के तुरंत बाद अपना अकाउंट एक्सेस करें।</span>
                </li>
            </ul>
             <p className="text-sm font-semibold pt-4">🕒 यह ऑफ़र केवल सीमित समय के लिए है! आज ही आवेदन करें और बनें हमारे विश्वसनीय समुदाय का हिस्सा।</p>
        </CardContent>
      </Card>


      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/signup">
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
         <Button asChild size="lg" variant="outline">
          <Link href="/login">
            Login
          </Link>
        </Button>
      </div>
    </div>
  );
}
