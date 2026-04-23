import Image from 'next/image';

const clientLogos = [
  { name: 'Mercedes', path: '/logos/mercedes.svg' },
  { name: 'Chevrolet', path: '/logos/chevrolet.svg' },
  { name: 'NBK', path: '/logos/nbk.svg' },
  { name: 'Honda', path: '/logos/honda.svg' },
  { name: 'National Geographic', path: '/logos/national_geographic.svg' },
  { name: 'MG', path: '/logos/mg.svg' },
  { name: 'BMW', path: '/logos/bmw.svg' },
  { name: 'BYD', path: '/logos/byd.svg' },
  { name: 'Virgin Mobile', path: '/logos/virgin-mobile.svg' },
  { name: 'Jahez', path: '/logos/jahez.svg' },
  { name: 'KIB', path: '/logos/kib.svg' },
  { name: 'Ford', path: '/logos/ford.svg' },
  { name: 'Cadillac', path: '/logos/cadillac.svg' },
  { name: 'Warehouse', path: '/logos/warehouse.svg' },
  { name: 'BLVCK Paris', path: '/logos/blvck.svg' },
  { name: 'Caribou', path: '/logos/caribou.svg' },
  { name: 'Gulf Bank', path: '/logos/gulf-bank.svg' },
  { name: 'Trolley', path: '/logos/trolley.svg' },
  { name: 'Future Kid', path: '/logos/future-kid.svg' },
  { name: 'Zain', path: '/logos/zain.svg' },
  { name: 'UR', path: '/logos/ur.svg' },
  { name: 'Costa', path: '/logos/costa.svg' },
  { name: 'Qasr Alawani', path: '/logos/qasr_alawani.svg' },
  { name: 'GIG', path: '/logos/gig.svg' },
  { name: 'IKEA', path: '/logos/ikea.svg' },
  { name: 'Kuwait Times', path: '/logos/kuwait_times.svg' },
  { name: 'Just Burger', path: '/logos/just_burger.svg' },
  { name: 'Atyab Al-Sheekh', path: '/logos/atyab_al-sheekh.svg' },
  { name: 'Dasman', path: '/logos/dasman.svg' },
  { name: "Toby's Estate", path: '/logos/tobys_estate.svg' },
  { name: 'Nadco', path: '/logos/nadco.svg' },
  { name: 'Al-Tijari', path: '/logos/al-tijari.svg' },
  { name: 'Homz', path: '/logos/homz.svg' },
  { name: 'Arms Polyclinic', path: '/logos/arms_polyclinic.svg' },
  { name: 'Nail Station', path: '/logos/nail_station.svg' },
  { name: 'Ibraheem Al-Qurashi', path: '/logos/ibraheem_al-qurashi.svg' },
];

export default function ClientLogoWall() {
  return (
    <div className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-16">
          Trusted by Global & Regional Enterprises
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-8 gap-y-10 items-center">
          {clientLogos.map((logo) => (
            <div key={logo.name} className="flex justify-center items-center">
              <Image
                src={logo.path}
                alt={logo.name}
                width={120}
                height={40}
                className="object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
