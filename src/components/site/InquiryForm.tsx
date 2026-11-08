import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildInquiryMessage, inquirySchema, whatsappUrl, type Inquiry } from "@/lib/inquiry";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof Inquiry, string>>;

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function InquiryForm({
  services,
  whatsapp,
  defaultService,
}: {
  services: string[];
  whatsapp: string;
  defaultService?: string;
}) {
  const [values, setValues] = useState({
    name: "",
    mobile: "",
    service: defaultService && services.includes(defaultService) ? defaultService : "",
    eventDate: "",
    location: "",
    message: "",
  });
  const [date, setDate] = useState<Date>();
  const [errors, setErrors] = useState<Errors>({});
  const [dateOpen, setDateOpen] = useState(false);

  const set = (k: keyof typeof values, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Inquiry;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      toast.error("Please fill in all the required details.");
      return;
    }
    const url = whatsappUrl(whatsapp, buildInquiryMessage(parsed.data));
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;
    toast.success("Opening WhatsApp — just tap Send to deliver your inquiry.");
  };

  const field = "h-12 bg-ink/60 border-input focus-visible:border-gold";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Your Name" error={errors.name} htmlFor="name">
        <Input id="name" autoComplete="name" className={field} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" maxLength={80} />
      </Field>
      <Field label="Mobile Number" error={errors.mobile} htmlFor="mobile">
        <Input id="mobile" type="tel" inputMode="tel" autoComplete="tel" className={field} value={values.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="10-digit mobile number" maxLength={15} />
      </Field>
      <Field label="Photography Service" error={errors.service} htmlFor="service">
        <Select value={values.service} onValueChange={(v) => set("service", v)}>
          <SelectTrigger id="service" className={cn(field, "w-full")}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Event Date" error={errors.eventDate} htmlFor="eventDate">
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              id="eventDate"
              type="button"
              variant="outline"
              className={cn(field, "w-full justify-start font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="text-gold" />
              {date ? format(date, "PPP") : <span>Pick the event date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d);
                set("eventDate", d ? toISO(d) : "");
                setDateOpen(false);
              }}
              disabled={{ before: new Date() }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field label="Event Location" error={errors.location} htmlFor="location" className="sm:col-span-2">
        <Input id="location" className={field} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Venue, city" maxLength={150} />
      </Field>
      <Field label="Message" error={errors.message} htmlFor="message" className="sm:col-span-2">
        <Textarea id="message" rows={5} className="bg-ink/60 focus-visible:border-gold" value={values.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your event, timings and anything special…" maxLength={1000} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" variant="gold" size="xl" className="w-full sm:w-auto sm:px-12">
          <Send /> SEND INQUIRY
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">Your inquiry opens in WhatsApp, ready to send to us.</p>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="font-caps text-[0.65rem] text-gold">
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
