import React from "react";
import Image from "next/image";
import Container from "@/components/common/Container";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "@/i18n/routing";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image: string | any;
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface AboutTeamProps {
  members?: TeamMember[];
}

const AboutTeam = ({ members = [] }: AboutTeamProps) => {
  const displayMembers = members.length > 0 ? members : [];

  return (
    <section className="py-20 bg-muted">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-light-primary-text mb-4">
            Meet Our Team
          </h2>
          <p className="text-light-secondary-text">
            Dedicated professionals working together to bring you the best
            experience possible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16 lg:gap-6">
          {displayMembers.map((member) => (
            <div
              key={member._id}
              className="relative group flex flex-col items-center"
            >
              {/* Image Container */}
              <div className="w-full aspect-3/4 rounded-[32px] overflow-hidden relative border-4 border-white shadow-lg bg-light-bg">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Info Card - Overlapping Bottom */}
              <div className="w-[85%] bg-white rounded-2xl shadow-md p-5 flex flex-col items-center text-center -mt-12 relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                <h3 className="text-lg font-bold text-light-primary-text">
                  {member.name}
                </h3>
                <p className="text-sm text-light-secondary-text mb-4">
                  {member.role}
                </p>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  {member.socials?.facebook &&
                    member.socials.facebook !== "#" && (
                      <Link
                        href={member.socials.facebook}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </Link>
                    )}
                  {member.socials?.twitter &&
                    member.socials.twitter !== "#" && (
                      <Link
                        href={member.socials.twitter}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </Link>
                    )}
                  {member.socials?.instagram &&
                    member.socials.instagram !== "#" && (
                      <Link
                        href={member.socials.instagram}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </Link>
                    )}
                  {member.socials?.linkedin &&
                    member.socials.linkedin !== "#" && (
                      <Link
                        href={member.socials.linkedin}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Link>
                    )}
                  {/* Keep dummy links for the static fallback */}
                  {member.socials?.facebook === "#" && (
                    <>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Facebook className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Linkedin className="w-4 h-4" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default AboutTeam;
