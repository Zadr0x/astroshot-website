import { useState } from 'react';

import { services as initialServices } from '@/components/sections/ServicesSection';

export default function ServicesCmsPage() {
  const [services, setServices] = useState(initialServices);

  const handleSave = (serviceId, updatedData) => {
    // This will eventually save to Supabase
    console.log(`Saving service ${serviceId}:`, updatedData);
    setServices(services.map(s => s.id === serviceId ? { ...s, ...updatedData } : s));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>
      <div className="space-y-8">
        {services.map((service) => (
          <ServiceEditor key={service.id} service={service} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}


function ServiceEditor({ service, onSave }) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [clients, setClients] = useState((service.client_list || []).join(', '));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(service.id, { title, description, client_list: clients.split(', ').map(c => c.trim()) });
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl shadow-sm border">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <span className="text-3xl text-[#01F17C]">{service.icon}</span>
        {service.title}
      </h2>
      
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01F17C] focus:border-[#01F17C] sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01F17C] focus:border-[#01F17C] sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client List (comma-separated)</label>
          <input 
            type="text" 
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01F17C] focus:border-[#01F17C] sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          type="submit"
          className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#01F17C] text-black hover:bg-opacity-80 transition-all"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
