export function isRegistrationFull(tournamentInfo) {
  if (!tournamentInfo) return false;
  const maxTeams = tournamentInfo.max_teams ?? 21;
  return (tournamentInfo.current_teams || 0) >= maxTeams;
}

export function teamsRemaining(tournamentInfo) {
  if (!tournamentInfo) return null;
  const maxTeams = tournamentInfo.max_teams ?? 21;
  return Math.max(0, maxTeams - (tournamentInfo.current_teams || 0));
}
