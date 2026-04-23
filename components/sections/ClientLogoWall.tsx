import React from 'react';

const clientNames = [
  'Mercedes', 'BMW', 'Honda', 'Ford', 'BYD', 'Cadillac', 'Chevrolet', 'Gulf Bank', 
  'NBK', 'IKEA', 'Costa Coffee', 'Jahez', 'Trolley', 'National Geographic', 
  'Virgin Mobile', 'Huawei', 'Nike', 'Google', 'Warner Bros', 'Boss', 'Adidas',
  'Aston Martin', 'NFL', 'Playstation', 'Paramount', 'Porsche', 'AMG', 
  'Volkswagen', 'Lamborghini', 'Loreal', "Victoria's Secret", 'Head and Shoulders',
  'Dubai', 'Intersport', 'Benefit', 'Kawasaki', 'Dyson', 'Midea', 'Ésika',
  'Abu Dhabi', 'Siro', 'Dove', 'Belcorp', 'UFC', 'Aritzia', 'Xiaomi', 'Iqoo',
  'Tiger', 'Emaar', 'Botim', 'Mashreq', 'Heineken', 'Hugo', 'CeraVe', 'Shoe Mart',
  'Toyota Racing', 'M&M', 'Visa', 'SailGP', 'Breitling', 'OpenTable', 'Polly',
  'Hilton', 'Subway', 'Asahi', 'Fairmont', 'Amazon'
];

export default function ClientLogoWall() {
  return (
    <div className="bg-[#050505] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-12">
          Trusted by 150+ Global Enterprises
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
