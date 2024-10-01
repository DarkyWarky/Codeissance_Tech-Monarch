import React from 'react';
import { useEffect } from 'react';
import gsap from 'gsap';



function Landing() {
    useEffect(() => {
        const tl = gsap.timeline();
    
        // Set initial state
        gsap.set('.hero-text', { opacity: 0, y: -50 });
        gsap.set('.hero-image', { opacity: 0, scale: 0.9 });
        gsap.set('.hero-button', { opacity: 0, y: 20 });
    
        // GSAP animations for the hero section
        tl.to('.hero-text', {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.3,
          ease: 'power2.out',
        })
          .to('.hero-image', {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          }, "-=0.5") // Overlap the image animation slightly
          .to('.hero-button', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          }, "-=0.5"); // Delay overlap for smooth effect
      }, []);
    
      

      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
    
          <main className="container mx-auto p-0">
            {/* Hero Section */}
            <section className="h-screen overflow-hidden shadow-2xl ">
              <div className="h-full bg-gradient-to-br from-purple-600 to-indigo-700 p-8 ">
                <div className="flex flex-col md:flex-row items-center justify-center text-center">
                  <div className="md:w-3/6 m-24 mb-8 md:mb-0">
                    <h1 className="hero-text font-heading text-white font-bold text-4xl md:text-5xl lg:text-8xl mb-6 leading-tight">
                      Be Smarter with Your{' '}
                      <span className="text-purple-200">Personal Data</span>{' '}
                      Online
                    </h1>
                    <p className="hero-text font-sans text-purple-100 text-xl mb-8">
                      Discover how to manage and protect your personal information
                      effectively. Join us in exploring new ways to stay secure and
                      informed.
                    </p>
                    <a href='#features' className="hero-button bg-white text-purple-700 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-purple-100 hover:scale-105 transform">
                    Explore Features
                    </a>
                  </div>
                  <div className="hero-image">
                    <img
                      src="/image1.jpg"
                      alt="Personal Data Management"
                      width={200}
                      height={200}
                      className="rounded-lg shadow-2xl w-full h-auto max-w-md mx-auto hover:scale-105 transition duration-300 ease-in-out"
                    />
                  </div>
                </div>
              </div>
            </section>

        {/* Feature Section */}
        <section className="bg-white rounded-3xl shadow-2xl overflow-hidden ">
          <div className=" h-screen md:p-12">
            <div className="text-center">
              <h2 className="font-heading text-purple-800 font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                Protect Your Digital Identity
              </h2>
              <p className="font-sans text-purple-800 text-lg mb-8 max-w-2xl mx-auto">
                Learn about the latest techniques and tools to safeguard your online presence and keep your personal information secure.
              </p>
              <button className="bg-white text-purple-700 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-purple-100 hover:scale-105 transform ">
                Get Started
              </button>
            </div>
            <div id='features' className='flex space-x-24 py-20'>
              <img src="/1.png" alt="1." width={100} height={100} />
              <div>
              <h3 className="font-heading text-purple-800 font-bold text-3xl md:text-2xl lg:text-4xl mb-6">
                Companies having your Data
              </h3>
              
              </div>
            </div>
            <div id='features' className='flex space-x-24 py-20'>
            <img src="/2.png" alt="" width={100} height={100}/>
              <div>
              <h3 className="font-heading text-purple-800 font-bold text-3xl md:text-2xl lg:text-4xl mb-6">
                Quickly understand online exposure and the risks
              </h3>
              </div>
              </div>
              <div id='features' className='flex space-x-24 py-20'>
            <img src="/3.png" alt="" width={100} height={100}/>
              <div>
              <h3 className="font-heading text-purple-800 font-bold text-3xl md:text-2xl lg:text-4xl mb-6">
                Be proactive and take necessary action
              </h3>
              </div>
              </div>
          </div>
          
        </section>

        {/* Info Section */}
        <section className="bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="font-playfair text-purple-800 font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
                  Stay Informed, Stay Safe
                </h2>
                <p className="font-sans text-purple-700 text-lg mb-8">
                  Get the latest updates on data protection laws, cybersecurity threats, and best practices for maintaining your digital privacy.
                </p>
                <button className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-purple-700 hover:scale-105 transform">
                  Learn More
                </button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://th.bing.com/th/id/OIP.Jo1lWrbHUewQHxCfLH6bZQHaE8?rs=1&pid=ImgDetMain" 
                  alt="Stay Informed" 
                  className="rounded-lg shadow-2xl w-full h-auto max-w-md mx-auto hover:scale-105 transition duration-300 ease-in-out"
                />  
                
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;