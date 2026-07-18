import mongoose, { Document, Schema } from "mongoose";

export interface ITeamMemberDocument extends Document {
  name: string;
  role: string;
  image: string;
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isActive: boolean;
}

const teamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: true },
    socials: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TeamMember = mongoose.models.TeamMember || mongoose.model<ITeamMemberDocument>("TeamMember", teamMemberSchema);
export default TeamMember;
