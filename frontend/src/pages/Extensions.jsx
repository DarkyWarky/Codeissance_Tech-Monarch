import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

const Extensions = () => {
    const [extensions, setExtensions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExtensions();

        // GSAP animations for the extension cards
        const tl = gsap.timeline();
        gsap.set('.extension-card', { opacity: 0, y: 50 });

        tl.to('.extension-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.3,
            ease: 'power2.out',
        });
    }, []);

    const fetchExtensions = async () => {
        try {
            // Mock API call
            const mockExtensions = [
                { id: 1, name: 'Cookie Blocker', description: 'Block unwanted tracking cookies and enhance your online privacy. The Cookie Blocker extension helps you automatically block third-party cookies and tracking scripts from websites. Protect your browsing activity from being tracked by advertisers and improve your privacy online. Easy to configure and customize for different levels of cookie control.' },
                { id: 2, name: 'Data Extractor', description: 'Extract valuable information from web pages with just a click. Data Extractor allows you to quickly capture and export structured data, such as tables or lists, from websites into formats like CSV or JSON. Perfect for researchers, marketers, and data analysts who need to collect data from web sources efficiently.' },
                { id: 3, name: 'Privacy Guardian', description: 'Safeguard your personal information and browse securely. Privacy Guardian ensures that your personal data is protected while you surf the web. It automatically masks your IP address, blocks invasive ads, and alerts you if a website attempts to track your information or engage in malicious activity.' },
            ];
            setExtensions(mockExtensions);
            setError(null);
        } catch (error) {
            console.error('Error fetching extensions:', error);
            setError('Failed to fetch extensions');
        }
    };

    const handleDownload = (extensionId) => {
        // Mock download functionality
        console.log(`Downloading extension with ID: ${extensionId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            <main className="container mx-auto p-0">
                {/* Hero Section */}
                <section className="items-center justify-center h-auto bg-gradient-to-br from-purple-600 to-indigo-700 p-8 md:p-12">
                    <div className="text-center text-white">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Explore Our <span className="text-purple-200">Extensions</span>
                        </h1>
                        <p className="font-sans text-lg mb-8 max-w-2xl mx-auto">
                            Enhance your experience with these powerful tools designed to protect your digital footprint and manage your online presence.
                        </p>
                    </div>
                </section>

                {/* Extensions Grid Section */}
                <section className="bg-white rounded-3xl shadow-2xl overflow-hidden py-12 px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-purple-800 font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                            Available Extensions
                        </h2>
                        <p className="font-sans text-purple-800 text-lg max-w-2xl mx-auto">
                            Download these extensions to better control and manage your data privacy and protection.
                        </p>
                    </div>

                    {error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {extensions.map((extension) => (
                                <div key={extension.id} className="items-center justify-center flex flex-col text-center extension-card bg-gradient-to-br from-indigo-50 to-white shadow-lg rounded-lg p-8 transform hover:scale-105 transition-transform duration-300">
                                    <h3 className="text-purple-800 font-bold text-2xl mb-4">
                                        {extension.name}
                                    </h3>
                                    <p className="text-purple-600 mb-6">{extension.description}</p>
                                    <button
                                        onClick={() => handleDownload(extension.id)}
                                        className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-purple-700 hover:scale-105 transform"
                                    >
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Extensions;