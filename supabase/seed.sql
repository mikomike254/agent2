-- Seed Data for Tech Developers Kenya & East Africa
-- Demo/Test Data

-- =======================
-- USERS
-- =======================

INSERT INTO users (id, email, name, phone, role, verified, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@techdev.ke', 'Admin User', '+254700000001', 'admin', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000002', 'esther@commissions.ke', 'Esther Njeri', '+254700000002', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000003', 'paul@commissions.ke', 'Paul Kimani', '+254700000003', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000004', 'grace@commissions.ke', 'Grace Wanjiku', '+254700000004', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000005', 'aisha@devteam.co', 'Aisha Dube', '+254700000005', 'developer', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000006', 'james@devteam.co', 'James Omondi', '+254700000006', 'developer', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000007', 'client1@greenschool.ke', 'Green School Ltd', '+254700000007', 'client', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000008', 'client2@retailcorp.ke', 'Retail Corp', '+254700000008', 'client', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea');

-- =======================
-- COMPANIES
-- =======================

INSERT INTO companies (id, name, type, tax_id) VALUES
('10000000-0000-0000-0000-000000000001', 'DevTeam Solutions', 'software_development', 'KE123456789'),
('10000000-0000-0000-0000-000000000002', 'CodeCraft Africa', 'software_development', 'KE987654321');

-- =======================
-- COMMISSIONERS
-- =======================

INSERT INTO commissioners (user_id, tier, rate_percent, referral_code, parent_commissioner_id, kyc_status) VALUES
('00000000-0000-0000-0000-000000000002', 'tier1', 25.00, 'ESTHER2024', NULL, 'approved'),
('00000000-0000-0000-0000-000000000003', 'tier2', 27.00, 'PAUL2024', NULL, 'approved'),
('00000000-0000-0000-0000-000000000004', 'tier1', 25.00, 'GRACE2024', '00000000-0000-0000-0000-000000000002', 'approved');

-- =======================
-- DEVELOPERS
-- =======================

INSERT INTO developers (user_id, company_id, roles, hourly_rate, verified, kyc_status) VALUES
('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 
'["frontend", "crm", "ui_ux"]'::jsonb, 50.00, true, 'approved'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 
'["backend", "mobile", "payment_integration"]'::jsonb, 60.00, true, 'approved');

-- =======================
-- CLIENTS
-- =======================

INSERT INTO clients (user_id, company_name, contact_person) VALUES
('00000000-0000-0000-0000-000000000007', 'Green School Limited', 'John Kamau'),
('00000000-0000-0000-0000-000000000008', 'Retail Corp Kenya', 'Mary Akinyi');

-- =======================
-- REFERRALS
-- =======================

INSERT INTO referrals (referrer_id, referee_id, override_percent) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 5.00);

-- =======================
-- AUDIT LOGS (sample)
-- =======================

INSERT INTO audit_logs (actor_id, actor_role, action, details) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'system_initialized', '{"message": "Test data seeded"}'::jsonb);

-- =======================
-- PROJECTS
-- =======================
INSERT INTO projects (id, client_id, commissioner_id, lead_id, title, description, budget, status, project_type, created_at) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', NULL, 'School Management System', 'A comprehensive system for managing students, fees, and grades.', 150000, 'active', 'web_app', NOW() - INTERVAL '10 days'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', NULL, NULL, 'E-commerce Mobile App', 'Android and iOS app for online retail store.', 250000, 'pending', 'mobile_app', NOW() - INTERVAL '2 days');

-- =======================
-- CONVERSATIONS
-- =======================
INSERT INTO conversations (id, title, conversation_type, project_id, created_by) VALUES
-- Direct chat between Commissioner Esther and Client Green School
('30000000-0000-0000-0000-000000000001', NULL, 'direct', NULL, '00000000-0000-0000-0000-000000000002'),
-- Project Group Chat
('30000000-0000-0000-0000-000000000002', 'School System Dev Team', 'group', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- =======================
-- CONVERSATION PARTICIPANTS
-- =======================
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
-- Direct Chat Participants
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'), -- Esther
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007'), -- Green School

-- Project Group Chat Participants
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'), -- Esther
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007'), -- Green School
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005'); -- Aisha Developer

-- =======================
-- MESSAGES
-- =======================
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Hello John, how are you properly?', NOW() - INTERVAL '5 hours'),
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'I am good Esther. Ready to start the project.', NOW() - INTERVAL '4 hours'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Welcome everyone to the project group.', NOW() - INTERVAL '1 day');

