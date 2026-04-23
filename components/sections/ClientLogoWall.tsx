
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
  { name: 'Nike', path: '/logos/nike.svg' },
  { name: 'Google', path: '/logos/google.svg' },
  { name: 'Warner Bros', path: '/logos/warner-bros.svg' },
  { name: 'Boss', path: '/logos/boss.svg' },
  { name: 'Adidas', path: '/logos/adidas.svg' },
  { name: 'Aston Martin', path: '/logos/aston-martin.svg' },
  { name: 'NFL', path: '/logos/nfl.svg' },
  { name: 'Playstation', path: '/logos/playstation.svg' },
  { name: 'Paramount', path: '/logos/paramount.svg' },
  { name: 'Porsch', path: '/logos/porsch.svg' },
  { name: 'AMG', path: '/logos/amg.svg' },
  { name: 'Volkswagen', path: '/logos/volkswagen.svg' },
  { name: 'Lamborghini', path: '/logos/lamborghini.svg' },
  { name: 'Loreal', path: '/logos/loreal.svg' },
  { name: 'Victorias Secret', path: '/logos/victorias-secret.svg' },
  { name: 'Head and Shoulders', path: '/logos/headandshoulders.svg' },
  { name: 'White Label', path: '/logos/white-label.svg' },
  { name: 'Dubai', path: '/logos/dubai.svg' },
  { name: 'Intersport', path: '/logos/intersport.svg' },
  { name: 'Benefit', path: '/logos/benefit.svg' },
  { name: 'Kawasaki', path: '/logos/kawasaki.svg' },
  { name: 'Dyson', path: '/logos/dyson.svg' },
  { name: 'Midea', path: '/logos/midea.svg' },
  { name: 'Ésika', path: '/logos/esika.svg' },
  { name: 'Abu Dhabi', path: '/logos/abudhabi.svg' },
  { name: 'Siro', path: '/logos/siro.svg' },
  { name: 'Dove', path: '/logos/dove.svg' },
  { name: 'Belcorp', path: '/logos/belcorp.svg' },
  { name: 'UFC', path: '/logos/ufc.svg' },
  { name: 'Aritzia', path: '/logos/aritzia.svg' },
  { name: 'Xiaomi', path: '/logos/xiaomi.svg' },
  { name: 'Iqoo', path: '/logos/iqoo.svg' },
  { name: 'Tiger', path: '/logos/tiger.svg' },
  { name: 'Emaar', path: '/logos/emaar.svg' },
  { name: 'Botim', path: '/logos/botim.svg' },
  { name: 'Mashreq', path: '/logos/mashreq.svg' },
  { name: 'Heineken', path: '/logos/heineken.svg' },
  { name: 'Hugo', path: '/logos/hugo.svg' },
  { name: 'Cera', path: '/logos/cera.svg' },
  { name: 'Shoe Mart', path: '/logos/shoemart.svg' },
  { name: 'Toyota Racing', path: '/logos/toyota-racing.svg' },
  { name: 'MM', path: '/logos/mm.svg' },
  { name: 'Visa', path: '/logos/visa.svg' },
  { name: 'SailGP', path: '/logos/sailgp.svg' },
  { name: 'Breitling', path: '/logos/breitling.svg' },
  { name: 'OpenTable', path: '/logos/opentable.svg' },
  { name: 'Polly', path: '/logos/polly.svg' },
  { name: 'Hilton', path: '/logos/hilton.svg' },
  { name: 'Subway', path: '/logos/subway.svg' },
  { name: 'Asahi', path: '/logos/asahi.svg' },
  { name: 'Fairmont', path: '/logos/fairmont.svg' },
  { name: 'Amazon', path: '/logos/amazon.svg' },
];

export default function ClientLogoWall() {
  return (
    <div className="bg-[#050505] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-600 text-white mb-12">
          Trusted by 150+ Global Enterprises
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {clientLogos.map((logo) => (
            <Image
              key={logo.name}
              src={logo.path}
              alt={logo.name}
              width={100}
              height={40}
              className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
