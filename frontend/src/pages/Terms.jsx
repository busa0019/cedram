import { FileCheck } from "lucide-react";

export default function Terms() {
  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCheck size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Terms of Use
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Conditions governing access to and use of this platform and its
              services.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />

          <div className="p-8 md:p-12">
            <div className="space-y-6 text-gray-700 leading-8">
              <p>
                These Terms of Use govern access to and use of this platform,
                including all content, data, tools, reports, publications,
                interfaces, submission channels, and related services made
                available through it. By accessing or using this platform, users
                acknowledge that they have read, understood, and agreed to be
                bound by these Terms of Use and any other applicable policies,
                notices, or conditions referenced by this platform.
              </p>

              <p>
                Users agree to use the platform only for lawful, legitimate, and
                responsible purposes consistent with its intended objectives.
                Users must not engage in any conduct that may disrupt, damage,
                impair, misuse, overload, or compromise the platform, its
                systems, its security, its data integrity, or the rights and
                safety of other users, contributors, institutions, or affected
                communities.
              </p>

              <p>
                Users must not submit false, misleading, defamatory, unlawful,
                abusive, harmful, malicious, discriminatory, or otherwise
                inappropriate content through the platform. Users are solely
                responsible for the accuracy, legality, and appropriateness of
                any information, reports, documents, media, or materials they
                provide, transmit, upload, or publish using the platform.
              </p>

              <p>
                All intellectual property rights in the platform, including its
                design, structure, branding, content organization, text,
                graphics, databases, and other materials, remain the property of
                the platform or its respective rights holders unless otherwise
                stated. Users may not reproduce, modify, distribute, republish,
                exploit, reverse engineer, or create derivative works from the
                platform or its content except as expressly permitted by
                applicable law or prior written authorization.
              </p>

              <p>
                The platform reserves the right, at its sole discretion, to
                restrict, suspend, terminate, or otherwise limit access to any
                part of the platform or its services where a user is found or
                reasonably suspected to have violated these Terms of Use,
                applicable laws, security requirements, or other governing
                policies. The platform may also modify, suspend, or discontinue
                any feature, content, or service at any time without prior
                notice.
              </p>

              <p>
                Use of this platform is at the user’s own risk. To the fullest
                extent permitted by law, the platform and its operators disclaim
                liability for any loss, damage, claim, cost, or consequence
                arising from use of, inability to use, reliance upon, or misuse
                of the platform or any of its content, features, or services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}