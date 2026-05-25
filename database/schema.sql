-- TripsBook Database Schema
-- Mobile-First Service Discovery Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    price VARCHAR(50),
    category_id UUID REFERENCES categories(id),
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    weekly_change DECIMAL(5,2),
    trending_badge VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Locations
CREATE TABLE IF NOT EXISTS service_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Contact Information
CREATE TABLE IF NOT EXISTS service_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Features
CREATE TABLE IF NOT EXISTS service_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Operating Hours
CREATE TABLE IF NOT EXISTS operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Popular Destinations
CREATE TABLE IF NOT EXISTS popular_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    distance VARCHAR(50),
    image VARCHAR(500),
    service_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trending Categories
CREATE TABLE IF NOT EXISTS trending_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    change VARCHAR(10) NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    period VARCHAR(20) DEFAULT 'week',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Distance Filters
CREATE TABLE IF NOT EXISTS distance_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(20) NOT NULL,
    value INTEGER NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Logs (for analytics)
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    category VARCHAR(50),
    results_count INTEGER DEFAULT 0,
    user_fingerprint VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event VARCHAR(50) NOT NULL,
    data JSONB,
    user_fingerprint VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating DESC);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured DESC);
CREATE INDEX IF NOT EXISTS idx_services_trending ON services(trending DESC);

CREATE INDEX IF NOT EXISTS idx_service_locations_coords ON service_locations USING GIST (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_service_locations_city ON service_locations(city);
CREATE INDEX IF NOT EXISTS idx_service_locations_service ON service_locations(service_id);

CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- Insert initial categories
INSERT INTO categories (id, name, icon, color, count) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'All', 'home', 'bg-blue-500', 1250),
    ('550e8400-e29b-41d4-a716-446655440002', 'Hotels', 'building', 'bg-purple-500', 450),
    ('550e8400-e29b-41d4-a716-446655440003', 'Transport', 'car', 'bg-green-500', 320),
    ('550e8400-e29b-41d4-a716-446655440004', 'Food', 'utensils', 'bg-orange-500', 280),
    ('550e8400-e29b-41d4-a716-446655440005', 'Shopping', 'shopping-bag', 'bg-pink-500', 200)
ON CONFLICT (id) DO NOTHING;

-- Insert initial trending categories
INSERT INTO trending_categories (name, change, color, icon) VALUES
    ('Hotels', '+23%', 'bg-purple-500', 'building'),
    ('Transport', '+18%', 'bg-green-500', 'car'),
    ('Food', '+12%', 'bg-orange-500', 'utensils'),
    ('Shopping', '+8%', 'bg-pink-500', 'shopping-bag')
ON CONFLICT DO NOTHING;

-- Insert initial distance filters
INSERT INTO distance_filters (label, value, count) VALUES
    ('< 1 km', 1, 45),
    ('< 5 km', 5, 128),
    ('< 10 km', 10, 234),
    ('Any distance', 0, 1250)
ON CONFLICT DO NOTHING;

-- Insert popular destinations
INSERT INTO popular_destinations (name, country, rating, distance, service_count) VALUES
    ('Lagos', 'Nigeria', 4.8, '0km', 1250),
    ('Abuja', 'Nigeria', 4.7, '500km', 850),
    ('Port Harcourt', 'Nigeria', 4.6, '650km', 420),
    ('Kano', 'Nigeria', 4.5, '800km', 320)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popular_destinations_updated_at BEFORE UPDATE ON popular_destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
