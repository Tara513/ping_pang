# AUDIT TECHNIQUE — APP TRAINING (PING PANG)
**Date :** 2026-05-14 — **Auditeur :** Claude Code (Sonnet 4.6)

---

## 1. RÉSUMÉ EXÉCUTIF

### État global
L'app Training est un **MVP partiel, fonctionnel en lecture, partiel en écriture**. Le socle technique (Next.js 16, Supabase, Server Actions, RLS) est solide et bien pensé. Mais une fraction significative des features affichées repose encore sur des **mock data qui ne sera jamais persistée**. L'architecture séparation Training/Ranking est posée (migration 004), mais non finalisée.

### Niveau de maturité
**Prototype+ / MVP alpha**. Utilisable en développement pour démontrer le concept. **Non production-ready** sur 4 aspects critiques.

### Les 5 plus gros risques

| # | Risque | Gravité |
|---|--------|---------|
| 1 | **Bypass auth middleware** : `NEXT_PUBLIC_DEV_MODE=true` désactive toute protection de route | HIGH |
| 2 | **Programmes page 100% mock** : `getPrograms()` retourne `mockPrograms`, aucun programme réel n'est lu ni affiché | HIGH |
| 3 | **`createSession` / `createMatch` dans `lib/api/index.ts` sont des stubs factices** : si une page les appelle, les données ne sont jamais persistées | HIGH |
| 4 | **`lib/elo/calculator.ts` existe** : code de calcul ELO côté Training, source de confusion et risque de double-écriture future | MEDIUM |
| 5 | **Pas de root `middleware.ts`** détecté : `lib/supabase/middleware.ts` exporte `updateSession` mais ce fichier n'est peut-être pas branché à Next.js | HIGH — à confirmer |

### Les 5 priorités immédiates

1. Vérifier et créer le root `middleware.ts` (protection routes)
2. Brancher `programs/page.tsx` sur les vraies server actions (`getAllPrograms`)
3. Supprimer ou bloquer `createSession` / `createMatch` factices dans `lib/api`
4. Supprimer `lib/elo/calculator.ts` ou le déplacer dans un package partagé
5. Supprimer le bypass `NEXT_PUBLIC_DEV_MODE` avant tout déploiement prod

---

## 2. CARTOGRAPHIE DU PROJET

```
ping_pang-1/
├── app/
│   ├── (app)/                       # Routes authentifiées
│   │   ├── dashboard/page.tsx       # Server Component — REEL
│   │   ├── sessions/                # list (client), new (client), [id] (client)
│   │   ├── matches/                 # list (client), new (client), [id] (client), [id]/analysis
│   │   ├── elo/page.tsx             # Server Component — REEL (read-only)
│   │   ├── profile/                 # page (server), edit (server), ProfileClient (client)
│   │   ├── stats/page.tsx           # Client Component — REEL
│   │   ├── badges/page.tsx          # Client Component — REEL (partiel)
│   │   ├── programs/page.tsx        # Client Component — 100% MOCK
│   │   ├── chat/page.tsx            # a verifier
│   │   ├── ai-reports/page.tsx      # probablement mock
│   │   ├── calendar/                # a verifier
│   │   ├── equipment/               # probablement reel
│   │   ├── exercises/               # MOCK (pas de table exercises en DB)
│   │   ├── locations/               # MOCK + Mapbox
│   │   ├── pros/                    # MOCK
│   │   └── social/                  # MOCK
│   ├── login/page.tsx               # Server Component
│   ├── register/page.tsx            # Server Component
│   ├── onboarding/page.tsx          # Client Component
│   └── api/
│       ├── ai/chat/route.ts         # API Route — REEL + persisté
│       ├── ai/bilan/route.ts        # API Route — REEL + persisté
│       └── analyze-match/route.ts   # API Route — REEL mais NON persisté
├── lib/
│   ├── api/index.ts                 # HYBRIDE : Supabase + mocks + stubs factices
│   ├── mock-data/index.ts           # 840 lignes de donnees fictives
│   ├── actions/
│   │   ├── training.ts              # Server Actions REELLES (session, match, profil, onboarding)
│   │   ├── auth.ts                  # Server Actions REELLES (signin, signup, signout)
│   │   ├── badges.ts                # Server Actions REELLES (check, award, get)
│   │   └── programs.ts              # Server Actions REELLES mais NON utilisees en front
│   ├── data/shared-profile.ts       # Data layer Server Components — REEL
│   ├── supabase/
│   │   ├── client.ts                # Client Supabase (browser)
│   │   ├── server.ts                # Client Supabase (server)
│   │   └── middleware.ts            # updateSession() — root middleware.ts manquant ?
│   ├── elo/calculator.ts            # RISQUE : calcul ELO cote Training
│   ├── validation/training.ts       # Schemas Zod
│   └── types/index.ts               # Types front (divergents du schema DB)
├── types/database.ts                # Types DB Supabase (ecrits manuellement)
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   ├── migrations/002_programs_recaps_chats.sql
│   ├── migrations/003_training_hardening.sql
│   ├── migrations/004_shared_profiles_auth.sql
│   └── seed.sql                     # 8 pro players
├── messages/en.json, fr.json        # i18n — next-intl installe mais non configure
└── next.config.ts                   # Minimal, Turbopack
```

