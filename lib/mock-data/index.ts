import type {
  UserProfile, TrainingSession, Exercise, Match, MatchAnalysis,
  Equipment, Badge, TrainingProgram, ProRoutine,
  FollowActivity, Location, AIReport, ChatMessage,
} from '@/lib/types'

// ────────────────────────────────────────────────────────────
// Current User
// ────────────────────────────────────────────────────────────
export const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Lucas Martin',
  username: 'lucas.pp',
  email: 'lucas.martin@ping-pang.fr',
  country: 'France',
  city: 'Paris',
  club: 'Racing Club de France TT',
  level: 'advanced',
  playing_style: 'attacker',
  dominant_hand: 'right',
  coach_mode: true,
  weekly_goal: { sessions_per_week: 4, hours_per_week: 6, matches_per_week: 2 },
  current_equipment_id: 'equip-1',
  created_at: '2024-09-15T10:00:00Z',
  updated_at: '2025-05-10T18:00:00Z',
}

// ────────────────────────────────────────────────────────────
// Equipment
// ────────────────────────────────────────────────────────────
export const mockEquipments: Equipment[] = [
  {
    id: 'equip-1',
    user_id: 'user-1',
    blade: { brand: 'Butterfly', model: 'Viscaria' },
    forehand_rubber: { brand: 'Butterfly', model: 'Tenergy 05', thickness: 'max' },
    backhand_rubber: { brand: 'Butterfly', model: 'Rozena', thickness: '2.1' },
    start_date: '2024-11-01',
    hours_played: 142,
    active: true,
  },
  {
    id: 'equip-2',
    user_id: 'user-1',
    blade: { brand: 'Stiga', model: 'Allround Evolution' },
    forehand_rubber: { brand: 'XIOM', model: 'Vega Europe', thickness: '2.0' },
    backhand_rubber: { brand: 'XIOM', model: 'Vega Europe', thickness: '2.0' },
    start_date: '2024-03-01',
    hours_played: 215,
    active: false,
  },
]

