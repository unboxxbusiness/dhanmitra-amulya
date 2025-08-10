
'use client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FileWarning } from "lucide-react";

interface KycViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  applicant: { name: string; email: string; } | null;
  kycDocs?: { id: string; photo: string; addressProof: string; };
}

export function KycViewerDialog({ isOpen, onOpenChange, applicant, kycDocs }: KycViewerDialogProps) {
  if (!applicant) return null;

  const hasDocs = kycDocs && kycDocs.id && kycDocs.photo && kycDocs.addressProof;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>KYC Verification for {applicant.name}</DialogTitle>
          <DialogDescription>
            Review the uploaded documents for {applicant.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full py-4">
            {hasDocs ? (
                <Tabs defaultValue="id" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="id">ID Document</TabsTrigger>
                        <TabsTrigger value="photo">Photo</TabsTrigger>
                        <TabsTrigger value="address">Address Proof</TabsTrigger>
                    </TabsList>
                    <TabsContent value="id" className="flex-1 mt-4">
                        <div className="relative w-full h-full">
                            <Image src={kycDocs.id} alt="ID Document" layout="fill" objectFit="contain" data-ai-hint="id card" />
                        </div>
                    </TabsContent>
                    <TabsContent value="photo" className="flex-1 mt-4">
                        <div className="relative w-full h-full">
                            <Image src={kycDocs.photo} alt="Applicant Photo" layout="fill" objectFit="contain" data-ai-hint="portrait photo" />
                        </div>
                    </TabsContent>
                    <TabsContent value="address" className="flex-1 mt-4">
                        <div className="relative w-full h-full">
                            <Image src={kycDocs.addressProof} alt="Address Proof" layout="fill" objectFit="contain" data-ai-hint="utility bill" />
                        </div>
                    </TabsContent>
                </Tabs>
            ) : (
                <Alert>
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>No KYC Documents Found</AlertTitle>
                    <AlertDescription>
                        This applicant did not submit any KYC documents during signup. KYC will need to be completed manually.
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
