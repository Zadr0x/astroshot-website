'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import ServiceEditor from '@/components/admin/ServiceEditor';

export default function ServicesCmsPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*').order('id');
      if (data) {
        setServices(data);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  const handleSave = async (serviceId, updatedData) => {
    const { data, error } = await supabase
      .from('services')
      .update(updatedData)
      .eq('id', serviceId)
      .select();

    if (error) {
      console.error('Error updating service:', error);
    } else if (data) {
      setServices(services.map(s => s.id === serviceId ? data[0] : s));
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading services...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Services</h1>
      <div className="space-y-8">
        {services.map((service) => (
          <ServiceEditor key={service.id} service={service} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}