// ────────────────────────────────────────────────────────────
// Exercises (20 exercises)
// ────────────────────────────────────────────────────────────
export const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Service pendule classique',
    category: 'service',
    description: 'Travail du service pendule avec variation de longueur et d\'effet.',
    objective: 'Maîtriser l\'effet brossé latéral pour créer de l\'incertitude chez l\'adversaire.',
    duration_estimate: 15,
    recommended_levels: ['beginner', 'intermediate', 'advanced'],
    difficulty: 2,
  },
  {
    id: 'ex-2',
    name: 'Service tomahawk',
    category: 'service',
    description: 'Service avec rotation latérale prononcée, coup droit.',
    objective: 'Développer la maîtrise des effets latéraux complexes.',
    duration_estimate: 20,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 4,
  },
  {
    id: 'ex-3',
    name: 'Remise courte en poussette',
    category: 'return',
    description: 'Placement de balle courte après service court adverse.',
    objective: 'Neutraliser les services courts et court-circuiter l\'attaque adverse.',
    duration_estimate: 15,
    recommended_levels: ['intermediate', 'advanced', 'expert'],
    difficulty: 3,
  },
  {
    id: 'ex-4',
    name: 'Flip sur balle courte',
    category: 'return',
    description: 'Attaque directe sur balle courte avec flip du poignet.',
    objective: 'Transformer la remise en attaque directe.',
    duration_estimate: 20,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 4,
  },
  {
    id: 'ex-5',
    name: 'Top spin coup droit en régularité',
    category: 'topspin',
    description: 'Échanges croisés en top spin côté coup droit sur table complète.',
    objective: 'Développer la régularité et la puissance du top spin CD.',
    duration_estimate: 20,
    recommended_levels: ['intermediate', 'advanced', 'expert'],
    difficulty: 2,
  },
  {
    id: 'ex-6',
    name: 'Top spin revers diagonal',
    category: 'topspin',
    description: 'Travail du top spin revers en diagonal avec variation de cadence.',
    objective: 'Construire la confiance et la régularité du top spin revers.',
    duration_estimate: 20,
    recommended_levels: ['intermediate', 'advanced'],
    difficulty: 3,
  },
  {
    id: 'ex-7',
    name: 'Top spin contre bloc',
    category: 'topspin',
    description: 'Joueur A top spine, joueur B bloque. Alternance des rôles.',
    objective: 'Apprendre à gérer la vitesse et à accélérer en jeu de bloc.',
    duration_estimate: 25,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 3,
  },
  {
    id: 'ex-8',
    name: 'Bloc en retraite',
    category: 'block',
    description: 'Blocage en retraite face à des top spins accélérés.',
    objective: 'Travailler la stabilité défensive sous pression.',
    duration_estimate: 20,
    recommended_levels: ['intermediate', 'advanced'],
    difficulty: 3,
  },
  {
    id: 'ex-9',
    name: 'Bloc actif (contre-attaque)',
    category: 'block',
    description: 'Bloc avec relâchement du poignet pour contre-attaquer.',
    objective: 'Transformer le bloc en arme offensive.',
    duration_estimate: 20,
    recommended_levels: ['advanced', 'expert'],
    difficulty: 4,
  },
  {
    id: 'ex-10',
    name: 'Déplacement latéral 2 points',
    category: 'footwork',
    description: 'Jeu de jambes entre deux points fixes, alternance gauche-droite.',
    objective: 'Améliorer la réactivité et le placement de base.',
    duration_estimate: 15,
    recommended_levels: ['beginner', 'intermediate', 'advanced'],
    difficulty: 2,
  },
  {
    id: 'ex-11',
    name: 'Déplacement 3 points CD dominant',
    category: 'footwork',
    description: 'Triangulation de jeu en priorisant le coup droit.',
    objective: 'Développer le déplacement pour jouer le maximum de coups droit.',
    duration_estimate: 20,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 4,
  },
  {
    id: 'ex-12',
    name: 'Régularité croisé en multi-balles',
    category: 'regularity',
    description: 'Multi-balles avec envoi régulier pour travailler la régularité en échanges.',
    objective: 'Installer un rythme de frappe stable et reproductible.',
    duration_estimate: 20,
    recommended_levels: ['beginner', 'intermediate'],
    difficulty: 1,
  },
  {
    id: 'ex-13',
    name: 'Echange 20 balles sans faute',
    category: 'regularity',
    description: 'Compter les échanges sans faute et progresser dans l\'objectif.',
    objective: 'Construire la concentration et la constance technique.',
    duration_estimate: 15,
    recommended_levels: ['intermediate', 'advanced'],
    difficulty: 2,
  },
  {
    id: 'ex-14',
    name: 'Visualisation pré-match',
    category: 'mental',
    description: 'Exercice de visualisation guidé avec scenarios de jeu.',
    objective: 'Préparer mentalement les situations de match et renforcer la confiance.',
    duration_estimate: 10,
    recommended_levels: ['intermediate', 'advanced', 'expert', 'pro'],
    difficulty: 1,
  },
  {
    id: 'ex-15',
    name: 'Routines de concentration',
    category: 'mental',
    description: 'Protocole de routine entre les points (respiration, rebond, focus).',
    objective: 'Maintenir la concentration tout au long d\'un match.',
    duration_estimate: 10,
    recommended_levels: ['beginner', 'intermediate', 'advanced', 'expert', 'pro'],
    difficulty: 1,
  },
  {
    id: 'ex-16',
    name: 'Gainage spécifique TT',
    category: 'physical',
    description: 'Circuit de gainage adapté aux exigences physiques du tennis de table.',
    objective: 'Renforcer le centre de gravité et la stabilité du tronc.',
    duration_estimate: 20,
    recommended_levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    difficulty: 2,
  },
  {
    id: 'ex-17',
    name: 'Sprint et récupération',
    category: 'physical',
    description: 'Intervalles courts de sprint suivi de récupération active.',
    objective: 'Développer la condition physique spécifique à l\'effort intermittent.',
    duration_estimate: 20,
    recommended_levels: ['intermediate', 'advanced', 'expert', 'pro'],
    difficulty: 3,
  },
  {
    id: 'ex-18',
    name: 'Service courte-longue mixte',
    category: 'service',
    description: 'Alternance aléatoire service court et long pour tromper la lecture.',
    objective: 'Créer l\'incertitude sur la longueur du service.',
    duration_estimate: 15,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 3,
  },
  {
    id: 'ex-19',
    name: 'Top spin après poussette longue',
    category: 'topspin',
    description: 'Séquence poussette longue + top spin d\'attaque.',
    objective: 'Enchaîner la phase de mise en jeu avec une première attaque.',
    duration_estimate: 20,
    recommended_levels: ['intermediate', 'advanced'],
    difficulty: 3,
  },
  {
    id: 'ex-20',
    name: 'Jeu de situation 3rd ball attack',
    category: 'topspin',
    description: 'Simulation de la 3ème balle avec service + top spin d\'attaque.',
    objective: 'Construire l\'automatisme service-attaque directe.',
    duration_estimate: 25,
    recommended_levels: ['advanced', 'expert', 'pro'],
    difficulty: 4,
  },
]

