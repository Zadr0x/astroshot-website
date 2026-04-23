
import Image from 'next/image';

const clientLogos = [
  { name: 'Mercedes', path: '/logos/mercedes.svg' },
  { name: 'BMW', path: '/logos/bmw.svg' },
  { name: 'Honda', path: '/logos/honda.svg' },
  { name: 'Ford', path: '/logos/ford.svg' },
  { name: 'BYD', path: '/logos/byd.svg' },
  { name: 'Cadillac', path: '/logos/cadillac.svg' },
  { name: 'Chevrolet', path: '/logos/chevrolet.svg' },
  { name: 'Gulf Bank', path: '/logos/gulf-bank.svg' },
  { name: 'NBK', path: '/logos/nbk.svg' },
  { name: 'IKEA', path: '/logos/ikea.svg' },
  { name: 'Costa Coffee', path: '/logos/costa-coffee.svg' },
  { name: 'Jahez', path: '/logos/jahez.svg' },
  { name: 'Trolley', path: '/logos/trolley.svg' },
  { name: 'National Geographic', path: '/logos/national-geographic.svg' },
  { name: 'Virgin Mobile', path: '/logos/virgin-mobile.svg' },
  { name: 'Huawei', path: '/logos/huawei.svg' },
];

export default function ClientLogoWall() {
  return (
    <div className="bg-[#050505] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-600 text-white mb-12">
          Trusted by 100+ Global Enterprises
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {clientLogos.map((logo) => (
            <Image
              key={logo.name}
              src={logo.path}
              alt={logo.name}
              width={100}
              height={40}
              className="opacity-60 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
