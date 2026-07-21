"use client";

import React, { useState } from "react";

const ContactFormClient = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const inputClass =
    "w-full h-14 px-5 border border-gray-300 rounded-full focus:outline-none focus:border-primary font-dm-sans transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full animate__animated animate__fadeInUp"
    >
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
            required
            className={inputClass}
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
            className={inputClass}
          />
        </div>
      </div>

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
            className={inputClass}
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
            required
            className={inputClass}
          />
        </div>
      </div>

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
          className={inputClass}
        />
      </div>

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

      <div className="flex flex-col items-end gap-3 mt-1">
        <button
          type="submit"
          className="h-14 px-8 rounded-full font-semibold font-dm-sans text-white transition-all flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-color-primary"
        >
          Send Your Message
        </button>
      </div>
    </form>
  );
};

export default ContactFormClient;
