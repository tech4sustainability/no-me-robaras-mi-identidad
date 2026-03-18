import { useState } from 'react';

export default function GameStats({ stats, onRestart, tips }) {
  const [showTips, setShowTips] = useState(false);
  return (
    <div className="stats-card">
      <div className="stats-content">
        <ul className="stats-list">
          <li>Contraseñas cambiadas: {stats.passwordsChanged}</li>
          <li>Mensajes eliminados: {stats.messagesDeleted}</li>
          <li>Cuentas hackeadas: {stats.accountsHacked}</li>
          <li>Total de puntos ganados: {stats.totalPointsEarned}</li>
        </ul>
        {tips && tips.length > 0 && (
          <div className="tips-end">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowTips((prev) => !prev)}
            >
              {showTips ? 'Ocultar consejos' : 'Ver consejos'}
            </button>
            {showTips && (
              <ul className="tips-list">
                {tips.map((tip) => (
                  <li key={tip} className="tips-item unlocked">
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="stats-actions">
        <button type="button" className="btn" onClick={onRestart}>
          Reiniciar juego
        </button>
      </div>
    </div>
  );
}