const getExercise = (id: string) => mockExercises.find(e => e.id === id)!

// ────────────────────────────────────────────────────────────
// Training Sessions
// ────────────────────────────────────────────────────────────
export const mockSessions: TrainingSession[] = [
  {
    id: 'session-1',
    user_id: 'user-1',
    date: '2025-05-12',
    duration: 90,
    type: 'partner',
    location: 'Racing Club de France',
    exercises: [
      { exercise_id: 'ex-5', exercise: getExercise('ex-5'), duration: 25 },
      { exercise_id: 'ex-6', exercise: getExercise('ex-6'), duration: 25 },
      { exercise_id: 'ex-20', exercise: getExercise('ex-20'), duration: 30 },
    ],
    notes: 'Bonne séance. CD bien mais RV à améliorer sous pression.',
    feeling: 4,
    fatigue: 55,
    motivation: 80,
    confidence: 70,
    coach_comment: 'Bon travail sur le top spin CD. Continuer à travailler le RV en sortie de poussette.',
    created_at: '2025-05-12T20:30:00Z',
  },
  {
    id: 'session-2',
    user_id: 'user-1',
    date: '2025-05-10',
    duration: 60,
    type: 'multi-balls',
    location: 'Racing Club de France',
    exercises: [
      { exercise_id: 'ex-1', exercise: getExercise('ex-1'), duration: 15 },
      { exercise_id: 'ex-12', exercise: getExercise('ex-12'), duration: 20 },
      { exercise_id: 'ex-10', exercise: getExercise('ex-10'), duration: 20 },
    ],
    notes: 'Travail service et déplacement. Fatiguant mais efficace.',
    feeling: 3,
    fatigue: 75,
    motivation: 65,
    confidence: 60,
    created_at: '2025-05-10T19:00:00Z',
  },
  {
    id: 'session-3',
    user_id: 'user-1',
    date: '2025-05-08',
    duration: 120,
    type: 'match-training',
    location: 'Racing Club de France',
    exercises: [
      { exercise_id: 'ex-7', exercise: getExercise('ex-7'), duration: 40 },
      { exercise_id: 'ex-9', exercise: getExercise('ex-9'), duration: 30 },
    ],
    notes: 'Séance jeu très intense. 4 sets joués contre Thomas.',
    feeling: 5,
    fatigue: 80,
    motivation: 90,
    confidence: 85,
    coach_comment: 'Excellente progression sur le bloc actif. Continuer !',
    created_at: '2025-05-08T21:00:00Z',
  },
  {
    id: 'session-4',
    user_id: 'user-1',
    date: '2025-05-06',
    duration: 45,
    type: 'physical',
    location: 'Salle de sport',
    exercises: [
      { exercise_id: 'ex-16', exercise: getExercise('ex-16'), duration: 20 },
      { exercise_id: 'ex-17', exercise: getExercise('ex-17'), duration: 20 },
    ],
    notes: 'Préparation physique. Gainage + sprints.',
    feeling: 3,
    fatigue: 70,
    motivation: 70,
    confidence: 65,
    created_at: '2025-05-06T18:00:00Z',
  },
  {
    id: 'session-5',
    user_id: 'user-1',
    date: '2025-05-05',
    duration: 90,
    type: 'partner',
    location: 'Racing Club de France',
    exercises: [
      { exercise_id: 'ex-3', exercise: getExercise('ex-3'), duration: 20 },
      { exercise_id: 'ex-4', exercise: getExercise('ex-4'), duration: 20 },
      { exercise_id: 'ex-19', exercise: getExercise('ex-19'), duration: 30 },
    ],
    notes: 'Focus remise de service. Flip difficile mais en progrès.',
    feeling: 4,
    fatigue: 60,
    motivation: 75,
    confidence: 68,
    created_at: '2025-05-05T20:00:00Z',
  },
  {
    id: 'session-6',
    user_id: 'user-1',
    date: '2025-04-30',
    duration: 75,
    type: 'solo',
    location: 'Racing Club de France',
    exercises: [
      { exercise_id: 'ex-1', exercise: getExercise('ex-1'), duration: 30 },
      { exercise_id: 'ex-18', exercise: getExercise('ex-18'), duration: 30 },
    ],
    notes: 'Travail service solo. Bonne concentration.',
    feeling: 4,
    fatigue: 40,
    motivation: 80,
    confidence: 75,
    created_at: '2025-04-30T19:30:00Z',
  },
]

