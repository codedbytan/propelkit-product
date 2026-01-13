-- Marketplace Blueprint Database Schema
-- Run this in Supabase SQL Editor

-- Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate INTEGER, -- in paise
  availability TEXT DEFAULT 'available', -- available | busy | unavailable
  total_earnings INTEGER DEFAULT 0, -- in paise
  completed_jobs INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings/Services Table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL, -- in paise
  delivery_time INTEGER, -- in days
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- active | paused | closed
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- in paise
  status TEXT DEFAULT 'pending', -- pending | accepted | in_progress | completed | cancelled
  message TEXT,
  start_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending', -- pending | paid | refunded
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Provider Profiles Policies
CREATE POLICY "Anyone can view provider profiles" ON provider_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own provider profile" ON provider_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile" ON provider_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Listings Policies
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM provider_profiles WHERE id = listings.provider_id AND user_id = auth.uid()
  ));

CREATE POLICY "Providers can create listings" ON listings
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM provider_profiles WHERE id = provider_id AND user_id = auth.uid()
  ));

CREATE POLICY "Providers can update their own listings" ON listings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM provider_profiles WHERE id = provider_id AND user_id = auth.uid()
  ));

CREATE POLICY "Providers can delete their own listings" ON listings
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM provider_profiles WHERE id = provider_id AND user_id = auth.uid()
  ));

-- Bookings Policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    EXISTS (SELECT 1 FROM provider_profiles WHERE id = provider_id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Providers and buyers can update their bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = buyer_id OR
    EXISTS (SELECT 1 FROM provider_profiles WHERE id = provider_id AND user_id = auth.uid())
  );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND buyer_id = auth.uid() AND status = 'completed')
  );

CREATE POLICY "Reviewers can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Indexes for performance
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_listings_provider_id ON listings(provider_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
