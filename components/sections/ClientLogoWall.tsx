import React from 'react';

const clientNames = [
  'Mercedes', 'Chevrolet', 'NBK', 'Honda', 'National Geographic', 'MG', 'BMW', 
  'BYD', 'Virgin Mobile', 'Jahez', 'KIB', 'Ford', 'Cadillac', 'Warehouse', 
  'BLVCK Paris', 'Caribou', 'Gulf Bank', 'Trolley', 'Future Kid', 'Zain', 'UR', 
  'Costa', 'Qasr Alawani', 'GIG', 'IKEA', 'Kuwait Times', 'Just Burger', 
  'Atyab Al-Sheekh', 'Dasman', "Toby's Estate", 'Nadco', 'Al-Tijari', 'Homz', 
  'Arms Polyclinic', 'Nail Station', 'Ibraheem Al-Qurashi'
];

export default function ClientLogoWall() {
  return (
    <div className="bg-[#050505] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-12">
          Trusted by Global & Regional Enterprises
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {clientNames.map((name) => (
            <div
              key={name}
              className="text-gray-400/80 hover:text-white transition-colors text-base"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
