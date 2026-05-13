#!/bin/bash
# Script de démarrage du serveur local Supabase + Next.js
# Prérequis : Docker Desktop doit être lancé
set -e

SUPABASE=~/bin/supabase
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Démarrage de Supabase local..."
cd "$PROJECT_DIR"
$SUPABASE start

echo ""
echo "▶ Récupération des credentials locaux..."
$SUPABASE status

echo ""
echo "▶ Application des migrations..."
$SUPABASE db reset

echo ""
echo "✓ Supabase local prêt !"
echo "  Studio    → http://127.0.0.1:54323  (interface graphique DB)"
echo "  API       → http://127.0.0.1:54321"
echo "  DB        → postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "▶ Démarrage de Next.js..."
npm run dev