---

## 3. AUDIT FRONTEND

### Auth pages (`/login`, `/register`)

| Aspect | Etat |
|--------|------|
| Login | REEL — server action `signInWithPassword` |
| Register | REEL — server action `signUpWithPassword` |
| Validation | Zod cote server action (email, password, username) |
| Affichage erreurs | Via `searchParams.error` |
| Etat loading bouton submit | ABSENT |
| Mention "meme compte Supabase que Ranking" | Presente sur /login — bon signal |

---

### Onboarding (`/onboarding`)

| Aspect | Etat |
|--------|------|
| Fichier | `app/onboarding/page.tsx` |
| Persistance | REEL — `completeTrainingOnboarding` persiste profil, equipement, weekly_goals |
| Validation | Zod `completeTrainingOnboardingSchema` |
| Redirect si deja complete | ABSENT — l'utilisateur peut re-faire l'onboarding et ecraser ses donnees |
| `matches_per_week` | Collecte a l'etape 6 mais NON transmis au server action |
| `coach_mode` step 7 | Collecte mais NON persiste (`is_coach` absent du payload) |
| Pays | Limite a 4 options hardcodees |

---

### Dashboard (`/dashboard`)

| Aspect | Etat |
|--------|------|
| Fichier | `app/(app)/dashboard/page.tsx` + `lib/data/shared-profile.ts` |
| Architecture | Server Component — correct |
| Stats semaine (heures, seances, matchs) | REEL Supabase |
| Objectifs hebdo | REEL — lu depuis `weekly_goals` |
| Streak | REEL — calcule dans `getStreakDays()` |
| Activity feed | REEL — sessions + matchs Supabase |
| Recommandation IA | REEL — lu depuis `recaps` table |
| Bouton notification | NON FONCTIONNEL — `<button>` sans action |

---

### Seances (`/sessions`, `/sessions/new`, `/sessions/[id]`)

| Aspect | Etat |
|--------|------|
| Liste seances | REEL — `getSessions()` depuis Supabase |
| Creation seance | REEL — `createTrainingSession` server action avec Zod |
| Exercices dans creation | MOCK — `mockExercises` hardcode dans le formulaire |
| Lieu pre-rempli | "Racing Club de France" hardcode comme valeur par defaut |
| Filtre par type | Fonctionnel cote client |
| Etat erreur | ABSENT — pas d'affichage d'erreur si Supabase echoue |

---

### Matchs (`/matches`, `/matches/new`, `/matches/[id]`)

| Aspect | Etat |
|--------|------|
| Liste matchs | REEL — `getMatches()` depuis Supabase |
| Creation match | REEL — `createPersonalMatch` server action avec Zod, validation score coherente |
| Detail match | REEL — `getMatch()` depuis Supabase |
| Analyse IA (CTA) | Lien vers `/matches/${id}/analysis` base sur `match.analysis_id` qui N'EXISTE PAS dans le schema DB |
| `analysis_id` | Present dans `lib/types/index.ts:Match` mais absent de `types/database.ts` et du schema SQL |
| `/matches/[id]/analysis` | Probablement non finalise |

---

### ELO (`/elo`)

| Aspect | Etat |
|--------|------|
| Fichiers | `app/(app)/elo/page.tsx` + `EloClient.tsx` |
| Architecture | Server Component -> Client Component — correct |
| Lecture ELO | REEL Supabase — `getSharedEloRatings()` lit `elo_ratings` + `elo_history` |
| Ecriture ELO | AUCUNE ecriture cote Training (migration 004 a supprime la write policy) |
| Historique | REEL depuis `elo_history` |
| Empty state | Message clair : "Training ne crée pas d'ELO local" |

---

### Profil (`/profile`, `/profile/edit`)

| Aspect | Etat |
|--------|------|
| Lecture profil | REEL — `getTrainingProfileData()` |
| Modification profil | REEL — `updateTrainingProfile` server action + Zod |
| Avatar upload | ABSENT |

