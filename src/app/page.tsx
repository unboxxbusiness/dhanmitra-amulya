
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { ArrowRight, Lock, Landmark, BadgePercent } from "lucide-react";
import Link from "next/link";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Vortex } from "@/components/ui/vortex";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <Vortex
      backgroundColor="#030712"
      rangeY={800}
      particleCount={500}
      baseHue={230}
      className="flex items-center flex-col justify-center px-4 py-8 min-h-screen w-full"
    >
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
             <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
          अमूल्य सोसायटी
        </h1>
        <p className="max-w-xl mt-4 text-lg text-slate-400">
          विश्वास, सहयोग और समृद्धि का संगम
        </p>

        <Card className="max-w-3xl mt-8 shadow-lg bg-slate-900/80 border-slate-800 text-left text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold text-amber-400 text-center">
              💰 अमूल्य सोसायटी – विशेष बचत एवं वित्तीय सुविधा ऑफ़र (सीमित समय के लिए!)
            </CardTitle>
            <CardDescription className="text-center text-slate-400 pt-2">
              अपने सपनों को साकार करने का सुनहरा अवसर – आज ही शुरुआत करें! अमूल्य सोसायटी में नया मेंबरशिप अकाउंट खोलें और पाएं शानदार लाभ:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-sky-400"><Landmark className="h-5 w-5"/>बचत सुविधाएं</h3>
                      <ul className="text-sm space-y-2 text-slate-300 list-disc list-outside pl-5">
                          <li><strong>शून्य रजिस्ट्रेशन शुल्क:</strong> बिना किसी प्रारंभिक खर्च के खाता खोलें।</li>
                          <li>पहले 3 महीने नि:शुल्क मेंटेनेंस।</li>
                          <li>बचत राशि पर विशेष ब्याज दर।</li>
                          <li>लचीले जमा विकल्प – मासिक या साप्ताहिक।</li>
                          <li>24x7 ऑनलाइन पासबुक और ट्रांजैक्शन हिस्ट्री।</li>
                      </ul>
                  </div>
                   <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-green-400"><BadgePercent className="h-5 w-5"/>लोन एवं अन्य सुविधाएं</h3>
                      <ul className="text-sm space-y-2 text-slate-300 list-disc list-outside pl-5">
                          <li>व्यक्तिगत, व्यवसायिक और आपातकालीन लोन पर कम ब्याज दर।</li>
                          <li>आसान EMI और लचीले रीपेमेंट विकल्प।</li>
                          <li>पूर्व-स्वीकृत लोन सीमा (अकाउंट होल्डर्स के लिए)।</li>
                          <li>बीमा एवं निवेश योजनाओं में प्राथमिक सुविधा।</li>
                      </ul>
                  </div>
              </div>
              <div className="text-center bg-amber-900/50 text-amber-300 p-3 rounded-md border border-amber-800">
                   <p className="text-sm">📌 यह ऑफ़र केवल नए अकाउंट खोलने वाले सदस्यों के लिए मान्य है।</p>
                   <p className="font-bold">⏳ जल्दी करें — ऑफ़र 20 अक्टूबर 2025 तक ही उपलब्ध!</p>
              </div>
          </CardContent>
        </Card>


        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/signup">
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
           <Button asChild size="lg" variant="secondary">
            <Link href="/login">
              Login
            </Link>
          </Button>
        </div>
      </div>
    </Vortex>
  );
}
