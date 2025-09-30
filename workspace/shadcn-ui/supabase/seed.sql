-- Sample seed data for Hatch Real Estate Platform
-- This file contains initial data to populate the database

-- Insert sample firms
INSERT INTO firms (id, name, license_number, address, phone, email, subscription_tier, seats_purchased, seats_used) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sunshine Realty Group', 'FL-BK-123456', '123 Main St, Miami, FL 33101', '(305) 555-0101', 'info@sunshinefl.com', 'professional', 10, 3),
('550e8400-e29b-41d4-a716-446655440002', 'Coastal Properties LLC', 'FL-BK-789012', '456 Ocean Ave, Fort Lauderdale, FL 33301', '(954) 555-0202', 'contact@coastalfl.com', 'enterprise', 25, 8);

-- Insert sample profiles (these would normally be created via auth triggers)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, firm_id, license_number, verified_investor) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'broker@sunshinefl.com', 'Sarah', 'Johnson', '(305) 555-0111', 'primary_broker', '550e8400-e29b-41d4-a716-446655440001', 'FL-SL-123456', false),
('550e8400-e29b-41d4-a716-446655440011', 'agent1@sunshinefl.com', 'Mike', 'Rodriguez', '(305) 555-0112', 'agent', '550e8400-e29b-41d4-a716-446655440001', 'FL-SL-234567', false),
('550e8400-e29b-41d4-a716-446655440012', 'agent2@sunshinefl.com', 'Lisa', 'Chen', '(305) 555-0113', 'agent', '550e8400-e29b-41d4-a716-446655440001', 'FL-SL-345678', false),
('550e8400-e29b-41d4-a716-446655440020', 'broker@coastalfl.com', 'David', 'Thompson', '(954) 555-0211', 'primary_broker', '550e8400-e29b-41d4-a716-446655440002', 'FL-SL-456789', false),
('550e8400-e29b-41d4-a716-446655440030', 'investor@example.com', 'Jennifer', 'Williams', '(305) 555-0301', 'investor', null, null, true),
('550e8400-e29b-41d4-a716-446655440031', 'customer@example.com', 'Robert', 'Davis', '(305) 555-0302', 'customer', null, null, false);

-- Insert sample listings
INSERT INTO listings (id, mls_number, property_type, address, city, state, zip_code, county, latitude, longitude, price, square_feet, bedrooms, bathrooms, year_built, description, listing_agent_id, firm_id, public_allowed) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'MLS001234', 'residential', '789 Biscayne Blvd', 'Miami', 'FL', '33132', 'Miami-Dade', 25.7617, -80.1918, 850000.00, 2200, 3, 2.5, 2018, 'Stunning waterfront condo with panoramic bay views', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440101', 'MLS001235', 'commercial', '1000 Brickell Ave', 'Miami', 'FL', '33131', 'Miami-Dade', 25.7617, -80.1918, 2500000.00, 5000, null, null, 2015, 'Prime commercial space in Brickell financial district', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440102', 'MLS001236', 'multifamily', '500 Lincoln Rd', 'Miami Beach', 'FL', '33139', 'Miami-Dade', 25.7907, -80.1310, 1200000.00, 3200, 4, 3.0, 2010, 'Investment property with excellent rental potential', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', true);

-- Insert sample listing media
INSERT INTO listing_media (listing_id, media_type, url, title, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'photo', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Living Room', 1),
('550e8400-e29b-41d4-a716-446655440100', 'photo', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'Kitchen', 2),
('550e8400-e29b-41d4-a716-446655440101', 'photo', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'Office Space', 1),
('550e8400-e29b-41d4-a716-446655440102', 'photo', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'Exterior', 1);

-- Insert sample leads
INSERT INTO leads (first_name, last_name, email, phone, source, stage, assigned_agent_id, firm_id, notes) VALUES
('John', 'Smith', 'john.smith@email.com', '(305) 555-1001', 'Website', 'new', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Interested in waterfront properties'),
('Maria', 'Garcia', 'maria.garcia@email.com', '(305) 555-1002', 'Referral', 'contacted', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Looking for investment opportunities'),
('James', 'Wilson', 'james.wilson@email.com', '(954) 555-2001', 'Social Media', 'qualified', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 'First-time homebuyer');

-- Insert sample calendar events
INSERT INTO calendar_events (title, description, start_time, end_time, location, created_by, firm_id) VALUES
('Property Showing - Biscayne Condo', 'Show waterfront condo to potential buyers', '2024-01-15 14:00:00+00', '2024-01-15 15:00:00+00', '789 Biscayne Blvd, Miami, FL', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001'),
('Team Meeting', 'Weekly team sync and market update', '2024-01-16 09:00:00+00', '2024-01-16 10:00:00+00', 'Office Conference Room', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001'),
('Client Consultation', 'Initial meeting with new investor client', '2024-01-17 16:00:00+00', '2024-01-17 17:00:00+00', 'Office', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001');