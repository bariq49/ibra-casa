import React from "react";
import Container from "@/components/common/Container";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
}

interface CareersJobsProps {
  initialJobs?: Job[];
}

const CareersJobs = ({ initialJobs = [] }: CareersJobsProps) => {
  // Group jobs by department
  const groupedJobs = initialJobs.reduce(
    (acc, job) => {
      if (!acc[job.department]) {
        acc[job.department] = [];
      }
      acc[job.department].push(job);
      return acc;
    },
    {} as Record<string, Job[]>,
  );

  const entries = Object.entries(groupedJobs);

  return (
    <section className="py-20 md:py-32 bg-background">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Don&apos;t see a perfect fit? Send your resume to{" "}
              <a
                href="mailto:careers@sellzy.com"
                className="text-primary font-semibold hover:underline"
              >
                careers@sellzy.com
              </a>
              . We&apos;re always looking for exceptional talent to join our
              mission.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-white px-5 py-3 rounded-xl border border-border shadow-sm">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            <span>{initialJobs.length} Roles Available</span>
          </div>
        </div>

        {initialJobs.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-muted-foreground">
              No open positions at the moment
            </h3>
            <p className="text-muted-foreground mt-2">
              Please check back later or send us your resume.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {entries.map(([department, jobs]) => (
              <div key={department}>
                <h3 className="text-2xl font-bold text-foreground mb-8 pb-4 border-b border-border flex items-center gap-4">
                  {department}
                  <span className="text-sm font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                    {jobs.length}
                  </span>
                </h3>

                <div className="grid gap-4">
                  {jobs.map((role) => (
                    <Link
                      href={`/careers/${role._id}`}
                      key={role._id}
                      className="group bg-white border border-border rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer block"
                    >
                      <div className="space-y-3">
                        <h4 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {role.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                          <div className="flex items-center gap-x-1.5">
                            <MapPin className="size-4" />
                            <span>{role.location}</span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
                          <div className="flex items-center gap-x-1.5">
                            <Clock className="size-4" />
                            <span>{role.type}</span>
                          </div>
                        </div>
                      </div>

                      <button className="shrink-0 size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm">
                        <ArrowRight className="size-5" />
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default CareersJobs;
