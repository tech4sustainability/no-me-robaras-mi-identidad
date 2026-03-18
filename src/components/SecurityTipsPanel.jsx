export default function SecurityTipsPanel({ tips, unlockedTips, onUnlock, onClose, points, cost }) {
  return (
    <div className="window">
      <div className="window-header">
        <strong>Consejos de seguridad</strong>
        <button type="button" className="window-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="window-body">
        <p className="window-hint">Desbloquea consejos con tus puntos.</p>
        <ul className="tips-list">
          {tips.map((tip) => {
            const unlocked = unlockedTips.includes(tip);
            return (
              <li key={tip} className={`tips-item ${unlocked ? 'unlocked' : ''}`}>
                <span>{unlocked ? tip : 'Consejo bloqueado'}</span>
                {!unlocked && (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => onUnlock(tip)}
                    disabled={points < cost}
                  >
                    Desbloquear ({cost})
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
