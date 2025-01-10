import React from 'react';
import heroImage from '../assets/student_headphone1.jpeg'; // Place the image in the assets folder

const Hero = () => {
  return (
    <section className="flex flex-col md:flex-row items-center bg-gray-100 px-8 py-12 mt-10">
      <div className="text-center md:text-left md:w-1/2">
        <h1 className="text-7xl font-bold text-blue-600">Welcome to ASTRA</h1>
        <p className="mt-4 text-gray-700 font-bold text-2xl">
          Empower your learning with advanced text-to-speech technology, document management, and progress tracking. Join the revolution of smarter studying today!
        </p>
        <button type="button" className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-lg px-5 py-2.5 text-center me-2 mb-2 mt-4 ">Get Started</button>
      </div>
      <div className="md:w-1/2 mt-8 md:mt-0">
        <img src={heroImage} alt="Student studying with headphones" className="rounded-3xl shadow-md" />
      </div>
    </section>
  );
};

export default Hero;