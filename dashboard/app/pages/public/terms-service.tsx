import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>
      <p className="mb-4">
        Welcome to <strong>Coffee Cluff</strong>, a fusion Chinese restaurant. By accessing or using our website and services, you agree to the following terms and conditions.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of Our Services</h2>
      <p className="mb-4">
        You agree to use our website and services only for lawful purposes. You must not misuse our services or attempt to interfere with their proper operation.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. Orders & Reservations</h2>
      <p className="mb-4">
        When placing an order or making a reservation, you agree to provide accurate and complete information. We reserve the right to refuse or cancel any order or reservation at our discretion.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Payment</h2>
      <p className="mb-4">
        All payments for online orders must be made through our approved payment methods. Prices and availability are subject to change without notice.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Intellectual Property</h2>
      <p className="mb-4">
        All content on this website, including text, images, logos, and designs, is the property of Coffee Cluff or its licensors. You may not use, reproduce, or distribute any content without our written permission.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
      <p className="mb-4">
        Coffee Cluff is not liable for any damages arising from your use of our website or services. Our liability is limited to the maximum extent permitted by law.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
      <p className="mb-4">
        We may update these Terms of Service at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services constitutes acceptance of the updated terms.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us at <a href="mailto:info@coffeecluff.com" className="text-blue-600 underline">info@coffeecluff.com</a>.
      </p>
      <p className="mt-8 text-sm text-gray-500 text-center">© {new Date().getFullYear()} Coffee Cluff. All rights reserved.</p>
    </div>
  );
}