---

### Stats (`/stats`)

| Aspect | Etat |
|--------|------|
| Donnees | REEL Supabase |
| Filtre periode (7j, 30j, 6m, all) | CASSE — `void _period` dans `lib/api/index.ts:543` — les 4 boutons font le meme fetch |
| Streak | Hardcode a `0` dans `getAggregatedStats()` |

---

### Badges (`/badges`)

| Aspect | Etat |
|--------|------|
| Source donnees | `getBadges()` → Supabase reel |
| Mapping | Tres appauvri : `name = badge_type.replace('_',' ')`, `description = ''`, `icon = '★'`, `category = 'progression'` |
| Descriptions et icones riches | ABSENTES — uniquement dans le mock |
| Attribution des badges | REEL via RPC `check_and_award_badges` appelee apres creation session/match |
| Progress sur badges non debloques | NON calcule cote Training |

---

### Programmes (`/programs`)

| Aspect | Etat |
|--------|------|
| Source donnees | `getPrograms()` dans `lib/api` → `return mockPrograms` — 100% FAUX |
| Persistance | ZERO — les programmes affiches sont des fictions |
| Server actions programmes | Existent dans `lib/actions/programs.ts` mais NE SONT PAS appelees par la page |
| Bouton "Nouveau" | NON FONCTIONNEL — pas de href ni onClick |

---

### Settings (`/settings`)

| Aspect | Etat |
|--------|------|
| Toggles coach_mode / notifications | LOCAL STATE UNIQUEMENT — non persiste, reset a chaque visite |
| Sous-pages (goals, privacy, coach, notifications) | ROUTES INEXISTANTES |
| Deconnexion | REEL — server action `signOut` |

---

### Pages non analyysees en detail

| Page | Etat estime |
|------|-------------|
| `/chat` | Probablement branche sur `/api/ai/chat` |
| `/ai-reports` | Probablement mock (`mockAIReports`) |
| `/calendar` | Non analyse |
| `/equipment` | Probablement reel (`getEquipments()` est branche Supabase dans `lib/api`) |
| `/exercises`, `/exercises/[id]` | 100% mock (pas de table exercises en DB) |
| `/locations` | 100% mock + Mapbox |
| `/pros` | Mock ou pro_players sans routine |
| `/social` | 100% mock |

---

## 4. AUDIT BACKEND / API / SERVER ACTIONS

### Tableau des ecritures

| Operation | Mecanisme | Auth | Zod | Statut |
|-----------|-----------|------|-----|--------|
| signIn / signUp / signOut | Server Action `lib/actions/auth.ts` | Supabase | Oui | OK |
| createTrainingSession | Server Action `lib/actions/training.ts` | `getUser()` | Oui | OK |
| createPersonalMatch | Server Action `lib/actions/training.ts` | `getUser()` | Oui | OK |
| updateTrainingProfile | Server Action `lib/actions/training.ts` | `getUser()` | Oui | OK |
| completeTrainingOnboarding | Server Action `lib/actions/training.ts` | `getUser()` | Oui | OK |
| createProgram | Server Action `lib/actions/programs.ts` | `getUser()` | NON | Attention |
| markProgramSessionComplete | Server Action `lib/actions/programs.ts` | `getUser()` | NON | Attention |
| deleteProgram | Server Action `lib/actions/programs.ts` | `.eq("player_id", user.id)` | NON | Attention |
| checkAndAwardBadges | Server Action `lib/actions/badges.ts` | RPC SECURITY DEFINER | n/a | OK |
| POST /api/ai/chat | API Route | `getUser()` | Oui | OK |
| POST /api/ai/bilan | API Route | `getUser()` | Oui | OK |
| POST /api/analyze-match | API Route | `getUser()` | Oui | OK mais non persiste |
| createSession (lib/api) | STUB FACTICE cote client | Aucune | Non | DANGEREUX |
| createMatch (lib/api) | STUB FACTICE cote client | Aucune | Non | DANGEREUX |
| updateUser (lib/api) | Throw Error intentionnel | n/a | n/a | Bloque correctement |

### Problemes identifies

**P1 — `createSession` et `createMatch` dans `lib/api/index.ts` sont des stubs factices**
- `lib/api/index.ts:292-298` : retourne `{ id: 'session-${Date.now()}', ...data }` sans ecrire en DB
- `lib/api/index.ts:342-348` : meme chose pour match
- Les pages `sessions/new` et `matches/new` utilisent bien les server actions — OK
- Mais rien n'empeche un futur developpeur de les appeler — donnees silencieusement perdues

