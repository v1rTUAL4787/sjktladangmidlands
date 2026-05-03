"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";

const RELATIONS = ["Mother", "Father", "Guardian", "Grandparent", "Other"];

export default function RegisterPage() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const [step, setStep] = useState<"auth" | "details" | "pending">("auth");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [relation, setRelation] = useState("Mother");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?register=1` },
    });
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^60\d{8,11}$/.test(whatsapp.replace(/\s/g, ""))) {
      setError("WhatsApp number must be in Malaysian format, e.g. 60123456789");
      setLoading(false);
      return;
    }

    if (!/^\d{12}$/.test(icNumber.replace(/-/g, ""))) {
      setError("IC number must be 12 digits");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, whatsapp, icNumber: icNumber.replace(/-/g, ""), relation }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
    } else {
      setStep("pending");
    }
  }

  if (step === "pending") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("pending_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">{t("pending_message")}</p>
          <div className="mt-4 text-center">
            <Link href="/" className="text-accent hover:underline text-sm">Return to homepage</Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "details") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("register_title")}</CardTitle>
          <CardDescription>Step 2: Enter your details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">{t("fullname_label")}</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("whatsapp_label")} *</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                placeholder={t("whatsapp_placeholder")} required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("ic_label")}</label>
              <Input value={icNumber} onChange={(e) => setIcNumber(e.target.value)}
                placeholder={t("ic_placeholder")} required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("relation_label")}</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {RELATIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            {error && <p className="text-sm text-crimson">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registering..." : t("register_button")}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("register_title")}</CardTitle>
        <CardDescription>{t("register_subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button variant="outline" onClick={handleGoogleSignup} className="w-full gap-2">
          <Chrome className="h-4 w-4" />
          {t("google_signin")}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">{t("login_title")}</Link>
        </div>
      </CardContent>
    </Card>
  );
}
