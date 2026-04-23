
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

export default async function ClientLogoWall() {
  const supabase = createClient();
  const { data: clientLogos, error } = await supabase
    .from('clients')
    .select('name, logo_url')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching client logos:', error);
    // Optionally return a fallback or null
    return null;
  }

  // Filter out any logos that failed to load
  const validLogos = clientLogos.filter(logo => logo.logo_url);{
  return (
    <div className="bg-[#050505] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-xl font-600 text-white mb-12">
          Trusted by 150+ Global Enterprises
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {validLogos.map((logo) => (
            <Image
              key={logo.name}
              src={logo.logo_url!}
              alt={logo.name}
              height={32} // Adjusted for a smaller, consistent height
              width={0} // Setting width to 0 and using styles for auto-width
              style={{ width: 'auto', height: '32px' }}
              className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
