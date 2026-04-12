import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Privacy Policy
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Information on how personal data is collected, used, stored, and
              protected.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />

          <div className="p-8 md:p-12">
            <div className="space-y-6 text-gray-700 leading-8">
              <p>
                This Privacy Policy explains how this platform collects, uses,
                stores, manages, and protects personal information obtained
                through user interaction with the website, reporting tools,
                communication forms, account systems, and related digital
                services. The platform is committed to responsible data handling
                and to safeguarding personal information in accordance with
                applicable legal, ethical, and operational standards.
              </p>

              <p>
                Personal information collected through this platform may include
                names, email addresses, phone numbers, institutional details,
                user account credentials, communication records, submission
                contents, and other information voluntarily provided by users or
                generated through legitimate use of the platform’s services.
                Technical information such as IP address, browser type, device
                information, access times, and usage patterns may also be
                collected for security, analytics, administration, and service
                improvement purposes.
              </p>

              <p>
                Personal data may be processed for purposes including user
                authentication, submission management, communication,
                verification, platform administration, system security, audit
                logging, service improvement, legal compliance, and research or
                institutional functions directly related to the objectives of
                the platform. Personal information will not be used for purposes
                incompatible with these objectives except where required or
                permitted by law.
              </p>

              <p>
                Reasonable technical and organizational measures are maintained
                to protect personal data against unauthorized access, disclosure,
                alteration, misuse, loss, or destruction. However, no system of
                electronic transmission or storage can be guaranteed to be
                completely secure, and the platform does not warrant absolute
                security of information transmitted or stored through digital
                systems.
              </p>

              <p>
                Personal information may be disclosed where necessary to trusted
                service providers, authorized personnel, institutional partners,
                or competent authorities, strictly on a need-to-know basis and
                subject to appropriate confidentiality, legal, or operational
                safeguards. Information may also be disclosed where required to
                comply with law, regulation, lawful requests, security needs, or
                the protection of rights, safety, and legitimate interests.
              </p>

              <p>
                By using this platform, submitting information, or creating an
                account where applicable, users acknowledge and accept the
                collection and processing of relevant personal data in
                accordance with this Privacy Policy. Users are encouraged to
                avoid submitting unnecessary sensitive personal information
                unless specifically required and appropriately protected within
                the context of the platform’s services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}