"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import { toast } from "sonner";
import { CONTACT_ENDPOINTS } from "@/constants/endpoints";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

interface ContactFormClientProps {
  /** Passed in from the server component so the initial render is auth-aware */
  isLoggedIn: boolean;
  /** Source of the contact form: "contact" or "faq" */
  source?: "contact" | "faq";
}

const ContactFormClient = ({
  isLoggedIn,
  source = "contact",
}: ContactFormClientProps) => {
  // Zustand auth store — already hydrated client-side from persisted localStorage
  const { isAuthenticated, user } = useAuthStore();
  const { onAuthOpen } = useHeaderStore();

  // Use server prop for the hydration-friendly first render,
  // then let the Zustand value take over once hydrated
  const authenticated = isAuthenticated || isLoggedIn;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill locked fields from the Zustand user once hydrated
  useEffect(() => {
    if (user) {
      const parts = (user.name || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phoneNumber || user.phone || "",
      }));
    } else {
      // Guest — clear locked fields
      setFormData((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) {
      toast.error("Please log in to send a message.");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(CONTACT_ENDPOINTS.BASE, {
        subject: formData.subject,
        message: formData.message,
        source, // Include the source in the request
      });

      toast.success(
        "Message received successfully! We'll get back to you soon.",
      );
      // Only reset the editable fields, keep the locked user info
      setFormData((prev) => ({ ...prev, subject: "", message: "" }));
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Locked field style (pre-filled, non-editable)
  const lockedClass =
    "w-full h-14 px-5 border border-gray-200 rounded-full bg-gray-100 cursor-not-allowed opacity-75 font-dm-sans text-light-primary-text select-none";
  // Editable field style
  const editableClass =
    "w-full h-14 px-5 border border-gray-300 rounded-full focus:outline-none focus:border-primary font-dm-sans transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full animate__animated animate__fadeInUp"
    >
      {/* ── Row 1: First & Last Name (locked for logged-in users) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            readOnly={authenticated}
            required
            className={authenticated ? lockedClass : editableClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            readOnly={authenticated}
            className={authenticated ? lockedClass : editableClass}
          />
        </div>
      </div>

      {/* ── Row 2: Phone & Email (locked for logged-in users) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            readOnly={authenticated}
            className={authenticated ? lockedClass : editableClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            readOnly={authenticated}
            required
            className={authenticated ? lockedClass : editableClass}
          />
        </div>
      </div>

      {/* ── Subject (always editable) ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="subject"
          placeholder="What is this regarding?"
          value={formData.subject}
          onChange={handleChange}
          required
          className={editableClass}
        />
      </div>

      {/* ── Message (always editable, required) ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-dm-sans text-light-secondary-text pl-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          placeholder="Write your message here..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full p-5 border border-gray-300 rounded-3xl resize-none focus:outline-none focus:border-primary font-dm-sans transition-colors"
        />
      </div>

      {/* ── Submit row ── */}
      <div className="flex flex-col items-end gap-3 mt-1">
        <button
          type="submit"
          disabled={!authenticated || isSubmitting}
          className={`h-14 px-8 rounded-full font-semibold font-dm-sans text-white transition-all flex items-center gap-2 ${
            authenticated && !isSubmitting
              ? "bg-primary hover:bg-primary/90 shadow-color-primary"
              : "bg-gray-400 cursor-not-allowed opacity-60"
          }`}
        >
          {isSubmitting && <Loader2 className="size-5 animate-spin" />}
          {isSubmitting ? "Sending…" : "Send Your Message"}
        </button>

        {!authenticated && (
          <p className="text-sm font-medium text-light-secondary-text font-dm-sans flex items-center gap-1">
            You need to be logged in to send a message.
            <button
              type="button"
              onClick={() => onAuthOpen("login")}
              className="text-primary font-bold hover:underline ml-1"
            >
              Login here
            </button>
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactFormClient;
