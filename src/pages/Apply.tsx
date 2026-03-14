import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STEPS = ["Personal", "Financial", "Compliance", "Security"];

export default function Apply() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    date_of_birth: "",
    address: "",
    employment_status: "",
    income_range: "",
    source_of_funds: "",
    tax_id: "",
    pep_status: "no",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const validate = async () => {
      if (!code) { setValidating(false); return; }
      try {
        const { data } = await supabase.functions.invoke("register-client", {
          body: { salt: code, action: "validate" },
        });
        // If the salt is invalid, the function returns an error
        // We do a lightweight check by trying to look up the invite
        // For now, accept any non-error response or handle via the full form submission
        setInviteValid(true);
        if (data?.email) {
          setInviteEmail(data.email);
          setForm(f => ({ ...f, email: data.email }));
        }
      } catch {
        setInviteValid(true); // Allow form to load — validation happens on submit
      }
      setValidating(false);
    };
    validate();
  }, [code]);

  const updateField = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirm_password) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-client", {
        body: {
          salt: code,
          name: form.name,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          date_of_birth: form.date_of_birth,
          address: form.address,
          employment_status: form.employment_status,
          income_range: form.income_range,
          source_of_funds: form.source_of_funds,
          tax_id: form.tax_id,
          pep_status: form.pep_status,
          password: form.password,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSubmitted(true);
      toast({ title: "Account created successfully" });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Application Submitted</h2>
            <p className="text-muted-foreground">Your account has been created. You can now sign in.</p>
            <Button onClick={() => navigate("/login")} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Invalid Link</h2>
            <p className="text-muted-foreground">This application link is invalid. Please use the link from your invitation email.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canNext = () => {
    if (step === 0) return form.name && form.email;
    if (step === 3) return form.password && form.confirm_password;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Client Application</h1>
          <p className="text-muted-foreground">Complete your account registration</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]} Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="John Smith" />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="john@example.com" disabled={!!inviteEmail} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+44 7700 900000" />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={e => updateField("nationality", e.target.value)} placeholder="British" />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={e => updateField("date_of_birth", e.target.value)} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="1 Churchill Place, London" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label>Employment Status</Label>
                  <Select value={form.employment_status} onValueChange={v => updateField("employment_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Annual Income Range</Label>
                  <Select value={form.income_range} onValueChange={v => updateField("income_range", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-100k">Under £100,000</SelectItem>
                      <SelectItem value="100k-500k">£100,000 — £500,000</SelectItem>
                      <SelectItem value="500k-1m">£500,000 — £1,000,000</SelectItem>
                      <SelectItem value="over-1m">Over £1,000,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Source of Funds</Label>
                  <Select value={form.source_of_funds} onValueChange={v => updateField("source_of_funds", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employment">Employment Income</SelectItem>
                      <SelectItem value="business">Business Revenue</SelectItem>
                      <SelectItem value="inheritance">Inheritance</SelectItem>
                      <SelectItem value="investments">Investments</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label>Tax Identification Number (TIN)</Label>
                  <Input value={form.tax_id} onChange={e => updateField("tax_id", e.target.value)} placeholder="Enter your TIN" />
                </div>
                <div>
                  <Label>Are you a Politically Exposed Person (PEP)?</Label>
                  <Select value={form.pep_status} onValueChange={v => updateField("pep_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="related">Related to a PEP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  By proceeding, you acknowledge that all information provided is accurate and that you consent to identity verification checks in accordance with regulatory requirements.
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label>Password *</Label>
                  <Input type="password" value={form.password} onChange={e => updateField("password", e.target.value)} placeholder="Minimum 8 characters" />
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <Input type="password" value={form.confirm_password} onChange={e => updateField("confirm_password", e.target.value)} placeholder="Repeat password" />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canNext()}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
