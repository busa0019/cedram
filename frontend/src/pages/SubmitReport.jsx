import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Upload,
  MapPin,
  CalendarDays,
  FileText,
  CheckCircle2,
  Mail,
  User,
  Info,
  FileImage,
  X,
  ClipboardList,
  ChevronDown,
  FileBadge,
  ArrowRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DISASTER_TYPES = [
  "Flood",
  "Fire",
  "Earthquake",
  "Windstorm",
  "Storm",
  "Landslide",
  "Drought",
  "Epidemic",
  "Outbreak",
  "Building Collapse",
  "Explosion",
  "Conflict / Violence",
  "Road Accident (Mass casualty)",
  "Other",
];

const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const today = new Date().toISOString().split("T")[0];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let num = bytes;

  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }

  return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileKind(file) {
  if (!file?.type) return "File";
  if (file.type.startsWith("image/")) return "Image";
  if (file.type.startsWith("video/")) return "Video";
  if (file.type === "application/pdf") return "PDF";
  return "File";
}

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-textmain placeholder:text-textmuted/70 outline-none transition-all duration-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15";

function FadeInSection({ children, delay = 0 }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function PageSectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-primary md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-textmuted">{subtitle}</p> : null}
    </div>
  );
}

function CardShell({ title, subtitle, right, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface/85 shadow-sm backdrop-blur-[2px]">
      {(title || subtitle || right) && (
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-start md:justify-between md:p-7">
          <div>
            {title ? <h2 className="text-lg font-semibold text-textmain md:text-xl">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-textmuted">{subtitle}</p> : null}
          </div>
          {right}
        </div>
      )}
      <div className="p-6 md:p-7">{children}</div>
    </div>
  );
}

function SectionTitle({ color = "bg-primary", title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className={classNames("h-8 w-1.5 rounded-full", color)} />
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={18} className="text-textmuted" /> : null}
        <h3 className="text-base font-semibold text-textmain">{title}</h3>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-textmain">
      {children}
    </label>
  );
}

function HelperText({ children }) {
  return <p className="mt-2 text-xs leading-relaxed text-textmuted">{children}</p>;
}

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-2 text-xs font-medium text-red-600">{children}</p>;
}

function InfoCard({ icon: Icon, title, children, tone = "default" }) {
  const toneMap = {
    default: "border-border bg-surface/85",
    accent: "border-border bg-muted/55",
    primary: "border-border bg-primary/[0.04]",
    caution: "border-accent/30 bg-accent/10",
  };

  return (
    <div className={classNames("rounded-3xl border p-5 shadow-sm backdrop-blur-[2px]", toneMap[tone])}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface">
            <Icon size={18} className="text-textmain" />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="font-semibold text-textmain">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-textmuted">{children}</div>
        </div>
      </div>
    </div>
  );
}

function AlertBox({ type = "error", children }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={classNames("rounded-2xl border px-4 py-3 text-sm shadow-sm", styles[type])}>
      {children}
    </div>
  );
}

function ProcessCard({ title, text, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/85 p-5 shadow-sm backdrop-blur-[2px] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
          {Icon ? <Icon size={18} /> : null}
        </div>
        <div>
          <div className="text-sm font-semibold text-textmain">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-textmuted">{text}</div>
        </div>
      </div>
    </div>
  );
}

const SelectField = forwardRef(function SelectField(
  { children, className = "", ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={classNames(inputBase, "appearance-none pr-11", className)}
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-textmuted"
      />
    </div>
  );
});

