import { Mail, Phone, Fax, MapPin, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="bg-[#EEF7EE] min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/badge.png"
            alt="School Badge"
            className="h-28 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary">Sekolah Jenis Kebangsaan (Tamil) Ladang Midlands</h1>
            <p className="text-muted-foreground mt-1">SJK (T) Ladang Midlands</p>
          </div>
        </div>

        {/* School Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <School className="h-5 w-5" /> School Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">School Code</dt>
                <dd className="mt-0.5">BBD8463</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">PPD Office</dt>
                <dd className="mt-0.5">PPD Petaling Perdana</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">School Level</dt>
                <dd className="mt-0.5">Rendah (Primary)</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">School Type</dt>
                <dd className="mt-0.5">Jenis Kebangsaan (Tamil)</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">School Location</dt>
                <dd className="mt-0.5">Bandar</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" /> Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p>Jalan Plumbum 7/100</p>
                <p>40000 Shah Alam</p>
                <p>Selangor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href="tel:0355103239" className="hover:underline">03-5510 3239</a>
            </div>
            <div className="flex items-center gap-3">
              <Fax className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>03-5510 1745</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href="mailto:BBD8463@moe.edu.my" className="hover:underline">BBD8463@moe.edu.my</a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