// ────────────────────────────────────────────────────────────
// Matches
// ────────────────────────────────────────────────────────────
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    user_id: 'user-1',
    opponent_name: 'Thomas Leroy',
    opponent_level: 'advanced',
    match_type: 'friendly',
    date: '2025-05-11',
    location: 'Racing Club de France',
    sets: [
      { player: 11, opponent: 8 },
      { player: 9, opponent: 11 },
      { player: 11, opponent: 7 },
      { player: 11, opponent: 9 },
    ],
    result: 'win',
    source: 'manual',
    created_at: '2025-05-11T22:00:00Z',
  },
  {
    id: 'match-2',
    user_id: 'user-1',
    opponent_name: 'Antoine Mercier',
    opponent_level: 'expert',
    match_type: 'tournament',
    date: '2025-05-04',
    location: 'Salle Omnisports Paris 11e',
    sets: [
      { player: 7, opponent: 11 },
      { player: 11, opponent: 9 },
      { player: 8, opponent: 11 },
      { player: 9, opponent: 11 },
    ],
    result: 'loss',
    source: 'manual',
    created_at: '2025-05-04T20:00:00Z',
  },
  {
    id: 'match-3',
    user_id: 'user-1',
    opponent_name: 'Karim Benhamed',
    opponent_level: 'intermediate',
    match_type: 'ranking',
    date: '2025-04-27',
    location: 'ASPTT Paris',
    sets: [
      { player: 11, opponent: 6 },
      { player: 11, opponent: 4 },
      { player: 11, opponent: 8 },
    ],
    result: 'win',
    source: 'ranking',
    created_at: '2025-04-27T21:00:00Z',
  },
  {
    id: 'match-4',
    user_id: 'user-1',
    opponent_name: 'Pierre Dubois',
    opponent_level: 'advanced',
    match_type: 'friendly',
    date: '2025-04-20',
    location: 'Racing Club de France',
    sets: [
      { player: 11, opponent: 9 },
      { player: 12, opponent: 10 },
      { player: 11, opponent: 8 },
    ],
    result: 'win',
    source: 'manual',
    created_at: '2025-04-20T20:30:00Z',
  },
  {
    id: 'match-5',
    user_id: 'user-1',
    opponent_name: 'Julien Petit',
    opponent_level: 'expert',
    match_type: 'tournament',
    date: '2025-04-12',
    location: 'Open de Paris',
    sets: [
      { player: 8, opponent: 11 },
      { player: 6, opponent: 11 },
      { player: 11, opponent: 9 },
      { player: 8, opponent: 11 },
    ],
    result: 'loss',
    source: 'manual',
    created_at: '2025-04-12T15:00:00Z',
  },
]