export default function SubmitReport() {
  const fileInputRef = useRef(null);
  const alertRef = useRef(null);

  const reporterNameRef = useRef(null);
  const reporterEmailRef = useRef(null);
  const disasterTypeRef = useRef(null);
  const incidentDateRef = useRef(null);
  const stateRef = useRef(null);
  const specificLocationRef = useRef(null);
  const descriptionRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    reporter_name: "",
    reporter_email: "",
    disaster_type: "",
    incident_date: "",
    state: "",
    specific_location: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileMsg, setFileMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const descriptionLen = form.description?.length || 0;
  const descriptionMax = 2000;

  const previews = useMemo(() => {
    return files.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      kind: getFileKind(f),
      isImage: f.type?.startsWith("image/"),
      isVideo: f.type?.startsWith("video/"),
      url:
        f.type?.startsWith("image/") || f.type?.startsWith("video/")
          ? URL.createObjectURL(f)
          : null,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

  const fieldRefs = {
    reporter_name: reporterNameRef,
    reporter_email: reporterEmailRef,
    disaster_type: disasterTypeRef,
    incident_date: incidentDateRef,
    state: stateRef,
    specific_location: specificLocationRef,
    description: descriptionRef,
  };

  const scrollToAlert = () => {
    setTimeout(() => {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const focusFirstErrorField = (errors) => {
    const order = [
      "reporter_name",
      "reporter_email",
      "disaster_type",
      "incident_date",
      "state",
      "specific_location",
      "description",
    ];

    const firstKey = order.find((key) => errors[key]);
    if (!firstKey) return;

    const ref = fieldRefs[firstKey];
    setTimeout(() => {
      ref?.current?.focus?.();
    }, 80);
  };

  const setFieldValue = (name, value) => {
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    setFieldValue(e.target.name, e.target.value);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.reporter_name.trim()) nextErrors.reporter_name = "Full name is required.";
    if (!form.reporter_email.trim()) nextErrors.reporter_email = "Email address is required.";
    if (!form.disaster_type) nextErrors.disaster_type = "Please select a disaster type.";
    if (!form.incident_date) nextErrors.incident_date = "Date of incident is required.";
    if (!form.state) nextErrors.state = "Please select a state.";
    if (!form.specific_location.trim()) nextErrors.specific_location = "Specific location is required.";
    if (!form.description.trim()) nextErrors.description = "Detailed description is required.";
    if (descriptionLen > descriptionMax) nextErrors.description = "Description is too long.";

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrorMsg(Object.values(nextErrors)[0]);
      scrollToAlert();
      focusFirstErrorField(nextErrors);
      return false;
    }

    return true;
  };

  const addFiles = (incoming) => {
    const arr = Array.from(incoming || []);
    if (arr.length === 0) return;

    setFileMsg("");

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const maxEach = 50 * 1024 * 1024;
    const maxCount = 5;

    const valid = [];
    let invalidType = 0;
    let oversize = 0;
    let skippedCount = 0;

    for (const f of arr) {
      if (f.type && !allowed.includes(f.type)) {
        invalidType++;
        continue;
      }
      if (f.size > maxEach) {
        oversize++;
        continue;
      }
      valid.push(f);
    }

    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const deduped = valid.filter((f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`));
      const availableSlots = Math.max(0, maxCount - prev.length);
      const accepted = deduped.slice(0, availableSlots);
      skippedCount = Math.max(0, deduped.length - availableSlots);
      return [...prev, ...accepted];
    });

    const msgs = [];
    if (invalidType) {
      msgs.push(
        `${invalidType} file${invalidType > 1 ? "s were" : " was"} skipped due to unsupported format`
      );
    }
    if (oversize) {
      msgs.push(
        `${oversize} file${oversize > 1 ? "s were" : " was"} skipped for exceeding 50MB`
      );
    }
    if (skippedCount) {
      msgs.push(
        `${skippedCount} file${skippedCount > 1 ? "s were" : " was"} skipped because the maximum of 5 files was reached`
      );
    }

    if (msgs.length) setFileMsg(msgs.join(". ") + ".");
  };

  const removeFile = (targetFile) => {
    setFiles((prev) =>
      prev.filter(
        (f) =>
          !(
            f.name === targetFile.name &&
            f.size === targetFile.size &&
            f.lastModified === targetFile.lastModified
          )
      )
    );
  };

  const onPickFiles = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("reporter_name", form.reporter_name);
      payload.append("reporter_email", form.reporter_email);
      payload.append("disaster_type", form.disaster_type);
      payload.append("incident_date", form.incident_date);
      payload.append("state", form.state);
      payload.append("specific_location", form.specific_location);
      payload.append("location", `${form.specific_location}, ${form.state}`);
      payload.append("description", form.description);

      files.forEach((f) => payload.append("files", f));

      await axios.post(`${API_URL}/api/field-reports`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(
        "Report submitted successfully. Thank you for contributing to CEDRAM’s disaster information and verification process."
      );
      setFileMsg("");
      setFieldErrors({});
      scrollToAlert();

      setForm({
        reporter_name: "",
        reporter_email: "",
        disaster_type: "",
        incident_date: "",
        state: "",
        specific_location: "",
        description: "",
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to submit report. Please try again.");
      scrollToAlert();
    } finally {
      setSubmitting(false);
    }
  };

  const inputError = (name) =>
    fieldErrors[name] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "";

  return (
    <section className="relative min-h-screen overflow-hidden bg-background text-textmain">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-6 pb-14 pt-20"
        >
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
              <ShieldCheck size={14} />
              CEDRAM field reporting
            </div>

            <h1 className="mt-6 text-4xl font-semibold md:text-5xl">
              Submit Field Report
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/85">
              Submit verified disaster and emergency information from the field to support
              CEDRAM’s data collection, incident validation, research, and public disaster
              information workflows across Nigeria.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#report-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95"
              >
                Start report
                <ArrowRight size={16} />
              </a>

              <Link
                to="/insights"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View insights
              </Link>
            </div>

            <div className="mt-6 text-xs text-white/70">
              Reports are reviewed before publication and may be validated against supporting evidence.
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <FadeInSection>
          <div className="grid gap-4 lg:grid-cols-3">
            <ProcessCard
              icon={ClipboardList}
              title="Provide incident details"
              text="Enter the incident type, date, state, location, and a clear factual description."
            />
            <ProcessCard
              icon={Upload}
              title="Attach supporting evidence"
              text="Upload relevant photos, videos, or PDF documents where available and safe to share."
            />
            <ProcessCard
              icon={ShieldCheck}
              title="Review and verification"
              text="Reports are screened and reviewed before they can be used in public-facing workflows."
            />
          </div>
        </FadeInSection>

        <div className="mt-8">
          <FadeInSection>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <InfoCard icon={Info} title="Before you submit" tone="accent">
                Please provide factual, specific, and accurate information. Submitted reports may be
                reviewed against attached evidence, existing records, and other available references.
              </InfoCard>

              <InfoCard icon={AlertTriangle} title="Emergency notice" tone="caution">
                If the incident is ongoing or life-threatening, contact emergency responders first.
                This form supports documentation, validation, and public information workflows, not real-time rescue dispatch.
              </InfoCard>
            </div>
          </FadeInSection>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <FadeInSection>
              <PageSectionTitle
                title="Incident submission"
                subtitle="Provide verified incident details as clearly and specifically as possible. Well-structured information improves screening, validation, and public reporting quality."
              />
            </FadeInSection>

            <FadeInSection delay={0.03}>
              <CardShell
                title="Field Report Form"
                subtitle="Fields marked with * are required."
                right={
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-textmuted">
                    <ShieldCheck size={14} />
                    Secure form
                  </div>
                }
              >
                <div id="report-form" ref={alertRef} />

                {(errorMsg || successMsg || fileMsg) && (
                  <div className="mb-8 space-y-3">
                    {errorMsg ? <AlertBox type="error">{errorMsg}</AlertBox> : null}
                    {successMsg ? <AlertBox type="success">{successMsg}</AlertBox> : null}
                    {fileMsg ? <AlertBox type="warning">{fileMsg}</AlertBox> : null}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-10">
                  <div>
                    <SectionTitle color="bg-primary" title="Reporter Information" icon={User} />

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <FieldLabel>
                          <User size={16} className="text-textmuted" />
                          Full Name <span className="text-red-600">*</span>
                        </FieldLabel>
                        <input
                          ref={reporterNameRef}
                          name="reporter_name"
                          value={form.reporter_name}
                          onChange={handleChange}
                          placeholder="e.g., Amina Yusuf"
                          className={classNames(inputBase, inputError("reporter_name"))}
                          autoComplete="name"
                          required
                        />
                        <ErrorText>{fieldErrors.reporter_name}</ErrorText>
                      </div>

                      <div>
                        <FieldLabel>
                          <Mail size={16} className="text-textmuted" />
                          Email Address <span className="text-red-600">*</span>
                        </FieldLabel>
                        <input
                          ref={reporterEmailRef}
                          type="email"
                          name="reporter_email"
                          value={form.reporter_email}
                          onChange={handleChange}
                          placeholder="e.g., amina@example.com"
                          className={classNames(inputBase, inputError("reporter_email"))}
                          autoComplete="email"
                          required
                        />
                        <HelperText>
                          Contact information may be used only where follow-up or verification is necessary.
                        </HelperText>
                        <ErrorText>{fieldErrors.reporter_email}</ErrorText>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  <div>
                    <SectionTitle color="bg-secondary" title="Incident Information" icon={FileText} />

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <FieldLabel>
                          <AlertTriangle size={16} className="text-textmuted" />
                          Disaster Type <span className="text-red-600">*</span>
                        </FieldLabel>
                        <SelectField
                          ref={disasterTypeRef}
                          name="disaster_type"
                          value={form.disaster_type}
                          onChange={handleChange}
                          className={inputError("disaster_type")}
                          required
                        >
                          <option value="">Select disaster type</option>
                          {DISASTER_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </SelectField>
                        <ErrorText>{fieldErrors.disaster_type}</ErrorText>
                      </div>

                      <div>
                        <FieldLabel>
                          <CalendarDays size={16} className="text-textmuted" />
                          Date of Incident <span className="text-red-600">*</span>
                        </FieldLabel>
                        <input
                          ref={incidentDateRef}
                          type="date"
                          name="incident_date"
                          value={form.incident_date}
                          onChange={handleChange}
                          max={today}
                          className={classNames(inputBase, inputError("incident_date"))}
                          required
                        />
                        <ErrorText>{fieldErrors.incident_date}</ErrorText>
                      </div>

                      <div>
                        <FieldLabel>
                          <MapPin size={16} className="text-textmuted" />
                          State <span className="text-red-600">*</span>
                        </FieldLabel>
                        <SelectField
                          ref={stateRef}
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          className={inputError("state")}
                          required
                        >
                          <option value="">Select state</option>
                          {NIGERIA_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </SelectField>
                        <ErrorText>{fieldErrors.state}</ErrorText>
                      </div>

                      <div>
                        <FieldLabel>
                          <MapPin size={16} className="text-textmuted" />
                          Specific Location <span className="text-red-600">*</span>
                        </FieldLabel>
                        <input
                          ref={specificLocationRef}
                          name="specific_location"
                          value={form.specific_location}
                          onChange={handleChange}
                          placeholder="e.g., Ikeja, Lekki, Gwagwalada"
                          className={classNames(inputBase, inputError("specific_location"))}
                          required
                        />
                        <HelperText>
                          Include LGA, nearby landmarks, roads, communities, or settlement references where possible.
                        </HelperText>
                        <ErrorText>{fieldErrors.specific_location}</ErrorText>
                      </div>

                      <div className="md:col-span-2">
                        <FieldLabel>
                          <FileText size={16} className="text-textmuted" />
                          Detailed Description <span className="text-red-600">*</span>
                        </FieldLabel>
                        <textarea
                          ref={descriptionRef}
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Describe what happened, when it happened, observed impacts, affected people, response actions, and any factual details that can support verification."
                          className={classNames(
                            inputBase,
                            "min-h-[220px] resize-y",
                            inputError("description")
                          )}
                          required
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-textmuted">
                          <span>Focus on verified details and avoid assumptions or speculation.</span>
                          <span className={descriptionLen > descriptionMax ? "text-red-600" : ""}>
                            {descriptionLen}/{descriptionMax}
                          </span>
                        </div>
                        <ErrorText>{fieldErrors.description}</ErrorText>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  <div>
                    <SectionTitle color="bg-accent" title="Supporting Evidence" icon={Upload} />

                    <div className="mt-2 text-xs text-textmuted">
                      Optional • Max 5 files • 50MB each
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      className={classNames(
                        "mt-5 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200",
                        dragOver
                          ? "border-secondary bg-secondary/5 shadow-inner"
                          : "border-border bg-muted/35 hover:border-secondary/40 hover:bg-secondary/5"
                      )}
                    >
                      <motion.div
                        animate={reduceMotion ? undefined : dragOver ? { scale: 1.04 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                      >
                        <Upload size={24} />
                      </motion.div>

                      <div className="mt-4 text-base font-semibold text-textmain">
                        Drag and drop files here
                      </div>
                      <div className="mt-2 text-sm text-textmuted">
                        Upload relevant images, videos, or PDF documents
                      </div>
                      <div className="mt-2 text-xs text-textmuted">
                        Accepted: PNG, JPG, PDF, MP4, WEBM, MOV
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-textmain transition hover:bg-muted"
                      >
                        <Upload size={16} />
                        Choose files
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,application/pdf,video/mp4,video/webm,video/quicktime"
                        onChange={onPickFiles}
                        className="hidden"
                      />
                    </div>

                    {files.length > 0 ? (
                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {previews.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="flex gap-4 rounded-2xl border border-border bg-muted/40 p-4"
                          >
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
                              {p.url && p.isImage ? (
                                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                              ) : p.url && p.isVideo ? (
                                <video src={p.url} className="h-full w-full object-cover" muted />
                              ) : (
                                <FileImage size={20} className="text-textmuted" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-textmain">
                                    {p.name}
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-textmuted">
                                      <FileBadge size={12} />
                                      {p.kind}
                                    </span>
                                    <span className="text-xs text-textmuted">{formatBytes(p.size)}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFile(p.file)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
                                  aria-label={`Remove ${p.name}`}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={submitting}
                      className="w-full rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit Report"}
                    </button>

                    <p className="mt-3 text-center text-xs leading-relaxed text-textmuted">
                      By submitting this report, you confirm that the information provided is accurate
                      to the best of your knowledge.
                    </p>
                  </div>
                </form>
              </CardShell>
            </FadeInSection>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <FadeInSection delay={0.05}>
              <PageSectionTitle
                title="Submission guidance"
                subtitle="Helpful reminders to improve report quality and support effective review."
              />
            </FadeInSection>

            <div className="space-y-4">
              <FadeInSection delay={0.08}>
                <InfoCard icon={Info} title="Quality checklist">
                  <ul className="space-y-2">
                    <li>• Use exact dates where possible.</li>
                    <li>• Include local area names and nearby landmarks.</li>
                    <li>• Separate verified facts from assumptions.</li>
                    <li>• Upload evidence only if relevant and safe to share.</li>
                  </ul>
                </InfoCard>
              </FadeInSection>

              <FadeInSection delay={0.11}>
                <InfoCard icon={ShieldCheck} title="Review workflow">
                  <div className="space-y-2">
                    <div className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-textmuted">
                      Received
                    </div>
                    <div className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-textmuted">
                      Screened
                    </div>
                    <div className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-textmuted">
                      Validated / flagged
                    </div>
                    <div className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-textmuted">
                      Published if approved
                    </div>
                  </div>
                </InfoCard>
              </FadeInSection>

              <FadeInSection delay={0.14}>
                <InfoCard icon={CheckCircle2} title="Why this matters" tone="primary">
                  Field reports help strengthen CEDRAM’s incident records, support disaster research,
                  improve public information quality, and contribute to evidence-based decision-making.
                </InfoCard>
              </FadeInSection>

              <FadeInSection delay={0.17}>
                <InfoCard icon={AlertTriangle} title="Important note" tone="accent">
                  Avoid uploading content that is unsafe, unnecessarily graphic, or personally sensitive
                  unless it is essential for verification and appropriate to share.
                </InfoCard>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}