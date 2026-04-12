import { ShieldAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Disclaimer
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Important information regarding the use of this platform and its
              content.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />

          <div className="p-8 md:p-12">
            <div className="space-y-6 text-gray-700 leading-8">
              <p>
                The information, reports, analyses, maps, publications, and
                other materials made available on this platform are provided
                solely for general informational, academic, research,
                monitoring, and public awareness purposes. While reasonable
                efforts are made to ensure that content published on this
                platform is accurate, relevant, and current at the time of
                publication, no representation or warranty, express or implied,
                is made as to the accuracy, completeness, reliability,
                suitability, or availability of any content, data,
                interpretation, or service provided through this platform.
              </p>

              <p>
                This platform does not constitute, and should not be
                interpreted as, an emergency response system, emergency dispatch
                service, rescue coordination center, early warning authority, or
                official operational command structure. Information published on
                this platform must not be relied upon as a substitute for direct
                communication with emergency responders, government agencies,
                disaster management authorities, healthcare providers, security
                agencies, or other competent institutions responsible for
                responding to urgent or life-threatening situations.
              </p>

              <p>
                Certain information presented on this platform may be derived
                from preliminary findings, third-party sources, field
                submissions, community reports, or ongoing verification
                processes. As such, content may be revised, updated, corrected,
                delayed, restricted, archived, or removed without prior notice
                where necessary to reflect new evidence, improve accuracy,
                maintain confidentiality, comply with legal or ethical
                obligations, or protect affected individuals, communities,
                personnel, and operations.
              </p>

              <p>
                The inclusion of any external data, third-party references,
                geographic visualizations, incident reports, statistical
                summaries, or analytical interpretations does not imply official
                validation, endorsement, certification, or adoption by any
                governmental, regulatory, humanitarian, academic, or private
                institution unless expressly stated otherwise. Users are solely
                responsible for independently assessing and verifying any
                information before relying on it for operational, legal,
                financial, humanitarian, security, policy, or personal
                decision-making purposes.
              </p>

              <p>
                To the fullest extent permitted by applicable law, the
                platform, its operators, contributors, affiliates, partners, and
                associated personnel disclaim all liability for any direct,
                indirect, incidental, consequential, special, exemplary, or
                other loss or damage arising out of, or in connection with, the
                use of, reliance upon, inability to use, or misinterpretation
                of any information, content, feature, or service provided
                through this platform.
              </p>

              <p>
                Users of this platform acknowledge and agree that access to and
                use of the platform and its contents is at their own discretion
                and risk. Continued use of the platform constitutes acceptance
                of this disclaimer and any related terms, policies, and
                conditions governing the use of this service.
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm md:text-base text-amber-900 leading-7">
                <span className="font-semibold">Important Notice:</span> In the
                event of an active emergency, immediate threat, or urgent need
                for assistance, users should promptly contact the appropriate
                emergency services, disaster management authorities, law
                enforcement agencies, healthcare providers, or other competent
                responders through officially designated channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}