// ────────────────────────────────────────────────────────────
// Match Analysis
// ────────────────────────────────────────────────────────────
export const mockAnalyses: MatchAnalysis[] = [
  {
    id: 'analysis-1',
    match_id: 'match-1',
    user_id: 'user-1',
    summary: 'Victoire solide face à Thomas Leroy (Advanced). Tu as dominé les échanges avec un top spin coup droit efficace et une première balle agressive. La perte du 2ème set révèle une fragilité sur les défenses en revers après 3 échanges. Ton service pendule a créé 4 points directs.',
    strengths: [
      'Top spin coup droit dominant sur les 3 sets gagnés',
      'Service pendule efficace (4 points directs)',
      'Bonne gestion du score dans les moments décisifs',
      'Déplacement latéral propre sur les 3 premiers sets',
    ],
    weaknesses: [
      'Revers sous pression : 6 fautes directes au 2ème set',
      'Gestion des balles coupées en milieu d\'échange',
      'Placement à mi-distance en défense',
    ],
    recommendations: [
      'Travailler le revers en situation de fatigue et de pression',
      'Développer une alternative au top spin CD quand la balle est coupée',
      'Intégrer des exercices de bloc actif revers dans tes séances',
    ],
    suggested_exercise_ids: ['ex-6', 'ex-8', 'ex-9'],
    generated_at: '2025-05-11T23:00:00Z',
    status: 'done',
  },
]

// Badges
// ────────────────────────────────────────────────────────────
export const mockBadges: Badge[] = [
  { id: 'badge-1', name: '7 jours d\'affilée', description: 'Jouer 7 jours consécutifs', icon: 'Flame', category: 'regularity', unlocked: true, unlocked_at: '2025-03-14' },
  { id: 'badge-2', name: 'Régularité 30j', description: '20 séances en 30 jours', icon: 'Calendar', category: 'regularity', unlocked: true, unlocked_at: '2025-04-20' },
  { id: 'badge-3', name: 'Mois parfait', description: '30 jours consécutifs de pratique', icon: 'Star', category: 'regularity', unlocked: false, progress: 40, target_label: '12/30 jours' },
  { id: 'badge-4', name: '50 séances', description: 'Enregistrer 50 séances d\'entraînement', icon: 'Dumbbell', category: 'volume', unlocked: true, unlocked_at: '2025-02-28' },
  { id: 'badge-5', name: '100 heures', description: 'Cumuler 100 heures d\'entraînement', icon: 'Clock', category: 'volume', unlocked: true, unlocked_at: '2025-04-05' },
  { id: 'badge-6', name: '200 heures', description: 'Cumuler 200 heures d\'entraînement', icon: 'Trophy', category: 'volume', unlocked: false, progress: 71, target_label: '142/200h' },
  { id: 'badge-7', name: 'Première victoire', description: 'Remporter ton premier match enregistré', icon: 'Award', category: 'matches', unlocked: true, unlocked_at: '2024-10-02' },
  { id: 'badge-8', name: '10 victoires', description: 'Remporter 10 matchs', icon: 'Medal', category: 'matches', unlocked: true, unlocked_at: '2025-01-15' },
  { id: 'badge-9', name: '25 victoires', description: 'Remporter 25 matchs', icon: 'Crown', category: 'matches', unlocked: false, progress: 60, target_label: '15/25 victoires' },
  { id: 'badge-10', name: '+50 ranking', description: 'Gagner 50 points ranking en un mois', icon: 'TrendingUp', category: 'progression', unlocked: true, unlocked_at: '2024-12-01' },
  { id: 'badge-11', name: 'Analyse IA', description: 'Générer ta première analyse IA de match', icon: 'Cpu', category: 'progression', unlocked: true, unlocked_at: '2025-01-20' },
  { id: 'badge-12', name: 'Programme complet', description: 'Terminer un programme d\'entraînement', icon: 'CheckCircle', category: 'progression', unlocked: false, progress: 30, target_label: '3/10 séances' },
]