**P2 — `lib/actions/programs.ts:markProgramSessionComplete` sans verification ownership explicite**
- Ligne 113 : `.eq("id", programSessionId)` sans `.eq("player_id", ...)` direct sur `program_sessions`
- La RLS "Program sessions: update via own program" protege — mais la defense en profondeur est absente

**P3 — `app/api/analyze-match/route.ts` utilise raw fetch au lieu du SDK Mistral**
- Ligne 68 : `fetch("https://api.mistral.ai/v1/chat/completions", ...)`
- Les autres routes utilisent `new Mistral()` du SDK — inconsistant
- Resultat de l'analyse NON persiste (jamais sauvegarde en DB) — re-generation a chaque appel

**P4 — next-intl installe mais non configure**
- `next-intl` v4 dans `package.json`, `messages/en.json` et `messages/fr.json` existent
- Aucun `NextIntlClientProvider` visible dans `app/layout.tsx`
- Soit desactive, soit config incomplete — a confirmer

---

## 5. AUDIT SUPABASE

### Tables et etat

| Table | RLS | Lecture client | Ecriture client | Utilisee en prod |
|-------|-----|---------------|-----------------|-----------------|
| `profiles` | Oui | PUBLIC | own (UPDATE+INSERT) | Oui |
| `equipment` | Oui | own | own | Oui |
| `sessions` | Oui | own (durci en 003) | own | Oui |
| `matches` | Oui | own (durci en 003) | own | Oui |
| `elo_ratings` | Oui | public | AUCUNE (dropped en 004) | Oui read-only |
| `elo_history` | Oui | own (added en 004) | AUCUNE | Oui read-only |
| `weekly_goals` | Oui | own | own | Oui |
| `follows` | Oui | public | own | Non (mock front) |
| `badges` | Oui | own (durci en 003) | via RPC seulement | Oui |
| `pro_players` | Oui | public | AUCUNE | Non (mock front) |
| `training_programs` | Oui | own/coach | own | Non (page mock) |
| `program_sessions` | Oui | via programme | via programme | Non (page mock) |
| `recaps` | Oui | own | own (via API route) | Oui |
| `analysis_chats` | Oui | own | own (via API route) | Oui si chat branche |

### Problemes RLS

**P1 — Migration 001 : `"ELO ratings: own write"` sans `FOR` specifiee**
```sql
CREATE POLICY "ELO ratings: own write" ON elo_ratings USING (auth.uid() = player_id);
```
Sans `FOR`, s'appliquait a ALL (SELECT, INSERT, UPDATE, DELETE). Corrige dans migration 004 par DROP POLICY. CORRIGE.

**P2 — `elo_ratings` n'a plus de policy INSERT/UPDATE apres migration 004**
Aucun utilisateur authentifie ne peut ecrire dans `elo_ratings`. C'est le comportement voulu — Ranking ecrit via service-role. OK.

**P3 — `follows` public read**
Toute personne non authentifiee peut voir qui suit qui. A evaluer selon besoin produit.

**P4 — `profiles` public read**
Donnees exposees : username, full_name, avatar_url, country, city, club, level, play_style, is_coach. Delibere mais a documenter.

### Fonction SECURITY DEFINER : `check_and_award_badges`

Migration 003 (version durcie) :
- `SET search_path = public` — pas de search_path injection
- Verification `auth.uid() IS NULL OR p_player_id IS DISTINCT FROM auth.uid()` — exception si different
- `REVOKE ALL ... FROM PUBLIC; GRANT EXECUTE TO authenticated`
- `ON CONFLICT DO NOTHING` — idempotent
- Securite correcte.

### Trigger `handle_new_user`

Migration 004 (version renforcee) :
- Collision de username geree avec boucle WHILE + suffix
- `SET search_path = public`
- `ON CONFLICT (id) DO UPDATE` — ne perd pas les donnees existantes
- Base solide pour partage Training/Ranking

### Index manquants notables

- Pas d'index sur `sessions.date` — full scans a volume
- Pas d'index sur `matches.date` — full scans a volume
- `elo_ratings(player_id, federation)` : UNIQUE index via contrainte — OK

---

## 6. AUDIT AUTH ET SECURITE

### CRITIQUE

**C1 — Bypass middleware dev**
Fichier : `lib/supabase/middleware.ts:6-8`
```typescript
if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_MODE === "true") {
  return NextResponse.next({ request })
}
```
- Si `NEXT_PUBLIC_DEV_MODE=true` tourne en staging ou si `NODE_ENV` n'est pas force, toutes les routes sont publiques
- `NEXT_PUBLIC_` = expose au browser, visible dans le bundle JS
- Supprimer avant tout deploiement

