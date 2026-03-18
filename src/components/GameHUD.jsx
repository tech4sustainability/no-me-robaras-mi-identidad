export default function GameHUD({
  level,
  levelName,
  points,
  energyPercent,
  debugMode,
}) {
  return (
    <div className="hud">
      <div className="hud-left">
        <strong>Nivel {level}</strong>
        <span>{levelName}</span>
        {debugMode && <span className="debug-pill">Depuración</span>}
      </div>
      <div className="hud-center">
        <div className="score-block">
          <span>Puntos de seguridad</span>
          <strong>{points}</strong>
        </div>
        <div className="score-block">
          <span>Energía del hacker</span>
          <strong>{Math.round(energyPercent)}%</strong>
        </div>
      </div>
      <div className="hud-right">
      </div>
    </div>
  );
}
