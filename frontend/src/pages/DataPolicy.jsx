import { Database } from "lucide-react";

export default function DataPolicy() {
  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Data Policy
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Information regarding data sources, verification, management, and
              use on this platform.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />

          <div className="p-8 md:p-12">
            <div className="space-y-6 text-gray-700 leading-8">
              <p>
                This platform collects, processes, analyzes, and publishes data
                for purposes including disaster monitoring, research, public
                awareness, institutional reporting, and knowledge
                dissemination. Data made available through this platform may be
                obtained from multiple sources, including field reports,
                community submissions, institutional partners, publicly
                available materials, research inputs, and internal verification
                processes.
              </p>

              <p>
                All data presented on this platform is subject to varying levels
                of review, validation, and verification depending on the source,
                nature, timing, and operational context of the information.
                Certain records may be preliminary, incomplete, or pending
                further assessment. As a result, users should understand that
                not all data points carry the same degree of certainty or
                evidentiary status at all times.
              </p>

              <p>
                The platform reserves the right to update, revise, annotate,
                reclassify, restrict, archive, or remove data and related
                content without prior notice where necessary to improve
                accuracy, reflect newly available evidence, correct errors,
                comply with legal or ethical obligations, protect confidentiality,
                or reduce risks associated with misuse or misinterpretation.
              </p>

              <p>
                Data publication practices are guided by principles of
                relevance, proportionality, accuracy, accountability, and
                responsible disclosure. In some circumstances, specific details
                may be withheld, generalized, anonymized, aggregated, or delayed
                in publication in order to protect affected persons,
                communities, institutions, responders, or ongoing operations.
              </p>

              <p>
                The availability, frequency, and cadence of updates may vary
                depending on operational realities, access to verified
                information, reporting timelines, technical maintenance, and
                institutional review processes. Accordingly, users should not
                assume that all datasets, visualizations, reports, or incident
                records are updated in real time unless expressly indicated.
              </p>

              <p>
                By accessing and using the data made available through this
                platform, users acknowledge that they are responsible for
                independently evaluating the appropriateness, reliability, and
                applicability of such data for their intended use. The platform
                disclaims responsibility for any decisions, interpretations, or
                actions taken on the basis of incomplete, evolving, or
                context-specific information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}