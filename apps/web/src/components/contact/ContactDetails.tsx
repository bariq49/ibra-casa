import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

const ContactDetails = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-20">
      <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-start gap-4 h-full min-h-[186px] bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Mail className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <p className="text-base font-semibold text-light-primary-text font-dm-sans mb-1">
            Email
          </p>
          <p className="text-base text-light-secondary-text font-dm-sans">
            support@example.com
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-start gap-4 h-full min-h-[186px] bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Phone className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <p className="text-base font-semibold text-light-primary-text font-dm-sans mb-1">
            Phone
          </p>
          <p className="text-base text-light-secondary-text font-dm-sans">
            +1 (555) 123-4567
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-start gap-4 h-full min-h-[186px] bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <p className="text-base font-semibold text-light-primary-text font-dm-sans mb-1">
            Address
          </p>
          <p className="text-base text-light-secondary-text font-dm-sans">
            123 Innovation Street, Suite 456, San Francisco, CA 94107, USA
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-start gap-4 h-full min-h-[186px] bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Globe className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <p className="text-base font-semibold text-light-primary-text font-dm-sans mb-1">
            Website
          </p>
          <p className="text-base text-light-secondary-text font-dm-sans">
            www.createuiux.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