// ────────────────────────────────────────────────────────────
// Training Programs
// ────────────────────────────────────────────────────────────
export const mockPrograms: TrainingProgram[] = [
  {
    id: 'program-1',
    user_id: 'user-1',
    name: 'Renforcement revers — 4 semaines',
    description: 'Programme recommandé par l\'IA suite à l\'analyse du match contre Thomas Leroy. Focus sur le revers sous pression et le bloc actif.',
    sessions: [
      { id: 'ps-1', name: 'Séance 1 — Bloc revers', exercise_ids: ['ex-8', 'ex-9'], completed: true, scheduled_date: '2025-05-05' },
      { id: 'ps-2', name: 'Séance 2 — Top spin RV', exercise_ids: ['ex-6', 'ex-7'], completed: true, scheduled_date: '2025-05-07' },
      { id: 'ps-3', name: 'Séance 3 — Remise courte', exercise_ids: ['ex-3', 'ex-4'], completed: true, scheduled_date: '2025-05-09' },
      { id: 'ps-4', name: 'Séance 4 — RV en match', exercise_ids: ['ex-7', 'ex-9', 'ex-13'], completed: false, scheduled_date: '2025-05-14' },
      { id: 'ps-5', name: 'Séance 5 — Consolidation', exercise_ids: ['ex-6', 'ex-8', 'ex-13'], completed: false, scheduled_date: '2025-05-16' },
      { id: 'ps-6', name: 'Séance 6 — Match test', exercise_ids: ['ex-7', 'ex-9', 'ex-20'], completed: false, scheduled_date: '2025-05-18' },
    ],
    status: 'active',
    ai_generated: true,
    created_at: '2025-05-11T23:30:00Z',
    progress: 50,
  },
  {
    id: 'program-2',
    user_id: 'user-1',
    name: 'Programme service avancé',
    description: 'Travail intensif des services avec variation d\'effet, longueur et placement pour créer plus d\'incertitude.',
    sessions: [
      { id: 'ps-7', name: 'Séance 1 — Pendule', exercise_ids: ['ex-1'], completed: true },
      { id: 'ps-8', name: 'Séance 2 — Tomahawk', exercise_ids: ['ex-2'], completed: true },
      { id: 'ps-9', name: 'Séance 3 — Mixte', exercise_ids: ['ex-18'], completed: true },
      { id: 'ps-10', name: 'Séance 4 — 3rd ball', exercise_ids: ['ex-20'], completed: true },
    ],
    status: 'completed',
    ai_generated: false,
    created_at: '2025-04-01T10:00:00Z',
    progress: 100,
  },
]

