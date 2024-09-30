import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

const Transparency = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-indigo-700">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-7xl font-bold text-white hero-text font-heading md:text-5xl lg:text-7xl mb-6 leading-tight">Keeping your data secure,<br /> keeping it yours and yours only.</h2>
          <p className="hero-text font-sans text-purple-100 text-lg mb-8 w-1/2 mx-auto">
            At DigiPrints, we believe that trust is earned. This is why we put trust and transparency at the core of everything that we do, with you - the user, at the center. We’ve worked hard to create a technology dedicated to collecting the bare minimum of data needed to provide you with maximum value.
          </p>
        </section>
      </main>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Section 1 */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 m-5 rounded-lg shadow">
          <h3 className="text-2xl text-white font-semibold mb-4">Data Collection</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We only collect data that's necessary for our services</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">Your personal information is encrypted and securely stored</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We never sell your data to third parties</span>
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 m-5 rounded-lg shadow">
          <h3 className="text-2xl text-white font-semibold mb-4">Your Rights</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">You can request a copy of your data at any time</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">You have the right to be forgotten - we'll delete your data upon request</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">You can opt-out of non-essential data processing</span>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 m-5 rounded-lg shadow">
          <h3 className="text-2xl text-white font-semibold mb-4">Security Measures</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We use industry-standard encryption protocols</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">Regular security audits are conducted</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We have a dedicated team monitoring for potential threats</span>
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 m-5 rounded-lg shadow">
          <h3 className="text-2xl text-white font-semibold mb-4">Compliance</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We are GDPR compliant</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">We adhere to CCPA regulations</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-white">Our practices are aligned with global privacy standards</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Transparency;