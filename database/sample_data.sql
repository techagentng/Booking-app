-- Sample Data for TripsBook Database
-- Nigerian-focused service providers

-- Insert sample services
INSERT INTO services (id, name, type, description, image, rating, price, category_id, featured, trending) VALUES
    -- Hotels
    ('svc_001', 'Eko Hotel & Suites', 'Hotel', 'Luxury beachfront hotel with stunning ocean views and world-class amenities', '/images/hotels/eko.jpg', 4.5, '₦45,000', '550e8400-e29b-41d4-a716-446655440002', true, false),
    ('svc_002', 'Transcorp Hilton Abuja', 'Hotel', 'Luxury hotel in the heart of Abuja with world-class amenities', '/images/hotels/transcorp.jpg', 4.7, '₦65,000', '550e8400-e29b-41d4-a716-446655440002', true, true),
    ('svc_003', 'Federal Palace Hotel', 'Hotel', 'Historic luxury hotel with modern amenities and business center', '/images/hotels/federal.jpg', 4.6, '₦55,000', '550e8400-e29b-41d4-a716-446655440002', false, true),
    
    -- Restaurants
    ('svc_004', 'Jevinik Restaurant', 'Restaurant', 'Authentic Nigerian cuisine with cultural experience', '/images/restaurants/jevinik.jpg', 4.3, '₦8,000', '550e8400-e29b-41d4-a716-446655440004', true, false),
    ('svc_005', 'Terra Kulture', 'Restaurant', 'Contemporary Nigerian cuisine with art gallery experience', '/images/restaurants/terra.jpg', 4.8, '₦12,000', '550e8400-e29b-41d4-a716-446655440004', true, true),
    ('svc_006', 'Yellow Chilli', 'Restaurant', 'Modern Nigerian and international fusion cuisine', '/images/restaurants/yellowchilli.jpg', 4.2, '₦6,500', '550e8400-e29b-41d4-a716-446655440004', false, false),
    
    -- Transport
    ('svc_007', 'Uber Premium', 'Transport', 'Premium ride service with professional drivers', '/images/transport/uber.jpg', 4.6, 'From ₦400', '550e8400-e29b-41d4-a716-446655440003', true, true),
    ('svc_008', 'Bolt Ride', 'Transport', 'Affordable and reliable ride sharing service', '/images/transport/bolt.jpg', 4.4, 'From ₦500', '550e8400-e29b-41d4-a716-446655440003', true, false),
    ('svc_009', 'Lagos State Taxi', 'Transport', 'Official government taxi service with regulated fares', '/images/transport/lagos-taxi.jpg', 3.8, 'From ₦300', '550e8400-e29b-41d4-a716-446655440003', false, false),
    
    -- Shopping
    ('svc_010', 'Shoprite', 'Shopping', 'Popular supermarket chain with groceries and household items', '/images/shopping/shoprite.jpg', 4.5, 'Various', '550e8400-e29b-41d4-a716-446655440005', true, false),
    ('svc_011', 'Lagos Mall', 'Shopping', 'Premium shopping mall with international brands', '/images/shopping/lagos-mall.jpg', 4.6, 'Free', '550e8400-e29b-41d4-a716-446655440005', true, false),
    ('svc_012', 'Palms Shopping Mall', 'Shopping', 'Family-friendly shopping center with entertainment', '/images/shopping/palms.jpg', 4.3, 'Free', '550e8400-e29b-41d4-a716-446655440005', false, false)
ON CONFLICT (id) DO NOTHING;

