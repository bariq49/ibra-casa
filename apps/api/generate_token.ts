/**
 * Promote an existing user to a privileged role and print a JWT.
 *
 * Usage (from apps/api):
 *   pnpm tsx generate_token.ts admin user@example.com
 *   pnpm tsx generate_token.ts vendor user@example.com
 *   pnpm tsx generate_token.ts employee user@example.com incharge
 *   pnpm tsx generate_token.ts employee user@example.com packer
 *
 * Sign up the user on the storefront first, then run this to promote them.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";
import generateToken from "./utils/generateToken.js";

dotenv.config();

const ROLES = ["admin", "employee", "vendor", "preview", "user"] as const;
const EMPLOYEE_ROLES = [
  "packer",
  "deliveryman",
  "accounts",
  "incharge",
  "call_center",
] as const;

type Role = (typeof ROLES)[number];
type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

function printUsage(): never {
  console.log(`
Usage:
  pnpm tsx generate_token.ts <role> <email> [employee_role]

Roles: ${ROLES.join(", ")}
Employee roles (required when role=employee): ${EMPLOYEE_ROLES.join(", ")}

Examples:
  pnpm tsx generate_token.ts admin info@thedevsquare.com
  pnpm tsx generate_token.ts vendor vendor@example.com
  pnpm tsx generate_token.ts employee staff@example.com incharge
`);
  process.exit(1);
}

async function main() {
  const [, , roleArg, emailArg, employeeRoleArg] = process.argv;

  if (!roleArg || !emailArg) {
    printUsage();
  }

  const role = roleArg.toLowerCase() as Role;
  const email = emailArg.toLowerCase().trim();

  if (!ROLES.includes(role)) {
    console.error(`Invalid role "${roleArg}". Allowed: ${ROLES.join(", ")}`);
    process.exit(1);
  }

  let employee_role: EmployeeRole | null = null;
  if (role === "employee") {
    if (!employeeRoleArg) {
      console.error(
        `employee_role is required when role is employee. Allowed: ${EMPLOYEE_ROLES.join(", ")}`,
      );
      process.exit(1);
    }
    const er = employeeRoleArg.toLowerCase() as EmployeeRole;
    if (!EMPLOYEE_ROLES.includes(er)) {
      console.error(
        `Invalid employee_role "${employeeRoleArg}". Allowed: ${EMPLOYEE_ROLES.join(", ")}`,
      );
      process.exit(1);
    }
    employee_role = er;
  }

  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not defined in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database.");

  const user = await User.findOne({ email });
  if (!user) {
    console.error(
      `No user found with email "${email}". Sign up on the storefront first, then re-run this command.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const previousRole = user.role;
  user.role = role;
  user.employee_role = role === "employee" ? employee_role : null;
  await user.save();

  const token = generateToken(user._id.toString());

  console.log(`
Updated user:
  email:          ${user.email}
  name:           ${user.name}
  previous role:  ${previousRole}
  new role:       ${user.role}${
    user.employee_role ? `\n  employee_role:  ${user.employee_role}` : ""
  }

JWT (30d):
${token}
`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
