import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Coffee Cluff</strong> ("we", "us", or "our") operates as a fusion Chinese restaurant. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Personal information you provide when making a reservation or ordering online (such as name, phone number, email, and address).</li>
        <li>Payment information for online orders.</li>
        <li>Information collected automatically, such as IP address, browser type, and usage data when you visit our website.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To process reservations and online orders.</li>
        <li>To communicate with you about your orders or inquiries.</li>
        <li>To improve our services and website experience.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell or rent your personal information. We may share your information with trusted third parties who assist us in operating our website, processing payments, or serving you, as long as those parties agree to keep this information confidential.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
      <p className="mb-4">
        We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
      <p className="mb-4">
        You may request to access, update, or delete your personal information by contacting us. We will respond to your request as soon as possible.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Changes to This Policy</h2>
      <p className="mb-4">
        We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy or our practices, please contact us at <a href="mailto:info@coffeecluff.com" className="text-blue-600 underline">info@coffeecluff.com</a>.
      </p>
      <p className="mt-8 text-sm text-gray-500 text-center">© {new Date().getFullYear()} Coffee Cluff. All rights reserved.</p>
    </div>
  );
}