-- Insert service locations
INSERT INTO service_locations (service_id, address, city, state, country, latitude, longitude) VALUES
    -- Lagos Locations
    ('svc_001', '1415 Adetokunbo Ademola Street', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_004', 'Victoria Island, Lagos', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_005', 'Victoria Island, Lagos', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_008', 'Various locations, Lagos', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_010', 'Multiple locations, Lagos', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_011', 'Lekki-Epe Expressway, Lagos', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    
    -- Abuja Locations
    ('svc_002', '1 Constitution Avenue', 'Abuja', 'FCT', 'Nigeria', 9.0579, 7.4951),
    ('svc_003', 'Ahmadu Bello Way', 'Abuja', 'FCT', 'Nigeria', 9.0579, 7.4951),
    
    -- Port Harcourt Locations
    ('svc_012', 'Rumuokwuta, Port Harcourt', 'Port Harcourt', 'Rivers State', 'Nigeria', 4.8156, 7.0498),
    
    -- Nationwide Services
    ('svc_007', 'Nationwide coverage', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903),
    ('svc_009', 'All Lagos areas', 'Lagos', 'Lagos State', 'Nigeria', 6.4474, 3.3903)
ON CONFLICT (service_id) DO NOTHING;

-- Insert service contacts
INSERT INTO service_contacts (service_id, phone, email, website) VALUES
    ('svc_001', '+234-1-2778000', 'eko.suites@ekohotels.com', 'https://ekohotels.com'),
    ('svc_002', '+234-800-000-0000', 'abuja@transcorphilton.com', 'https://transcorphilton.com'),
    ('svc_003', '+234-9-4617000', 'info@federalpalacehotel.com', 'https://federalpalacehotel.com'),
    ('svc_004', '+234-803-333-3333', 'info@jevinik.com', 'https://jevinik.com'),
    ('svc_005', '+234-1-2778000', 'info@terrakulture.com', 'https://terrakulture.com'),
    ('svc_006', '+234-1-2700000', 'info@yellowchilli.com.ng', 'https://yellowchilli.com.ng'),
    ('svc_007', '+234-700-500-0000', 'support@uber.com', 'https://uber.com'),
    ('svc_008', '+234-700-500-0001', 'support@bolt.eu', 'https://bolt.eu'),
    ('svc_009', '+234-802-444-4444', 'info@lagostaxi.com', 'https://lagostaxi.com'),
    ('svc_010', '+234-803-333-5555', 'info@shoprite.com.ng', 'https://shoprite.com.ng'),
    ('svc_011', '+234-1-2778000', 'info@lagosmall.com', 'https://lagosmall.com'),
    ('svc_012', '+234-84-777-7777', 'info@palmsmall.com.ng', 'https://palmsmall.com.ng')
ON CONFLICT (service_id) DO NOTHING;

-- Insert service features
INSERT INTO service_features (service_id, feature) VALUES
    -- Hotel Features
    ('svc_001', 'WiFi'), ('svc_001', 'Pool'), ('svc_001', 'Beach Access'), ('svc_001', 'Spa'), ('svc_001', 'Restaurant'), ('svc_001', 'Bar'),
    ('svc_002', 'WiFi'), ('svc_002', 'Pool'), ('svc_002', 'Gym'), ('svc_002', 'Spa'), ('svc_002', 'Restaurant'), ('svc_002', 'Business Center'),
    ('svc_003', 'WiFi'), ('svc_003', 'Pool'), ('svc_003', 'Business Center'), ('svc_003', 'Conference Rooms'),
    
    -- Restaurant Features
    ('svc_004', 'Local Cuisine'), ('svc_004', 'Delivery'), ('svc_004', 'Outdoor Seating'), ('svc_004', 'Private Dining'),
    ('svc_005', 'Cultural Experience'), ('svc_005', 'Art Gallery'), ('svc_005', 'Live Music'), ('svc_005', 'Private Events'),
    ('svc_006', 'Fusion Cuisine'), ('svc_006', 'Bar'), ('svc_006', 'Delivery'), ('svc_006', 'Takeout'),
    
    -- Transport Features
    ('svc_007', 'GPS Tracking'), ('svc_007', 'Professional Drivers'), ('svc_007', 'Air Conditioning'), ('svc_007', 'Cashless Payment'),
    ('svc_008', 'GPS Tracking'), ('svc_008', 'Affordable Rates'), ('svc_008', '24/7 Service'), ('svc_008', 'Multiple Vehicle Types'),
    ('svc_009', 'Regulated Fares'), ('svc_009', 'Professional Drivers'), ('svc_009', 'Airport Transfer'),
    
    -- Shopping Features
    ('svc_010', 'Groceries'), ('svc_010', 'Household Items'), ('svc_010', 'Electronics'), ('svc_010', 'Pharmacy'),
    ('svc_011', 'International Brands'), ('svc_011', 'Food Court'), ('svc_011', 'Cinema'), ('svc_011', 'Parking'),
    ('svc_012', 'Family Entertainment'), ('svc_012', 'Shopping'), ('svc_012', 'Dining'), ('svc_012', 'Cinema')
ON CONFLICT (service_id, feature) DO NOTHING;

-- Insert operating hours
INSERT INTO operating_hours (service_id, day_of_week, open_time, close_time, is_closed) VALUES
    -- Hotels (24/7)
    ('svc_001', 'Monday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Tuesday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Wednesday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Thursday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Friday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Saturday', '00:00:00', '23:59:59', false),
    ('svc_001', 'Sunday', '00:00:00', '23:59:59', false),
    
    ('svc_002', 'Monday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Tuesday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Wednesday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Thursday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Friday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Saturday', '00:00:00', '23:59:59', false),
    ('svc_002', 'Sunday', '00:00:00', '23:59:59', false),
    
    -- Restaurants
    ('svc_004', 'Monday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Tuesday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Wednesday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Thursday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Friday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Saturday', '11:00:00', '23:00:00', false),
    ('svc_004', 'Sunday', '11:00:00', '23:00:00', false),
    
    ('svc_005', 'Monday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Tuesday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Wednesday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Thursday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Friday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Saturday', '10:00:00', '22:00:00', false),
    ('svc_005', 'Sunday', '10:00:00', '22:00:00', false),
    
    -- Transport (24/7)
    ('svc_007', 'Monday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Tuesday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Wednesday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Thursday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Friday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Saturday', '00:00:00', '23:59:59', false),
    ('svc_007', 'Sunday', '00:00:00', '23:59:59', false),
    
    -- Shopping Malls
    ('svc_011', 'Monday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Tuesday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Wednesday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Thursday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Friday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Saturday', '10:00:00', '21:00:00', false),
    ('svc_011', 'Sunday', '10:00:00', '21:00:00', false)
ON CONFLICT (service_id, day_of_week) DO NOTHING;

-- Update trending services with weekly change
UPDATE services SET 
    weekly_change = 23.5,
    trending_badge = '🔥 Hot'
WHERE id = 'svc_002';

UPDATE services SET 
    weekly_change = 18.2,
    trending_badge = '📈 Rising'
WHERE id = 'svc_005';

UPDATE services SET 
    weekly_change = 15.8,
    trending_badge = '⭐ Popular'
WHERE id = 'svc_007';

-- Update category counts
UPDATE categories SET count = (
    SELECT COUNT(*) 
    FROM services 
    WHERE category_id = categories.id
);

-- Update trending categories with current data
UPDATE trending_categories SET 
    change = (SELECT CASE 
        WHEN name = 'Hotels' THEN '+23%'
        WHEN name = 'Transport' THEN '+18%'
        WHEN name = 'Food' THEN '+12%'
        WHEN name = 'Shopping' THEN '+8%'
        ELSE '+0%'
    END)
WHERE name IN ('Hotels', 'Transport', 'Food', 'Shopping');
