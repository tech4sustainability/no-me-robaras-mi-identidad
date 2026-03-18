export const LEVELS = {
  1: {
    name: 'Cambiar contraseñas',
    attackTime: 30,
    hackerMoveInterval: 5200,
    successTarget: 6,
    pointsPerSuccess: 3,
    pointsPenalty: 2,
  },
  2: {
    name: 'Detectar riesgos',
    attackTime: 30,
    hackerMoveInterval: 4600,
    messageInterval: 7500,
    messageTimeout: 18,
    successTarget: 7,
    pointsPerSuccess: 7,
    pointsPenalty: 6,
  },
  3: {
    name: 'Herramientas de seguridad',
    attackTime: 30,
    hackerMoveInterval: 6000,
    pointsPerSuccess: 5,
    pointsPenalty: 6,
  },
};

export const TOOL_COSTS = {
  passwordManager: 12,
  twoFactor: 16,
};

export const TIP_COST = 5;

export const LOCK_TIME = 10;

export const PASSWORD_MANAGER_BONUS = {
  attackTimeBonus: 6,
};

export const PASSWORD_LENGTH = 8;
