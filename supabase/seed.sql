-- Seed data for local development
-- Applied automatically by `supabase start`

-- Pro players (same as production)
INSERT INTO pro_players (full_name, country, ittf_ranking, ittf_points, play_style, birth_year, club, bio) VALUES
  ('Fan Zhendong', 'CN', 1, 13400, 'attacker', 1997, 'Guangdong', 'Numéro 1 mondial, attaquant explosif connu pour son coup droit dévastateur.'),
  ('Ma Long', 'CN', 2, 12800, 'allround', 1988, 'PLA', 'Légende vivante du tennis de table, quintuple champion olympique.'),
  ('Wang Chuqin', 'CN', 3, 11900, 'attacker', 2000, 'Beijing', 'Prodige chinois à l'attaque tranchante.'),
  ('Truls Möregårdh', 'SE', 4, 9200, 'attacker', 2000, 'Örebro TTK', 'Meilleur joueur européen, finaliste aux JO de Paris 2024.'),
  ('Félix Lebrun', 'FR', 5, 8900, 'attacker', 2006, 'TT Pontoise-Cergy', 'Prodige français, médaillé de bronze aux JO de Paris 2024 à 17 ans.'),
  ('Alexis Lebrun', 'FR', 6, 8400, 'attacker', 2004, 'TT Pontoise-Cergy', 'Frère aîné de Félix, top 10 mondial.'),
  ('Darko Jorgic', 'SI', 15, 6200, 'allround', 1998, 'Borussia Düsseldorf', 'Meilleur joueur slovène, style complet et régulier.'),
  ('Timo Boll', 'DE', 30, 4800, 'allround', 1981, 'Borussia Düsseldorf', 'Légende allemande, encore compétitif à plus de 40 ans.')
ON CONFLICT DO NOTHING;

-- Test user profile will be created automatically via trigger on auth signup.
-- Use the Supabase Studio (localhost:54323) to create a test user.
