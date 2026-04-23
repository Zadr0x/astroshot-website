'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ServiceEditor from '@/components/admin/ServiceEditor';

export default function ServicesCmsPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setServices(data);
      setLoading(false);
    }
    fetchServices();
  }, []);

  const handleSave = async (serviceId: string, updatedData: any) => {
    const { data, error } = await supabase
      .from('services')
      .update(updatedData)
      .eq('id', serviceId)
      .select();

    if (!error && data) {
      setServices(services.map(s => s.id === serviceId ? data[0] : s));
      alert('Saved successfully!');
    } else {
      alert('Error saving. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading services...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Manage Services</h1>
      <p className="text-gray-400 mb-8">Edit the services shown on your website. Click "Save Changes" after each edit.</p>
      <div className="space-y-8">
        {services.map((service) => (
          <ServiceEditor key={service.id} service={service} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}
