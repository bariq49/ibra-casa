"use client";

import React, { useState } from "react";
import Container from "@/components/common/Container";
import { MapPin, Clock, Briefcase, CheckCircle2 } from "lucide-react";
import ApplicationForm from "./ApplicationForm";

interface JobInfo {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const CareerDetails = ({ career }: { career: JobInfo }) => {
  const [showApplyForm, setShowApplyForm] = useState(false);

  return (
    <section className="py-12 md:py-20 bg-background">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-border shadow-sm mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {career.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium text-lg">
              <div className="flex items-center gap-2">
                <Briefcase className="size-5" />
                <span>{career.department}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <MapPin className="size-5" />
                <span>{career.location}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <Clock className="size-5" />
                <span>{career.type}</span>
              </div>
            </div>
            {!showApplyForm && (
              <div className="mt-10">
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="btn btn-primary btn-large px-12 py-4 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all"
                >
                  Apply for this position
                </button>
              </div>
            )}
          </div>

          {showApplyForm ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border shadow-sm slide-in-bottom animation-delay-100">
              <div className="mb-8 border-b border-border pb-6">
                <h2 className="text-2xl font-bold text-foreground">Submit Your Application</h2>
                <p className="text-muted-foreground mt-2">Fill out the form below to apply for the {career.title} role.</p>
              </div>
              <ApplicationForm careerId={career._id} onCancel={() => setShowApplyForm(false)} />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Description */}
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-6">About the Role</h3>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {career.description}
                </div>
              </div>

              {/* Requirements */}
              {career.requirements && career.requirements.length > 0 && (
                <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Requirements</h3>
                  <ul className="space-y-4">
                    {career.requirements.map((req, index) => (
                      <li key={index} className="flex gap-4">
                        <CheckCircle2 className="size-6 text-primary shrink-0" />
                        <span className="text-lg text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {career.benefits && career.benefits.length > 0 && (
                <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Benefits</h3>
                  <ul className="space-y-4">
                    {career.benefits.map((benefit, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="size-2 mt-2.5 rounded-full bg-success shrink-0" />
                        <span className="text-lg text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CareerDetails;