### HIGH

**H1 — Root `middleware.ts` potentiellement absent**
- `lib/supabase/middleware.ts` exporte `updateSession` mais Next.js requiert un fichier `middleware.ts` a la racine
- Aucun fichier `middleware.ts` root detecte dans le repo
- Si absent, aucune redirection middleware n'est active
- Protection de secours : chaque Server Component critique appelle `requireSharedProfile()` — mais insuffisant seul
- A confirmer et corriger en priorite absolue

**H2 — Routes IA sans rate limiting**
- `/api/ai/chat`, `/api/ai/bilan`, `/api/analyze-match` verifient l'auth Supabase — OK
- Mais aucun rate limiting — un utilisateur authentifie peut epuiser le quota Mistral en boucle

### MEDIUM

**M1 — `analysis_id` fantome dans les types**
- `lib/types/index.ts:Match.analysis_id` existe mais pas dans `types/database.ts` ni en DB
- Acces a `match.analysis_id` retourne toujours `undefined` — silencieux

**M2 — Erreurs Supabase non gerees cote client**
- `sessions/page.tsx`, `matches/page.tsx`, `stats/page.tsx`, `badges/page.tsx` : les appels `lib/api` lancent une exception en cas d'erreur Supabase mais la page n'a pas de try/catch ni d'etat erreur

**M3 — Messages d'erreur Supabase exposes en URL**
- `/login?error=message`, `/profile/edit?error=message`
- Messages parfois verbeux (ex: "duplicate key value violates unique constraint")

### LOW

**L1 — `NEXT_PUBLIC_SUPABASE_URL` visible**
Acceptable pour Supabase, la securite repose sur RLS + anon key.

**L2 — postcss XSS (npm audit)**
- `postcss <8.5.10` — moderate, XSS via CSS Stringify
- Le fix `--force` downgrade Next.js vers 9.3.3 — NE PAS APPLIQUER
- Surveiller la prochaine release Next.js

---

## 7. AUDIT DONNEES REELLES VS DEMO

### Donnees reellement persistees (Supabase)

| Fonctionnalite | Table | Statut |
|----------------|-------|--------|
| Profil utilisateur | `profiles` | REEL |
| Seances | `sessions` | REEL |
| Matchs | `matches` | REEL |
| Equipement | `equipment` | REEL |
| Objectifs hebdo | `weekly_goals` | REEL |
| Badges | `badges` | REEL (via RPC) |
| ELO | `elo_ratings` + `elo_history` | REEL (read-only) |
| Bilans IA | `recaps` | REEL |
| Chats IA | `analysis_chats` | REEL |
| Programmes | `training_programs` + `program_sessions` | EN DB mais non affiche |
| Pro players | `pro_players` | EN DB (8 joueurs seed) |

### Donnees simulees (mock)

| Fonctionnalite | Fichier source | Dangerosité |
|----------------|----------------|-------------|
| Programmes (front) | `lib/mock-data/index.ts:mockPrograms` | L'utilisateur voit des faux programmes |
| Exercices | `lib/mock-data/index.ts:mockExercises` | IDs hardcodes (ex-1, ex-2...) jamais en DB |
| Activite sociale | `mockFollowActivities` | Pas d'impact si desactive |
| Routines pros | `mockProRoutines` | Pas d'impact |
| Localisations | `mockLocations` | Pas d'impact |
| Bilans IA (front) | `mockAIReports` (si page non branchee) | Masque les vrais recaps Supabase |
| Chat (messages initiaux) | `mockChatMessages` | A verifier |
| Analyses de match | Generees a la volee, non persistees | Re-genere a chaque appel — cout tokens |
| `createSession` stub | `lib/api/index.ts:292` | Donnees silencieusement perdues |
| `createMatch` stub | `lib/api/index.ts:342` | Donnees silencieusement perdues |

### Fallbacks qui masquent des bugs

- `lib/api/index.ts:197` : `weekly_goal` hardcode `{ sessions_per_week: 3, hours_per_week: 5, matches_per_week: 1 }` si `weekly_goals` est vide
- `lib/data/shared-profile.ts:262` : `goal?.target_sessions || 3` — fallback silencieux
- Badges Supabase ont `description = ''` et `icon = '★'` — l'UX badges est degradee meme avec de vraies donnees

---

## 8. AUDIT ELO DANS TRAINING

### Statut : READ-ONLY confirme