// ────────────────────────────────────────────────────────────
// Pro Routines
// ────────────────────────────────────────────────────────────
export const mockProRoutines: ProRoutine[] = [
  {
    id: 'pro-1',
    player_name: 'Timo Boll',
    player_country: 'Allemagne',
    player_rank: 8,
    description: 'Légende du tennis de table européen. Style polyvalent avec un revers exceptionnel et une lecture de jeu hors norme.',
    equipment: {
      blade: 'Butterfly Timo Boll ALC',
      forehand_rubber: 'Butterfly Dignics 09C (max)',
      backhand_rubber: 'Butterfly Dignics 05 (max)',
    },
    favorite_exercise_ids: ['ex-6', 'ex-7', 'ex-14', 'ex-15'],
    training_hours_per_week: 35,
    tips: [
      'La qualité de tes services détermine la qualité de tes attaques. Travaille-les chaque jour.',
      'Le mental est 50% du jeu au niveau avancé. La concentration entre les points est essentielle.',
      'La régularité d\'entraînement vaut mieux que l\'intensité ponctuelle.',
    ],
    video_label: 'Routine d\'entraînement — Bundesliga 2024',
  },
  {
    id: 'pro-2',
    player_name: 'Alexis Lebrun',
    player_country: 'France',
    player_rank: 4,
    description: 'Prodige français, numéro 1 français à 20 ans. Jeu explosif et agressif, top spin dévastateur côté coup droit.',
    equipment: {
      blade: 'Butterfly Viscaria',
      forehand_rubber: 'Butterfly Dignics 09C (max)',
      backhand_rubber: 'Butterfly Dignics 05 (2.1mm)',
    },
    favorite_exercise_ids: ['ex-5', 'ex-11', 'ex-20', 'ex-2'],
    training_hours_per_week: 42,
    tips: [
      'Commence chaque séance par 15 minutes de travail de service. C\'est la base.',
      'Le déplacement est ce qui distingue un bon joueur d\'un excellent. Ne jamais négliger le physique.',
      'Joue contre des joueurs meilleurs que toi aussi souvent que possible.',
    ],
    video_label: 'Préparation WTT Grand Smash 2025',
  },
  {
    id: 'pro-3',
    player_name: 'Wang Manyu',
    player_country: 'Chine',
    player_rank: 2,
    description: 'Numéro 2 mondiale, attaquante au jeu complet avec un revers de classe mondiale et une lecture tactique exceptionnelle.',
    equipment: {
      blade: 'DHS Hurricane Long 5X',
      forehand_rubber: 'DHS Hurricane 3 National (max)',
      backhand_rubber: 'Butterfly Tenergy 05 (2.1mm)',
    },
    favorite_exercise_ids: ['ex-7', 'ex-9', 'ex-12', 'ex-15'],
    training_hours_per_week: 50,
    tips: [
      'La constance bat l\'improvisation. Construis tes points avec patience.',
      'Chaque faute est une information. Analyse systématiquement tes erreurs.',
    ],
    video_label: 'Camp d\'entraînement national — Pékin',
  },
]

// ────────────────────────────────────────────────────────────
// Social (followed players)
// ────────────────────────────────────────────────────────────
export const mockFollowedUsers = [
  { id: 'user-2', username: 'thomas.tt', name: 'Thomas Leroy', club: 'Racing Club de France', level: 'advanced' as const },
  { id: 'user-3', username: 'marie.ping', name: 'Marie Fontaine', club: 'AS Pontoise TT', level: 'expert' as const },
  { id: 'user-4', username: 'remy.spin', name: 'Rémy Carpentier', club: 'Stade de Vanves', level: 'advanced' as const },
]

export const mockFollowActivities: FollowActivity[] = [
  {
    id: 'fa-1',
    user: mockFollowedUsers[0],
    activity_type: 'session',
    activity_id: 'session-ext-1',
    activity_summary: '90min de partenaire — Racing Club',
    date: '2025-05-12T19:00:00Z',
    public: true,
  },
  {
    id: 'fa-2',
    user: mockFollowedUsers[1],
    activity_type: 'match',
    activity_id: 'match-ext-1',
    activity_summary: 'Victoire 3/1 face à Claire Moreau — Tournoi open',
    date: '2025-05-11T16:00:00Z',
    public: true,
  },
  {
    id: 'fa-3',
    user: mockFollowedUsers[2],
    activity_type: 'session',
    activity_id: 'session-ext-2',
    activity_summary: '60min multi-balles — Stade de Vanves',
    date: '2025-05-10T20:00:00Z',
    public: true,
  },
  {
    id: 'fa-4',
    user: mockFollowedUsers[0],
    activity_type: 'match',
    activity_id: 'match-ext-2',
    activity_summary: 'Défaite 1/3 face à Antoine Mercier — Championnat',
    date: '2025-05-09T18:00:00Z',
    public: true,
  },
]

