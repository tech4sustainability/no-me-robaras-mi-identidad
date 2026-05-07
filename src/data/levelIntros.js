export const INITIAL_INTRO = {
  title: 'Alerta de seguridad',
  paragraphs: [
    'Un hacker intenta acceder a tus cuentas personales.',
    'Tu misión es:',
  ],
  bullets: [
    'Proteger contraseñas.',
    'Detectar riesgos.',
    'Usar herramientas de seguridad.',
  ],
  closing: [
    'Consigue puntos de seguridad durante la partida para desbloquear consejos y ayudas.',
    '¿Podrás detenerlo?',
  ],
  action: 'Empezar misión',
};

export const LEVEL_INTROS = {
  1: {
    title: 'Nivel 1: Protege tus contraseñas',
    paragraphs: [
      'El cursor rojo representa al hacker.',
      'Cuando señale una aplicación, intentará acceder a esa cuenta.',
      'Haz clic rápido sobre ella y mejora la contraseña antes de que termine el tiempo.',
      'Cada cambio de contraseña te da puntos de seguridad.',
      'Usa esos puntos para desbloquear consejos que te ayudarán a proteger mejor tus cuentas.',
    ],
    action: 'Comenzar nivel',
  },
  2: {
    title: 'Nivel 2: Detectar riesgos',
    paragraphs: [
      'Han aparecido mensajes sospechosos que podrían poner en peligro tus cuentas.',
      'Haz clic en los mensajes sospechosos para identificarlos y eliminarlos.',
      'Cada acierto te da puntos de seguridad.',
      'Sigue desbloqueando consejos para continuar avanzando.',
    ],
    action: 'Comenzar nivel',
  },
  3: {
    title: 'Nivel 3: Herramientas de seguridad',
    paragraphs: [
      'Ahora puedes utilizar herramientas de protección para defender mejor tus cuentas.',
      'Usa los puntos de seguridad conseguidos para activar las dos herramientas disponibles en cada aplicación.',
      'Cuando una aplicación tenga activadas sus dos herramientas, dejará de ser atacada.',
      'Elige bien en qué momento proteger cada cuenta.',
    ],
    action: 'Comenzar nivel',
  },
};
