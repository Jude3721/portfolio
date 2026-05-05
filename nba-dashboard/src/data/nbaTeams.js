const LOGO = (tri) =>
  `https://cdn.nba.com/logos/nba/${TRI_TO_ID[tri]}/global/L/logo.svg`

const TRI_TO_ID = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
}

export const NBA_TEAMS = {
  ATL: { name: 'Atlanta Hawks',           short: 'Hawks',   color: '#C8102E', logo: LOGO('ATL') },
  BOS: { name: 'Boston Celtics',          short: 'Celtics', color: '#007A33', logo: LOGO('BOS') },
  BKN: { name: 'Brooklyn Nets',           short: 'Nets',    color: '#000000', logo: LOGO('BKN') },
  CHA: { name: 'Charlotte Hornets',       short: 'Hornets', color: '#1D1160', logo: LOGO('CHA') },
  CHI: { name: 'Chicago Bulls',           short: 'Bulls',   color: '#CE1141', logo: LOGO('CHI') },
  CLE: { name: 'Cleveland Cavaliers',     short: 'Cavs',    color: '#860038', logo: LOGO('CLE') },
  DAL: { name: 'Dallas Mavericks',        short: 'Mavs',    color: '#00538C', logo: LOGO('DAL') },
  DEN: { name: 'Denver Nuggets',          short: 'Nuggets', color: '#0E2240', logo: LOGO('DEN') },
  DET: { name: 'Detroit Pistons',         short: 'Pistons', color: '#C8102E', logo: LOGO('DET') },
  GSW: { name: 'Golden State Warriors',   short: 'Warriors',color: '#1D428A', logo: LOGO('GSW') },
  HOU: { name: 'Houston Rockets',         short: 'Rockets', color: '#CE1141', logo: LOGO('HOU') },
  IND: { name: 'Indiana Pacers',          short: 'Pacers',  color: '#002D62', logo: LOGO('IND') },
  LAC: { name: 'LA Clippers',             short: 'Clippers',color: '#C8102E', logo: LOGO('LAC') },
  LAL: { name: 'Los Angeles Lakers',      short: 'Lakers',  color: '#552583', logo: LOGO('LAL') },
  MEM: { name: 'Memphis Grizzlies',       short: 'Grizz',   color: '#5D76A9', logo: LOGO('MEM') },
  MIA: { name: 'Miami Heat',              short: 'Heat',    color: '#98002E', logo: LOGO('MIA') },
  MIL: { name: 'Milwaukee Bucks',         short: 'Bucks',   color: '#00471B', logo: LOGO('MIL') },
  MIN: { name: 'Minnesota Timberwolves',  short: 'Wolves',  color: '#0C2340', logo: LOGO('MIN') },
  NOP: { name: 'New Orleans Pelicans',    short: 'Pels',    color: '#0C2340', logo: LOGO('NOP') },
  NYK: { name: 'New York Knicks',         short: 'Knicks',  color: '#006BB6', logo: LOGO('NYK') },
  OKC: { name: 'Oklahoma City Thunder',   short: 'Thunder', color: '#007AC1', logo: LOGO('OKC') },
  ORL: { name: 'Orlando Magic',           short: 'Magic',   color: '#0077C0', logo: LOGO('ORL') },
  PHI: { name: 'Philadelphia 76ers',      short: 'Sixers',  color: '#006BB6', logo: LOGO('PHI') },
  PHX: { name: 'Phoenix Suns',            short: 'Suns',    color: '#1D1160', logo: LOGO('PHX') },
  POR: { name: 'Portland Trail Blazers',  short: 'Blazers', color: '#E03A3E', logo: LOGO('POR') },
  SAC: { name: 'Sacramento Kings',        short: 'Kings',   color: '#5A2D81', logo: LOGO('SAC') },
  SAS: { name: 'San Antonio Spurs',       short: 'Spurs',   color: '#C4CED4', logo: LOGO('SAS') },
  TOR: { name: 'Toronto Raptors',         short: 'Raptors', color: '#CE1141', logo: LOGO('TOR') },
  UTA: { name: 'Utah Jazz',               short: 'Jazz',    color: '#002B5C', logo: LOGO('UTA') },
  WAS: { name: 'Washington Wizards',      short: 'Wizards', color: '#002B5C', logo: LOGO('WAS') },
}

export const EAST_TEAMS = ['BOS','NYK','MIL','CLE','ORL','IND','MIA','PHI','CHA','ATL','BKN','CHI','WAS','DET','TOR']
export const WEST_TEAMS = ['OKC','MIN','DEN','LAC','DAL','PHX','NOP','LAL','SAC','GSW','HOU','SAS','MEM','UTA','POR']