**Lecture :**
- `getSharedEloRatings()` dans `lib/data/shared-profile.ts:163` — lit `elo_ratings` et `elo_history`
- `getEloRatings()` dans `lib/api/index.ts:379` — lit `elo_ratings` et `elo_history`
- Aucun dashboard ne lit l'ELO pour le modifier

**Ecriture :**
- Migration 004 a supprime `"ELO ratings: own write"` et `"ELO history: own only"` — OK
- Aucun code applicatif dans Training n'insere ou met a jour `elo_ratings` ou `elo_history` — OK
- `createPersonalMatch` ne touche pas l'ELO — OK

**Risque residuel :**
- `lib/elo/calculator.ts` existe avec `calculateEloChange()` et `estimateRankPercentile()`
- Non importe nulle part dans le code applicatif actuel — OK
- Mais sa presence est trompeuse et invite a l'utiliser — A supprimer ou deplacer

**Contrat `elo_ratings.player_id = profiles.id = auth.users.id` :**
- `elo_ratings.player_id` REFERENCES `profiles(id)` en DB — OK
- `profiles.id` = `auth.users.id` via trigger `handle_new_user` — OK
- Contrat respecte cote schema

---

## 9. FRONTIERE AVEC L'APP RANKING

### Tables partagees (via meme projet Supabase)

| Table | Proprietaire | Training peut | Ranking peut |
|-------|-------------|--------------|--------------|
| `profiles` | **Partage** | INSERT/UPDATE (own) | INSERT/UPDATE (service-role) |
| `elo_ratings` | **Ranking** | SELECT (public) | INSERT/UPDATE (service-role) |
| `elo_history` | **Ranking** | SELECT (own) | INSERT (service-role) |
| `pro_players` | **Ranking** | SELECT (public) | INSERT/UPDATE/DELETE (service-role) |

### Tables privees Training (a ne pas partager)

`sessions`, `matches`, `equipment`, `weekly_goals`, `badges`, `training_programs`, `program_sessions`, `recaps`, `analysis_chats`, `follows`

### Ce qu'il faudra verifier cote Ranking

1. Que `elo_ratings.player_id = profiles.id` est bien le meme UUID partout
2. Que Ranking utilise le service-role pour ecrire dans `elo_ratings` (bypass RLS)
3. Que Ranking ne cree pas ses propres profils avec une logique differente du trigger `handle_new_user`
4. Que les valeurs `federation` dans `elo_ratings` correspondent entre les deux apps

**INCOHERENCE DETECTEE — Federations :**
- `types/database.ts` Training a : `FFTT | RFETM | DTTB | ETTU | ITTF | custom`
- `lib/types/index.ts` Training a : `FFTT | WTT | TTR | PGR | ITTF`
- Ces deux listes ne correspondent pas — a unifier avant connexion Ranking

### Contrat d'integration propose

```
Training --- SELECT ---> elo_ratings (player_id = auth.uid())
Training --- SELECT ---> elo_history (player_id = auth.uid())
Training --- SELECT ---> pro_players (public)
Training --- SELECT ---> profiles (public)
Ranking  --- service-role WRITE ---> elo_ratings
Ranking  --- service-role WRITE ---> elo_history
Ranking  --- service-role WRITE ---> pro_players
```

`profiles` est le point de jonction unique. L'identite est `auth.users.id`. Training et Ranking partagent ce projet Supabase, jamais leurs tables metier respectives.

---

## 10. AUDIT TESTS ET DEPLOIEMENT

### Scripts disponibles
```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "eslint"
```

### Resultats lint
- **0 erreurs**
- **9 warnings** : 8x `@typescript-eslint/no-unused-vars`, 1x `import/no-anonymous-default-export`
- Fichiers concernes : 5 pages.tsx + postcss.config.mjs

### Resultats npm audit
- 2 vulnerabilites **moderate** : `postcss <8.5.10` (XSS CSS Stringify)
- Fix uniquement via downgrade Next.js 9.3.3 — NE PAS APPLIQUER
- Surveiller la prochaine release Next.js

### Tests
- **0 tests** — pas de jest, vitest, playwright, cypress
- Pas de `/tests`, `__tests__`, `.spec.ts`, `.test.ts`

### Tests minimum prioritaires

| Test | Priorite |
|------|----------|
| RLS : utilisateur A ne peut pas lire sessions de utilisateur B | CRITIQUE |
| RLS : utilisateur A ne peut pas ecrire dans elo_ratings | CRITIQUE |
| createTrainingSession persiste bien en DB | HIGH |
| createPersonalMatch persiste bien en DB | HIGH |
| Onboarding complet cree profil + equipement + weekly_goal | HIGH |
| Auth : route /dashboard redirige si non authentifie | HIGH |
| check_and_award_badges ne peut etre appele que pour soi-meme | HIGH |
| Badges : pas de duplicates (unique index) | MEDIUM |
| Filtre periode stats retourne les bonnes donnees | MEDIUM |