// ────────────────────────────────────────────────────────────
// Locations
// ────────────────────────────────────────────────────────────
export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'Racing Club de France TT',
    address: '5 rue Éblé',
    city: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8494, lng: 2.3120 },
    club_name: 'Racing Club de France',
    tables_count: 12,
    hours: 'Lun-Ven 17h-22h, Sam 10h-18h',
    sessions_count: 38,
    matches_count: 8,
  },
  {
    id: 'loc-2',
    name: 'Salle Omnisports Paris 11e',
    address: '18 rue Jacquard',
    city: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8606, lng: 2.3822 },
    tables_count: 6,
    hours: 'Mar-Jeu 18h-21h',
    sessions_count: 5,
    matches_count: 2,
  },
  {
    id: 'loc-3',
    name: 'ASPTT Paris TT',
    address: '1 avenue Pierre de Coubertin',
    city: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8178, lng: 2.3614 },
    club_name: 'ASPTT Paris',
    tables_count: 8,
    hours: 'Lun, Mer, Ven 18h30-22h',
    sessions_count: 3,
    matches_count: 1,
  },
  {
    id: 'loc-4',
    name: 'Stade de Vanves TT',
    address: '33 rue Raymond Marcheron',
    city: 'Vanves',
    country: 'France',
    coordinates: { lat: 48.8224, lng: 2.2897 },
    club_name: 'Stade de Vanves',
    tables_count: 10,
    hours: 'Lun-Sam 17h-22h',
    sessions_count: 2,
    matches_count: 0,
  },
]

// ────────────────────────────────────────────────────────────
// AI Reports
// ────────────────────────────────────────────────────────────
export const mockAIReports: AIReport[] = [
  {
    id: 'report-1',
    user_id: 'user-1',
    type: 'weekly',
    period_start: '2025-05-06',
    period_end: '2025-05-12',
    summary: 'Excellente semaine avec 4 séances et 1 match. Progression notable sur le top spin coup droit. La motivation et la confiance sont en hausse. Volume d\'entraînement dans les objectifs.',
    positives: [
      '4 séances enregistrées — objectif hebdo atteint',
      'Confiance en hausse (+12 pts vs semaine précédente)',
      'Victoire face à Thomas Leroy (résultat cohérent avec progression ELO)',
      'Travail régulier sur le top spin CD',
    ],
    improvements: [
      'Revers sous pression : point de fragilité identifié lors du match',
      'Fatigue élevée jeudi — prévoir un jour de récupération active',
      'Objectif matchs (2/sem) non atteint : 1 match seulement',
    ],
    recommended_program: 'Renforcement revers — 4 semaines',
    generated_at: '2025-05-12T23:00:00Z',
  },
]

// ────────────────────────────────────────────────────────────
// Chat messages
// ────────────────────────────────────────────────────────────
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Bonjour Lucas ! Je suis ton assistant Ping Pang. Je connais tes séances, matchs et statistiques. Comment puis-je t\'aider aujourd\'hui ?',
    timestamp: '2025-05-12T10:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Comment progresser sur mon revers ?',
    timestamp: '2025-05-12T10:01:00Z',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: 'Bonne question ! En analysant tes dernières séances et ton match face à Thomas, j\'ai identifié que ton revers cède sous pression après 3 échanges. Je recommande :\n\n**Court terme (2 semaines) :**\n- Exercice Bloc actif (ex-9) : 3x par semaine, 20 min\n- Top spin RV diagonal (ex-6) sous fatigue\n\n**Moyen terme :**\n- Séances de match-training avec focus revers volontaire\n- Travail vidéo sur ta position de base en RV\n\nTon programme actuel inclut déjà ces axes — continue sur cette lancée !',
    timestamp: '2025-05-12T10:01:30Z',
  },
]
