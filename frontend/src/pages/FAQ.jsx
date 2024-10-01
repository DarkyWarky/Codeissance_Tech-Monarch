import Nav from "../components/Nav"

export default function FAQ() {
  return (
    <>
      <section className="mt-3 px-4 py-8 md:px-8 md:py-6">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                Protect Your Digital Identity with DigiPrints
              </h2>
              <p className="font-sans text-lg mb-8 max-w-2xl mx-auto">
                Discover and manage your online data easily with DigiPrints, your smart data assistant.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="md:w-1/2 text-left">
                <h3 className="font-heading font-bold text-xl md:text-2xl lg:text-3xl mb-4">
                  What is DigiPrints?
                </h3>
                <p className="font-sans text-lg mb-6">
                  DigiPrints works as your smart data assistant that helps you easily discover and manage your data online. By doing so, you can continuously reduce your online exposure and enjoy the internet feeling safe and secure.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img
                  src="firstimg.png"
                  alt="DigiPrints Data Assistant Illustration"
                  className="mt-6 md:mt-0 rounded-lg shadow-lg"
                  height={100} width={200}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12">
            <h3 className="font-heading text-purple-800 font-bold text-2xl mb-6 text-center">
              With DigiPrints you can:
            </h3>
            <ul className="list-disc list-inside text-purple-800 space-y-4 max-w-2xl mx-auto">
              <li>Find out which companies are holding your data and what types of data they potentially hold.</li>
              <li>Get smart insights and recommendations according to your online behavior and exposure level to help you take informed decisions about your data.</li>
              <li>Manage and control your personal data by requesting data deletions from companies you no longer need or use.</li>
              <li>Communicate with all the different companies that hold your personal data from one place - your DigiPrints app.</li>
            </ul>
            <p className="font-sans text-purple-800 font-bold text-lg mt-6 text-center">
              Our mission is to create a new global privacy standard where people can manage their data and minimize online risks without changing their behavior.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 md:p-12 text-white">
            <h3 className="font-heading text-white font-bold text-2xl mb-6 text-center">
              Why should I use DigiPrints?
            </h3>
            <p className="font-sans text-lg mb-6 max-w-2xl mx-auto">
              We appreciate the ease, convenience, and benefits of digital life. With that, there's no such thing as a riskless internet; data breaches happen. <span className="font-bold">We firmly believe that your personal data is yours to own and yours to give away.</span>
            </p>
            <p className="font-sans text-lg mb-6 max-w-2xl mx-auto">
              DigiPrints helps you reduce unnecessary online exposure and minimize their potential risks. With continuous updates and smart insights on your data, DigiPrints makes it easy for you to manage your data according to your choice without changing your online behavior.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-100 to-purple-200 p-8 md:p-12">
            <h3 className="font-heading text-purple-800 font-bold text-2xl mb-6 text-center">
              What is my "digital footprint"?
            </h3>
            <p className="font-sans text-purple-700 text-lg mb-6 max-w-2xl mx-auto">
              Your digital footprint consists of personal data traces you leave behind every time you interact with a digital service. These traces could include different types of data, such as your name, email address, home or work address, phone number, credit card information, passport, social security, identification number, behavioral data, and much, much more.
            </p>
            <p className="font-sans text-purple-700 text-lg mb-6 max-w-2xl mx-auto">
              During your daily online interactions with digital services (a.k.a companies), you leave behind hundreds of digital traces. DigiPrints discovered that almost 90% of these traces could be found through your emails' subject lines. Examples of these subject lines could be: "Welcome to Facebook" or "Your Amazon Receipt."
            </p>
            <p className="font-sans text-purple-700 text-lg mb-6 max-w-2xl mx-auto">
              By connecting your primary email with DigiPrints, we can help you discover your digital footprint and understand which companies hold your data, so you can decide where your data should and shouldn't be.
            </p>
          </div>

          <div className="p-8 md:p-12 text-center">
            <button className="bg-white text-purple-700 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-purple-100 hover:scale-105 transform">
              Get Started with DigiPrints
            </button>
          </div>
        </div>
      </section>
    </>
  )
}