---

## 11. DETTE TECHNIQUE

### Dette front
- `lib/api/index.ts` : fichier hybride (Supabase + mock + stubs) a splitter
- `lib/mock-data/index.ts` (840 lignes) doit etre conditionne a l'environnement, jamais en prod
- Pas de pattern unifie : certaines pages sont Server Components (dashboard, elo, profile, profile/edit), d'autres sont Client Components fetching au mount (sessions, matches, stats, badges)
- `lib/types/index.ts` et `types/database.ts` : doublons et incoherences (Federation, PlayStyle, MatchType)
- `lib/types/index.ts:PlayingStyle` inclut `'all-round'`, `'blocker'`, `'offensive-defender'` non supportes par le schema DB
- `lib/types/index.ts:MatchType` inclut `'ranking'` non supporte par le schema DB

### Dette backend
- `createSession` et `createMatch` stubs dans `lib/api/index.ts` — trompeurs
- `getAggregatedStats` ignore le parametre `period` (`void _period`)
- `streak_days` dans `getAggregatedStats()` hardcode a 0
- `matches_per_week` jamais lu depuis la DB (hardcode a 1 partout)
- Programmes : server actions existent mais pas utilisees
- `analyze-match` API : fetch raw au lieu du SDK Mistral + resultat non persiste
- Pas de rate limiting sur les routes Mistral

### Dette Supabase
- Pas d'index sur `sessions.date`, `matches.date` — performances degradees a volume
- Seed : 8 pro players mais pas de routine — routine toujours mock cote front
- `elo_history.match_id` references `matches(id)` mais Training ne cree pas d'entrees elo_history — colonne orpheline cote Training

### Dette securite
- Bypass dev dans middleware (`lib/supabase/middleware.ts:6`)
- Root `middleware.ts` possiblement absent
- `lib/elo/calculator.ts` code mort trompeur
- Pas de rate limiting API routes IA

### Dette produit
- Onboarding ne redirige pas si `onboarding_completed = true`
- Settings ne persiste rien (coach_mode, notifications)
- Filtre periode stats non fonctionnel (`void _period`)
- Bouton "Nouveau programme" sans action
- `/matches/[id]/analysis` probablement non finalise
- `analysis_id` dans les types front sans correspondance DB
- `matches_per_week` jamais sauvegarde en objectifs

### Dette DX
- 0 tests
- Types Supabase ecrits manuellement (risque de derive) — utiliser `supabase gen types typescript`
- next-intl installe mais non configure ou non utilise
- `lib/seeds/proPlayers.ts` et `lib/seeds/demoData.ts` a verifier (probablement des scripts de seed non utilises)

---

## 12. ROADMAP RECOMMANDEE

### Phase 1 — Stabilisation production (avant tout deploiement)

| Action | Fichier | Effort |
|--------|---------|--------|
| Verifier et creer root `middleware.ts` | `middleware.ts` (root) | XS |
| Supprimer bypass `NEXT_PUBLIC_DEV_MODE` | `lib/supabase/middleware.ts:6-8` | XS |
| Supprimer stubs `createSession` / `createMatch` dans lib/api | `lib/api/index.ts:292,342` | XS |
| Supprimer ou deplacer `lib/elo/calculator.ts` | `lib/elo/calculator.ts` | XS |
| Ajouter index `sessions(player_id, date)` et `matches(player_id, date)` | migration 005 | XS |
| Supprimer import mock-data dans pages de production | pages concernees | S |
| Corriger onboarding : redirect si `onboarding_completed` | `app/onboarding/page.tsx` | S |
| Corriger types (Federation, PlayStyle, MatchType) entre lib/types et types/database | `lib/types/index.ts` | S |

### Phase 2 — Persistance complete Training

| Action | Fichier | Effort |
|--------|---------|--------|
| Brancher programmes sur `lib/actions/programs.ts` | `app/(app)/programs/page.tsx` | M |
| Implementer filtre periode dans `getAggregatedStats` | `lib/api/index.ts:542` | S |
| Persister `analyze-match` dans `analysis_chats` | `app/api/analyze-match/route.ts` | S |
| Persister settings (coach_mode, notifications) | `app/(app)/settings/page.tsx` | M |
| Rich metadata badges cote front | `lib/api/index.ts:440+` | M |
| Implementer streak reel dans `getAggregatedStats` | `lib/api/index.ts` | S |
| Persister matches_per_week dans weekly_goals | onboarding + goals | S |
| Finir `/matches/[id]/analysis` | `app/(app)/matches/[id]/analysis/page.tsx` | L |

