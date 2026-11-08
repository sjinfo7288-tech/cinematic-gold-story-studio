import { useRef, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle2,
  ClipboardCopy,
  MessageCircle,
  PencilLine,
  RotateCcw,
  Send,
} from "lucide-react";
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
type Sent = { data: Inquiry; url: string; message: string; opened: boolean };

const FIELD_ORDER: (keyof Inquiry)[] = ["name", "mobile", "service", "eventDate", "location", "message"];
const FIELD_LABELS: Record<keyof Inquiry, string> = {
  name: "Your Name",
  mobile: "Mobile Number",
  service: "Photography Service",
  eventDate: "Event Date",
  location: "Event Location",
  message: "Message",
};

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const EMPTY = { name: "", mobile: "", service: "", eventDate: "", location: "", message: "" };

export function InquiryForm({
  services,
  whatsapp,
  defaultService,
}: {
  services: string[];
  whatsapp: string;
  defaultService?: string;
}) {
  const initialService = defaultService && services.includes(defaultService) ? defaultService : "";
  const [values, setValues] = useState({ ...EMPTY, service: initialService });
  const [date, setDate] = useState<Date>();
  const [errors, setErrors] = useState<Errors>({});
  const [dateOpen, setDateOpen] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

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
      // Bring the error summary into view so the visitor knows what to fix.
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        summaryRef.current?.focus({ preventScroll: true });
      });
      return;
    }
    setErrors({});
    const message = buildInquiryMessage(parsed.data);
    const url = whatsappUrl(whatsapp, message);
    // Open synchronously inside the click so phones don't block it.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    setSent({ data: parsed.data, url, message, opened: !!win });
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copyMessage = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.message);
      toast.success("Message copied. Paste it into WhatsApp.");
    } catch {
      toast.error("Couldn't copy automatically. Please use the WhatsApp button instead.");
    }
  };

  const reset = () => {
    setValues({ ...EMPTY, service: initialService });
    setDate(undefined);
    setSent(null);
  };

  const errorKeys = FIELD_ORDER.filter((k) => errors[k]);
  const field = (k: keyof Inquiry) =>
    cn("h-12 bg-ink/60 border-input focus-visible:border-gold", errors[k] && "border-destructive focus-visible:border-destructive");

  /* ---------- SUCCESS STATE ---------- */
  if (sent) {
    return (
      <div ref={topRef} role="status" aria-live="polite" className="animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
            <CheckCircle2 className="size-9" />
          </span>
          <h3 className="mt-5 text-3xl font-medium md:text-4xl">Your inquiry is ready in WhatsApp</h3>
          <p className="mt-3 max-w-md text-muted-foreground">
            {sent.opened
              ? "WhatsApp has opened with your message already written. Tap Send there to deliver it to us."
              : "WhatsApp didn't open automatically. Tap the green button below to open it with your message ready."}
          </p>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { n: 1, t: "Details checked", done: true },
            { n: 2, t: "WhatsApp opened", done: sent.opened },
            { n: 3, t: "Tap Send in WhatsApp", done: false },
          ].map((s) => (
            <li
              key={s.n}
              className={cn(
                "flex items-center gap-3 rounded-sm border p-3 text-sm",
                s.done ? "border-whatsapp/40 bg-whatsapp/10 text-foreground" : "border-gold/40 bg-accent text-accent-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  s.done ? "bg-whatsapp text-whatsapp-foreground" : "bg-gold text-primary-foreground",
                )}
              >
                {s.done ? "✓" : s.n}
              </span>
              {s.t}
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="whatsapp" size="xl" className="flex-1">
            <a href={sent.url} target="_blank" rel="noreferrer">
              <MessageCircle /> {sent.opened ? "Open WhatsApp again" : "Open WhatsApp"}
            </a>
          </Button>
          <Button type="button" variant="goldOutline" size="xl" onClick={copyMessage}>
            <ClipboardCopy /> Copy message
          </Button>
        </div>

        <div className="mt-8 rounded-sm border border-border bg-ink/50 p-5">
          <p className="font-caps text-[0.6rem] text-gold">Your inquiry</p>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {FIELD_ORDER.map((k) => (
              <div key={k} className={k === "message" ? "sm:col-span-2" : undefined}>
                <dt className="text-xs text-muted-foreground">{FIELD_LABELS[k]}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-foreground">
                  {k === "eventDate" && date ? format(date, "PPP") : sent.data[k]}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="ghost" onClick={() => setSent(null)}>
            <PencilLine /> Edit details
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw /> Send another inquiry
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- FORM ---------- */
  return (
    <div ref={topRef}>
      {/* How the WhatsApp handoff works */}
      <ol className="mb-8 grid gap-3 text-sm sm:grid-cols-3">
        {["Fill in your details", "We open WhatsApp with your message ready", "Tap Send to reach us"].map((t, i) => (
          <li key={t} className="flex items-center gap-3 rounded-sm border border-border bg-ink/40 p-3 text-foreground/85">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/60 text-xs font-semibold text-gold">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>

      {errorKeys.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-sm border border-destructive/60 bg-destructive/10 p-4 outline-none animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <AlertCircle className="size-5 text-destructive" />
            Please fix {errorKeys.length === 1 ? "1 detail" : `${errorKeys.length} details`} before sending
          </p>
          <ul className="mt-2 space-y-1 pl-7 text-sm text-foreground/85">
            {errorKeys.map((k) => (
              <li key={k}>
                <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => document.getElementById(k)?.focus()}>
                  {FIELD_LABELS[k]}: {errors[k]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
        <Field label={FIELD_LABELS.name} error={errors.name} htmlFor="name">
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} className={field("name")} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" maxLength={80} />
        </Field>
        <Field label={FIELD_LABELS.mobile} error={errors.mobile} htmlFor="mobile">
          <Input id="mobile" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.mobile} className={field("mobile")} value={values.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="10-digit mobile number" maxLength={15} />
        </Field>
        <Field label={FIELD_LABELS.service} error={errors.service} htmlFor="service">
          <Select value={values.service} onValueChange={(v) => set("service", v)}>
            <SelectTrigger id="service" aria-invalid={!!errors.service} className={cn(field("service"), "w-full")}>
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
        <Field label={FIELD_LABELS.eventDate} error={errors.eventDate} htmlFor="eventDate">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="eventDate"
                type="button"
                variant="outline"
                aria-invalid={!!errors.eventDate}
                className={cn(field("eventDate"), "w-full justify-start font-normal", !date && "text-muted-foreground")}
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
                autoFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field label={FIELD_LABELS.location} error={errors.location} htmlFor="location" className="sm:col-span-2">
          <Input id="location" aria-invalid={!!errors.location} className={field("location")} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Venue, city" maxLength={150} />
        </Field>
        <Field label={FIELD_LABELS.message} error={errors.message} htmlFor="message" className="sm:col-span-2">
          <Textarea id="message" rows={5} aria-invalid={!!errors.message} className={cn("bg-ink/60 focus-visible:border-gold", errors.message && "border-destructive")} value={values.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your event, timings and anything special…" maxLength={1000} />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold" size="xl" className="w-full sm:w-auto sm:px-12">
            <Send /> SEND INQUIRY
          </Button>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-whatsapp" />
            Clicking Send Inquiry opens WhatsApp with your details filled in. Nothing is sent until you tap Send in WhatsApp.
          </p>
        </div>
      </form>
    </div>
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
      <Label htmlFor={htmlFor} className={cn("font-caps text-[0.65rem]", error ? "text-destructive" : "text-gold")}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in duration-200">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
