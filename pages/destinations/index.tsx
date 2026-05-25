import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Search, MapPin, Star, Users, ChevronRight, Filter, ArrowLeft } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  rating: number;
  distance: string;
  image: string;
  service_count: number;
  description: string;
  highlights: string[];
}

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Lagos',
    country: 'Nigeria',
    rating: 4.8,
    distance: '0 km',
    image: 'https://picsum.photos/seed/lagos/400/300.jpg',
    service_count: 1247,
    description: 'Nigeria\'s commercial capital and largest city, known for its vibrant culture, beaches, and bustling markets.',
    highlights: ['Victoria Island', 'Lekki', 'Ikeja', 'Surulere'],
  },
  {
    id: '2',
    name: 'Abuja',
    country: 'Nigeria',
    rating: 4.7,
    distance: '520 km',
    image: 'https://picsum.photos/seed/abuja/400/300.jpg',
    service_count: 856,
    description: 'Nigeria\'s capital city, featuring modern architecture, government buildings, and beautiful landscapes.',
    highlights: ['Central Area', 'Maitama', 'Asokoro', 'Wuse'],
  },
  {
    id: '3',
    name: 'Port Harcourt',
    country: 'Nigeria',
    rating: 4.6,
    distance: '450 km',
    image: 'https://picsum.photos/seed/portharcourt/400/300.jpg',
    service_count: 534,
    description: 'Known as the Garden City, famous for its oil industry and beautiful gardens.',
    highlights: ['Garden City', 'Trans Amadi', 'GRA', 'Rumuola'],
  },
  {
    id: '4',
    name: 'Ibadan',
    country: 'Nigeria',
    rating: 4.5,
    distance: '130 km',
    image: 'https://picsum.photos/seed/ibadan/400/300.jpg',
    service_count: 423,
    description: 'The largest city in West Africa by land mass, home to the prestigious University of Ibadan.',
    highlights: ['UI', 'Bodija', 'Challenge', 'Mokola'],
  },
  {
    id: '5',
    name: 'Kano',
    country: 'Nigeria',
    rating: 4.7,
    distance: '800 km',
    image: 'https://picsum.photos/seed/kano/400/300.jpg',
    service_count: 389,
    description: 'Historic city in northern Nigeria, known for its ancient walls and rich cultural heritage.',
    highlights: ['Old City', 'Kurmi Market', 'Gidan Makama', 'Dala Hill'],
  },
  {
    id: '6',
    name: 'Calabar',
    country: 'Nigeria',
    rating: 4.8,
    distance: '650 km',
    image: 'https://picsum.photos/seed/calabar/400/300.jpg',
    service_count: 267,
    description: 'Beautiful coastal city known for its annual carnival and delicious cuisine.',
    highlights: ['Tinapa', 'Calabar Carnival', 'Marina Resort', 'Monkey Sanctuary'],
  },
  {
    id: '7',
    name: 'Enugu',
    country: 'Nigeria',
    rating: 4.6,
    distance: '300 km',
    image: 'https://picsum.photos/seed/enugu/400/300.jpg',
    service_count: 234,
    description: 'Coal City State, located in southeastern Nigeria with rolling hills and coal deposits.',
    highlights: ['Okpara Square', 'Nike Lake', 'Ngwo Pine Forest', 'Milliken Hill'],
  },
  {
    id: '8',
    name: 'Benin City',
    country: 'Nigeria',
    rating: 4.5,
    distance: '320 km',
    image: 'https://picsum.photos/seed/benin/400/300.jpg',
    service_count: 198,
    description: 'Historic city known for the Benin Bronzes and the ancient Benin Kingdom.',
    highlights: ['Oba Palace', 'Benin Moat', 'Igun Street', 'National Museum'],
  },
];

export default function DestinationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(mockDestinations);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockDestinations.filter(dest =>
      dest.name.toLowerCase().includes(query.toLowerCase()) ||
      dest.country.toLowerCase().includes(query.toLowerCase()) ||
      dest.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDestinations(filtered);
  };

  const handleDestinationClick = (destination: Destination) => {
    // Navigate to providers page filtered by destination
    router.push(`/providers?location=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Popular Destinations</h1>
            <div className="w-20" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{mockDestinations.length}</div>
            <div className="text-sm text-gray-600">Total Destinations</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {mockDestinations.reduce((sum, d) => sum + d.service_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Services</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {(mockDestinations.reduce((sum, d) => sum + d.rating, 0) / mockDestinations.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">Nigeria</div>
            <div className="text-sm text-gray-600">Country</div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleDestinationClick(destination)}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg">{destination.name}</h3>
                  <p className="text-white/80 text-sm">{destination.country}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">{destination.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.distance}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{destination.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{destination.service_count} services</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {destination.highlights.slice(0, 3).map((highlight, idx) => (
                    <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  View Services
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No destinations found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