### Phase 3 — Qualite produit

| Action | Fichier | Effort |
|--------|---------|--------|
| Tests RLS (utilisateur A vs B) | `tests/rls.test.ts` | M |
| Tests creation seance/match bout en bout | `tests/training.test.ts` | M |
| Error states sur pages client | pages sessions, matches, stats, badges | M |
| Ajouter rate limiting routes IA | `app/api/ai/*` | S |
| Configurer next-intl ou le desinstaller | `next-intl` | S |
| Generer types Supabase (`supabase gen types typescript`) | `types/database.ts` | M |

### Phase 4 — Preparation integration Ranking

| Action | Effort |
|--------|--------|
| Unifier les valeurs `Federation` entre Training et Ranking | M |
| Documenter contrat de lecture ELO (schema, player_id) | S |
| Verifier que Ranking ecrit bien via service-role | Ranking team |
| Ajouter tests de non-ecriture ELO cote Training | S |
| Documenter les tables privees vs partagees | S |

### Phase 5 — Connexion avec Ranking (apres audit Ranking)

| Action | Effort |
|--------|--------|
| Verifier `profiles.id = auth.users.id = elo_ratings.player_id` cote Ranking | Validation Ranking |
| Tester cross-app : creer user Training → ELO visible apres ecriture Ranking | Test e2e |
| Exposer une API legere Training → Ranking si besoin | Selon besoin produit |

---

## 13. TABLEAU FINAL DES PRIORITES

| Priorite | Sujet | Impact | Effort | Fichier(s) | Recommandation |
|----------|-------|--------|--------|------------|----------------|
| P0 CRITIQUE | Root `middleware.ts` absent | Toutes routes potentiellement publiques | XS | `middleware.ts` (root) | Creer immediatement |
| P0 CRITIQUE | Bypass dev middleware | Contournement total auth en staging | XS | `lib/supabase/middleware.ts:6` | Supprimer avant deploiement |
| P1 HIGH | Stubs `createSession`/`createMatch` | Donnees silencieusement perdues | XS | `lib/api/index.ts:292,342` | Transformer en throw Error |
| P1 HIGH | Programmes 100% mock | Feature affichee fausse | M | `app/(app)/programs/page.tsx` | Brancher sur `getAllPrograms` |
| P2 HIGH | `lib/elo/calculator.ts` | Risque futur d'ecriture ELO Training | XS | `lib/elo/calculator.ts` | Supprimer ou deplacer |
| P2 MEDIUM | Filtre periode stats ignore | Feature cassee | S | `lib/api/index.ts:543` | Implementer le filtre date |
| P2 MEDIUM | Settings non persistes | Coach mode reset a chaque visite | M | `app/(app)/settings/page.tsx` | Sauvegarder en DB |
| P2 MEDIUM | Onboarding sans garde `onboarding_completed` | Risque d'ecrasement donnees | S | `app/onboarding/page.tsx` | Redirect si deja complete |
| P2 MEDIUM | Types incoherents (Federation, PlayStyle) | Bugs silencieux en DB | S | `lib/types/index.ts` | Aligner sur `types/database.ts` |
| P3 LOW | Pas d'index sur `sessions.date`, `matches.date` | Degradation perf a volume | XS | migration 005 | Ajouter index |
| P3 LOW | `analysis_id` fantome dans types | Confusion developpeur | XS | `lib/types/index.ts:Match` | Supprimer ou ajouter en DB |
| P3 LOW | Badges sans description ni icone | UX degradee | M | `lib/api/index.ts:440` | Map badge_type → label/icon |
| P3 LOW | Rate limiting routes Mistral | Risque cout | S | `app/api/ai/*` | Ajouter rate limiting |
| P3 LOW | `analyze-match` non persiste | Re-consomme tokens | S | `app/api/analyze-match/route.ts` | Persister dans `analysis_chats` |
| P3 LOW | 0 tests | Risque regressions | L | `tests/` | Commencer par RLS tests |
| P4 INTEGRATION | Federation values divergentes Training/Ranking | Bloquant pour integration | M | `lib/types/index.ts`, migration | Unifier avant connexion |
| P4 INTEGRATION | Types generes manuellement | Derive schema/types | M | `types/database.ts` | `supabase gen types typescript` |

---

*Audit produit uniquement par lecture statique du code. Tests d'integration, verification runtime de la presence effective du root middleware.ts, et comportement en production restent a confirmer manuellement.*
