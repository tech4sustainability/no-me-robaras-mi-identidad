import { useMemo, useState, useEffect, useCallback } from 'react';
import './App.css';
import Desktop from './components/Desktop';
import HackerCursor from './components/HackerCursor';
import MessageWindow from './components/MessageWindow';
import SecurityTipsPanel from './components/SecurityTipsPanel';
import GameHUD from './components/GameHUD';
import GameStats from './components/GameStats';
import Timer from './components/Timer';
import { APPS } from './data/apps';
import { MESSAGES } from './data/messages';
import { TIPS_LEVEL_1, TIPS_LEVEL_2 } from './data/tips';
import { FEEDBACK_MESSAGES } from './data/feedbackMessages';
import { LEVEL_INTROS } from './data/levelIntros';
import {
  LEVELS,
  TOOL_COSTS,
  TIP_COST,
  LOCK_TIME,
  PASSWORD_MANAGER_BONUS,
} from './game/gameConfig';
import { generatePassword, randomChoice } from './game/gameUtils';
import { getAsset, placeholderAsset } from './game/assets';
import useInterval from './hooks/useInterval';

const createInitialAppState = () =>
  APPS.reduce((acc, app) => {
    acc[app.id] = {
      status: 'safe',
      password: generatePassword(),
      passwordChanges: 0,
      attackTimer: null,
      lockTimer: null,
      message: null,
      messageTimer: null,
      notificationCount: 0,
      tools: { passwordManager: false, twoFactor: false },
      localFeedback: null,
      localFeedbackType: 'success',
    };
    return acc;
  }, {});

const initialStats = {
  messagesDeleted: 0,
  totalPointsEarned: 0,
  passwordsChanged: 0,
  accountsHacked: 0,
};

const feedbackMessages = FEEDBACK_MESSAGES;

export default function App() {
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(10);
  const [apps, setApps] = useState(createInitialAppState);
  const [openAppId, setOpenAppId] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [showPasswordFormFor, setShowPasswordFormFor] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState('success');
  const [unlockedTips, setUnlockedTips] = useState([]);
  const [iconPositions, setIconPositions] = useState({});
  const [hackerPos, setHackerPos] = useState(null);
  const [levelProgress, setLevelProgress] = useState({ level1: 0, level2: 0 });
  const [level1TipsCompleted, setLevel1TipsCompleted] = useState(false);
  const [level1ExtraPasswords, setLevel1ExtraPasswords] = useState(0);
  const [level2TipsCompleted, setLevel2TipsCompleted] = useState(false);
  const [level2ExtraMessages, setLevel2ExtraMessages] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [gameStatus, setGameStatus] = useState('playing');
  const [paused, setPaused] = useState(true);
  const [showLevelIntro, setShowLevelIntro] = useState(1);
  const [completedLevel, setCompletedLevel] = useState(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [nextLevelPending, setNextLevelPending] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugAppId, setDebugAppId] = useState(APPS[0]?.id || '');
  const [debugMessageType, setDebugMessageType] = useState('suspicious');

  const levelConfig = LEVELS[level];

  const backgroundUrl = getAsset('NT6I1', placeholderAsset);
  const cursorUrl = getAsset('NT6I12', placeholderAsset);

  const allTips = level === 1 ? TIPS_LEVEL_1 : [...TIPS_LEVEL_1, ...TIPS_LEVEL_2];
  const totalTools = APPS.length * 2;
  const activeTools = Object.values(apps).reduce((acc, app) => {
    const toolsOn = (app.tools.passwordManager ? 1 : 0) + (app.tools.twoFactor ? 1 : 0);
    return acc + toolsOn;
  }, 0);

  const maxEnergy = allTips.length;
  const energyPercent =
    level === 3
      ? totalTools
        ? Math.max(0, ((totalTools - activeTools) / totalTools) * 100)
        : 0
      : maxEnergy
        ? Math.max(0, ((maxEnergy - unlockedTips.length) / maxEnergy) * 100)
        : 0;

  const assetFor = (name) => getAsset(name, placeholderAsset);

  const fullyProtectedApps = useMemo(
    () =>
      Object.values(apps).filter(
        (app) => app.tools.passwordManager && app.tools.twoFactor
      ).length,
    [apps]
  );

  const checkDefeat = useCallback((nextApps) => {
    const compromised = Object.values(nextApps).filter(
      (app) => app.status === 'locked'
    ).length;
    if (compromised === APPS.length) {
      setGameStatus('defeat');
    }
  }, []);

  const applyPoints = useCallback((delta) => {
    if (delta > 0) {
      setStats((prev) => ({
        ...prev,
        totalPointsEarned: prev.totalPointsEarned + delta,
      }));
    }
    setPoints((prev) => Math.max(0, prev + delta));
  }, []);

  const pushFeedback = useCallback((message, type = 'success') => {
    setFeedback(message);
    setFeedbackType(type);
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const id = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(id);
  }, [feedback]);

  const startAttack = useCallback((appId) => {
    setApps((prev) => {
      const app = prev[appId];
      if (!app || app.status === 'locked') return prev;
      if (app.tools.passwordManager && app.tools.twoFactor) return prev;
      if (app.status === 'under_attack') return prev;
      const bonus = app.tools.passwordManager ? PASSWORD_MANAGER_BONUS.attackTimeBonus : 0;
      return {
        ...prev,
        [appId]: {
          ...app,
          status: 'under_attack',
          attackTimer: levelConfig.attackTime + bonus,
        },
      };
    });
  }, [levelConfig.attackTime]);

  const lockApp = useCallback(
    (appId, message) => {
    setApps((prev) => {
      const app = prev[appId];
      const next = {
        ...prev,
        [appId]: {
          ...app,
          status: 'locked',
          attackTimer: null,
          message: null,
          messageTimer: null,
          notificationCount: 0,
          lockTimer: LOCK_TIME,
        },
      };
      return next;
    });
    setStats((prev) => ({ ...prev, accountsHacked: prev.accountsHacked + 1 }));
    applyPoints(-levelConfig.pointsPenalty);
    pushFeedback(message, 'danger');
    },
    [applyPoints, levelConfig.pointsPenalty, pushFeedback]
  );

  const resolveAttackSuccess = useCallback((appId, newPassword) => {
    setApps((prev) => {
      const app = prev[appId];
      const nextApp = {
        ...app,
        status: app.tools.passwordManager && app.tools.twoFactor ? 'protected' : 'safe',
        attackTimer: null,
        password: newPassword || app.password,
        passwordChanges: app.passwordChanges + 1,
        localFeedback: feedbackMessages.passwordSuccess,
        localFeedbackType: 'success',
      };
      return { ...prev, [appId]: nextApp };
    });
    setTimeout(() => {
      setApps((prev) => {
        const app = prev[appId];
        if (!app) return prev;
        if (app.localFeedback !== feedbackMessages.passwordSuccess) return prev;
        return {
          ...prev,
          [appId]: { ...app, localFeedback: null },
        };
      });
    }, 2500);
    setStats((prev) => ({ ...prev, passwordsChanged: prev.passwordsChanged + 1 }));
    if (level === 1) {
      setLevel1ExtraPasswords((prev) => (level1TipsCompleted ? prev + 1 : prev));
    }
    applyPoints(levelConfig.pointsPerSuccess);
    pushFeedback(feedbackMessages.passwordSuccess, 'success');
    if (level === 1) {
      setLevelProgress((prev) => ({
        ...prev,
        level1: prev.level1 + 1,
      }));
    }
  }, [
    applyPoints,
    level,
    level1TipsCompleted,
    levelConfig.pointsPerSuccess,
    pushFeedback,
  ]);

  const resolveMessageSuccess = useCallback(() => {
    applyPoints(levelConfig.pointsPerSuccess);
    pushFeedback(feedbackMessages.messageSuccess, 'success');
    if (level === 2) {
      setLevelProgress((prev) => ({
        ...prev,
        level2: prev.level2 + 1,
      }));
      setLevel2ExtraMessages((prev) => (level2TipsCompleted ? prev + 1 : prev));
    }
  }, [applyPoints, level, level2TipsCompleted, levelConfig.pointsPerSuccess, pushFeedback]);

  const showLocalFeedback = useCallback((appId, message, type = 'success') => {
    setApps((prev) => {
      const app = prev[appId];
      if (!app) return prev;
      return {
        ...prev,
        [appId]: { ...app, localFeedback: message, localFeedbackType: type },
      };
    });
    setTimeout(() => {
      setApps((prev) => {
        const app = prev[appId];
        if (!app) return prev;
        if (app.localFeedback !== message) return prev;
        return {
          ...prev,
          [appId]: { ...app, localFeedback: null },
        };
      });
    }, 5000);
  }, []);

  const clearMessage = (appId) => {
    setApps((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        message: null,
        messageTimer: null,
        notificationCount: 0,
      },
    }));
  };

  const handlePasswordSubmit = (appId, values) => {
    const app = apps[appId];
    if (!app) return;
    const requiresOld = app.passwordChanges > 0;
    if (requiresOld && values.oldPassword !== app.password) {
      setPasswordError('La contraseña actual no coincide.');
      return;
    }
    if (!values.newPassword || values.newPassword.length < 6) {
      setPasswordError('La nueva contraseña es demasiado corta.');
      return;
    }
    setPasswordError('');
    resolveAttackSuccess(appId, values.newPassword);
    setShowPasswordFormFor(null);
    setPasswordForm({ oldPassword: '', newPassword: '' });
  };

  const handleAutoPassword = (appId) => {
    const newPassword = generatePassword();
    resolveAttackSuccess(appId, newPassword);
    setShowPasswordFormFor(null);
    setPasswordForm({ oldPassword: '', newPassword: '' });
  };

  const handleMessageAction = (appId, action) => {
    const app = apps[appId];
    if (!app?.message) return;
    const isSuspicious = app.message.type === 'suspicious';
    const correct = (isSuspicious && action === 'delete') || (!isSuspicious && action === 'trust');

    if (action === 'delete') {
      setStats((prev) => ({
        ...prev,
        messagesDeleted: prev.messagesDeleted + 1,
      }));
    }

    clearMessage(appId);

    if (correct) {
      resolveMessageSuccess();
      if (isSuspicious) {
        showLocalFeedback(appId, feedbackMessages.messageSuccess, 'success');
      }
    } else {
      lockApp(appId, feedbackMessages.messageFail);
      if (isSuspicious) {
        showLocalFeedback(appId, feedbackMessages.messageFail, 'danger');
      }
    }
  };

  const unlockTip = (tip) => {
    if (unlockedTips.includes(tip) || points < TIP_COST) return;
    setUnlockedTips((prev) => [...prev, tip]);
    applyPoints(-TIP_COST);
  };

  const activateTool = (appId, tool) => {
    setApps((prev) => {
      const app = prev[appId];
      if (!app) return prev;
      if (app.status === 'under_attack') return prev;
      if (app.tools[tool]) return prev;
      const cost = TOOL_COSTS[tool === 'passwordManager' ? 'passwordManager' : 'twoFactor'];
      if (points < cost) return prev;
      applyPoints(-cost);
      const nextTools = { ...app.tools, [tool]: true };
      const fullyProtected = nextTools.passwordManager && nextTools.twoFactor;
      pushFeedback(
        fullyProtected ? feedbackMessages.toolSecond : feedbackMessages.toolFirst,
        'success'
      );
      return {
        ...prev,
        [appId]: {
          ...app,
          tools: nextTools,
          status: fullyProtected ? 'protected' : app.status,
        },
      };
    });
  };

  const onIconLayout = (appId, rect) => {
    setIconPositions((prev) => {
      const current = prev[appId];
      if (current && current.left === rect.left && current.top === rect.top) return prev;
      return { ...prev, [appId]: rect };
    });
  };

  const tickTimers = useCallback(() => {
    if (gameStatus !== 'playing' || paused) return;

    // Main game tick: decrease timers and resolve timeouts.
    setApps((prev) => {
      const next = { ...prev };
      let updated = false;

      Object.entries(prev).forEach(([appId, app]) => {
        let updatedApp = app;

        if (app.attackTimer != null) {
          const nextTimer = app.attackTimer - 1;
          if (nextTimer <= 0) {
            updatedApp = { ...updatedApp, attackTimer: null };
            updated = true;
            setStats((statsPrev) => ({
              ...statsPrev,
              accountsHacked: statsPrev.accountsHacked + 1,
            }));
            applyPoints(-levelConfig.pointsPenalty);
            pushFeedback(feedbackMessages.passwordFail, 'danger');
            updatedApp = {
              ...updatedApp,
              status: 'locked',
              lockTimer: LOCK_TIME,
            };
          } else {
            updatedApp = { ...updatedApp, attackTimer: nextTimer };
          }
          updated = true;
        }

        if (app.lockTimer != null) {
          const nextLock = app.lockTimer - 1;
          if (nextLock <= 0) {
            updatedApp = {
              ...updatedApp,
              lockTimer: null,
              status: app.tools.passwordManager && app.tools.twoFactor ? 'protected' : 'safe',
            };
          } else {
            updatedApp = { ...updatedApp, lockTimer: nextLock };
          }
          updated = true;
        }

        if (app.messageTimer != null) {
          const nextTimer = app.messageTimer - 1;
          if (nextTimer <= 0) {
            updatedApp = {
              ...updatedApp,
              messageTimer: null,
              message: null,
              notificationCount: 0,
              status: 'locked',
              lockTimer: LOCK_TIME,
            };
            applyPoints(-levelConfig.pointsPenalty);
            pushFeedback(feedbackMessages.messageFail, 'danger');
            if (app.message?.type === 'suspicious') {
              showLocalFeedback(appId, feedbackMessages.messageFail, 'danger');
            }
            setStats((statsPrev) => ({
              ...statsPrev,
              accountsHacked: statsPrev.accountsHacked + 1,
            }));
          } else {
            updatedApp = { ...updatedApp, messageTimer: nextTimer };
          }
          updated = true;
        }

        next[appId] = updatedApp;
      });

      if (updated) {
        checkDefeat(next);
      }

      return next;
    });
  }, [
    applyPoints,
    checkDefeat,
    gameStatus,
    levelConfig.pointsPenalty,
    paused,
    pushFeedback,
    showLocalFeedback,
  ]);

  useInterval(() => {
    if (debugMode || paused) return;
    tickTimers();
  }, 1000);

  const spawnMessage = useCallback(() => {
    if (gameStatus !== 'playing' || paused) return;
    if (level !== 2) return;

    // Spawn random messages for level 2 to simulate incoming risks.
    const candidates = APPS.map((app) => app.id).filter((id) => {
      const state = apps[id];
      return state && !state.message && state.status !== 'locked';
    });

    if (candidates.length === 0) return;

    const appId = randomChoice(candidates);
    const appName = APPS.find((app) => app.id === appId)?.name;
    const possibleMessages = MESSAGES.filter((msg) => msg.app === appName);
    if (possibleMessages.length === 0) return;

    const newMessage = randomChoice(possibleMessages);
    setApps((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        message: newMessage,
        messageTimer: LEVELS[2].messageTimeout,
        notificationCount: (prev[appId].notificationCount || 0) + 1,
      },
    }));
  }, [apps, gameStatus, level, paused]);

  useInterval(() => {
    if (debugMode || paused) return;
    spawnMessage();
  }, level === 2 ? LEVELS[2].messageInterval : null);

  const moveHacker = useCallback(() => {
    if (gameStatus !== 'playing' || paused) return;

    // Hacker cursor movement and attack initiation.
    const targetIds = APPS.map((app) => app.id).filter((id) => {
      const state = apps[id];
      if (!state) return false;
      if (state.status === 'locked') return false;
      if (state.tools.passwordManager && state.tools.twoFactor) return false;
      return true;
    });

    if (targetIds.length === 0) return;

    const targetId = randomChoice(targetIds);
    const rect = iconPositions[targetId];
    if (rect) {
      setHackerPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        clicking: true,
      });
      setTimeout(() =>
        setHackerPos((prev) => (prev ? { ...prev, clicking: false } : prev)),
      250);
    }

    if (level === 1 || level === 3) {
      const hasActiveAttack = Object.values(apps).some(
        (app) => app.status === 'under_attack'
      );
      if (level === 1 && hasActiveAttack) return;
      startAttack(targetId);
    }
  }, [apps, gameStatus, iconPositions, level, paused, startAttack]);

  useInterval(() => {
    if (debugMode || paused) return;
    moveHacker();
  }, levelConfig.hackerMoveInterval);

  useEffect(() => {
    if (level !== 1) return;
    const allTipsRead = unlockedTips.length >= TIPS_LEVEL_1.length;
    if (allTipsRead && !level1TipsCompleted) {
      setLevel1TipsCompleted(true);
      setLevel1ExtraPasswords(0);
    }
    const enoughPasswords = level1ExtraPasswords >= 1;
    if (allTipsRead && enoughPasswords) {
      setCompletedLevel(1);
      setPaused(true);
      setShowLevelComplete(true);
      setNextLevelPending(2);
    }
  }, [level, level1ExtraPasswords, level1TipsCompleted, unlockedTips.length]);

  useEffect(() => {
    if (level !== 2) return;
    const allTipsRead = unlockedTips.length >= allTips.length;
    if (allTipsRead && !level2TipsCompleted) {
      setLevel2TipsCompleted(true);
      setLevel2ExtraMessages(0);
    }
    const enoughMessages = level2ExtraMessages >= 1;
    if (allTipsRead && enoughMessages) {
      setCompletedLevel(2);
      setPaused(true);
      setShowLevelComplete(true);
      setNextLevelPending(3);
    }
  }, [
    allTips.length,
    level,
    level2ExtraMessages,
    level2TipsCompleted,
    unlockedTips.length,
  ]);

  useEffect(() => {
    if (level === 3 && fullyProtectedApps === APPS.length) {
      setGameStatus('victory');
    }
  }, [level, fullyProtectedApps]);

  const activeApp = openAppId ? APPS.find((app) => app.id === openAppId) : null;
  const activeAppState = activeApp ? apps[activeApp.id] : null;

  const activeAttackApp = Object.entries(apps).find(
    ([, app]) => app.status === 'under_attack'
  );
  const activeMessages = Object.values(apps).filter((app) => app.message).length;

  const forceAttack = useCallback(
    (appId) => {
      if (!appId) return;
      startAttack(appId);
    },
    [startAttack]
  );

  const forceMessage = useCallback(
    (appId, type) => {
      const appName = APPS.find((app) => app.id === appId)?.name;
      if (!appName) return;
      const pool = MESSAGES.filter((msg) => msg.app === appName && msg.type === type);
      if (pool.length === 0) return;
      const newMessage = randomChoice(pool);
      setApps((prev) => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          message: newMessage,
          messageTimer: LEVELS[2].messageTimeout,
          notificationCount: (prev[appId].notificationCount || 0) + 1,
        },
      }));
    },
    []
  );

  const setAppStatus = useCallback((appId, status) => {
    setApps((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        status,
        lockTimer: status === 'locked' ? LOCK_TIME : null,
        attackTimer: status === 'under_attack' ? levelConfig.attackTime : null,
      },
    }));
  }, [levelConfig.attackTime]);

  const clearAppMessage = useCallback((appId) => {
    setApps((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        message: null,
        messageTimer: null,
        notificationCount: 0,
      },
    }));
  }, []);

  const clearAppAttack = useCallback((appId) => {
    setApps((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        status: prev[appId].status === 'under_attack' ? 'safe' : prev[appId].status,
        attackTimer: null,
      },
    }));
  }, []);

  const unlockNextTip = useCallback(() => {
    const nextTip = allTips.find((tip) => !unlockedTips.includes(tip));
    if (!nextTip) return;
    setUnlockedTips((prev) => [...prev, nextTip]);
  }, [allTips, unlockedTips]);

  const handleRestart = () => {
    setLevel(1);
    setPoints(10);
    setApps(createInitialAppState());
    setOpenAppId(null);
    setShowTips(false);
    setShowPasswordFormFor(null);
    setPasswordForm({ oldPassword: '', newPassword: '' });
    setUnlockedTips([]);
    setLevelProgress({ level1: 0, level2: 0 });
    setStats(initialStats);
    setGameStatus('playing');
    setPaused(true);
    setShowLevelIntro(1);
    setCompletedLevel(null);
    setShowLevelComplete(false);
    setNextLevelPending(null);
    setLevel1TipsCompleted(false);
    setLevel1ExtraPasswords(0);
    setLevel2TipsCompleted(false);
    setLevel2ExtraMessages(0);
  };

  const resetCurrentLevel = useCallback(() => {
    setApps(createInitialAppState());
    setOpenAppId(null);
    setShowTips(false);
    setShowPasswordFormFor(null);
    setPasswordForm({ oldPassword: '', newPassword: '' });
    setPasswordError('');
    setHackerPos(null);
    setGameStatus('playing');
    setPaused(true);
    setShowLevelIntro(level);
    setCompletedLevel(null);
    setShowLevelComplete(false);
    setNextLevelPending(null);
    setLevel1TipsCompleted(false);
    setLevel1ExtraPasswords(0);
    setLevel2TipsCompleted(false);
    setLevel2ExtraMessages(0);
  }, [level]);

  const jumpToLevel = useCallback(
    (targetLevel) => {
      const nextLevel = Math.min(3, Math.max(1, targetLevel));
      setLevel(nextLevel);
      setApps(createInitialAppState());
      setOpenAppId(null);
      setShowTips(false);
      setShowPasswordFormFor(null);
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setPasswordError('');
      setHackerPos(null);
      setLevelProgress({ level1: 0, level2: 0 });
      setGameStatus('playing');
      setPaused(true);
      setShowLevelIntro(nextLevel);
      setCompletedLevel(null);
      setShowLevelComplete(false);
      setNextLevelPending(null);
      setLevel1TipsCompleted(false);
      setLevel1ExtraPasswords(0);
      setLevel2TipsCompleted(false);
      setLevel2ExtraMessages(0);
    },
    []
  );

  useEffect(() => {
    const handleKey = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (!event.altKey) return;
      if (event.code === 'KeyD') {
        event.preventDefault();
        setDebugMode((prev) => {
          const next = !prev;
          setShowDebugPanel(next);
          return next;
        });
        return;
      }
      if (!debugMode) return;
      if (event.code === 'KeyR') {
        event.preventDefault();
        resetCurrentLevel();
      }
      if (event.code === 'KeyB') {
        event.preventDefault();
        jumpToLevel(level - 1);
      }
      if (event.code === 'KeyN') {
        event.preventDefault();
        jumpToLevel(level + 1);
      }
      if (event.code === 'KeyS') {
        event.preventDefault();
        if (paused) return;
        tickTimers();
        moveHacker();
        spawnMessage();
      }
      if (event.code === 'KeyP') {
        event.preventDefault();
        applyPoints(100);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    debugMode,
    jumpToLevel,
    level,
    paused,
    resetCurrentLevel,
    tickTimers,
    moveHacker,
    spawnMessage,
  ]);

  return (
    <div className="app">
      <GameHUD
        level={level}
        levelName={levelConfig.name}
        points={points}
        energyPercent={energyPercent}
        debugMode={debugMode}
      />
      <div className="game-area">
        {debugMode && (
          <div className="debug-overlay">
            <div>Nivel: {level}</div>
            <div>Estado: {gameStatus} {paused ? '(pausa)' : ''}</div>
            <div>Puntos: {points}</div>
            <div>Energía: {Math.round(energyPercent)}%</div>
            <div>Consejos: {unlockedTips.length}/{allTips.length}</div>
            <div>Mensajes activos: {activeMessages}</div>
            <div>
              App bajo ataque:{' '}
              {activeAttackApp ? `${activeAttackApp[0]} (${activeAttackApp[1].attackTimer}s)` : 'ninguna'}
            </div>
            <div>Contraseñas cambiadas: {stats.passwordsChanged}</div>
            <div>Mensajes correctos: {levelProgress.level2}</div>
            <div>Mensajes eliminados: {stats.messagesDeleted}</div>
            <div>Total de puntos ganados: {stats.totalPointsEarned}</div>
            <div>Cuentas hackeadas: {stats.accountsHacked}</div>
            <div>Debug panel: {showDebugPanel ? 'abierto' : 'cerrado'}</div>
          </div>
        )}

        {debugMode && showDebugPanel && (
          <div className="debug-panel">
            <div className="debug-section">
              <div className="debug-title">Actuar sobre app</div>
              <div className="debug-row">
                <label>
                  App
                  <select
                    value={debugAppId}
                    onChange={(e) => setDebugAppId(e.target.value)}
                  >
                    {APPS.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="debug-help">
                Selecciona una app y luego usa las acciones debajo.
              </div>
              <div className="debug-subsection">
                <div className="debug-subtitle">Estado</div>
                <div className="debug-row">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setAppStatus(debugAppId, 'locked')}
                  >
                    Bloquear app
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setAppStatus(debugAppId, 'safe')}
                  >
                    Desbloquear app
                  </button>
                </div>
              </div>
              <div className="debug-subsection">
                <div className="debug-subtitle">Mensajes</div>
                <div className="debug-row">
                  <label>
                    Tipo
                    <select
                      value={debugMessageType}
                      onChange={(e) => setDebugMessageType(e.target.value)}
                    >
                      <option value="suspicious">Sospechoso</option>
                      <option value="safe">Seguro</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => forceMessage(debugAppId, debugMessageType)}
                  >
                    Forzar mensaje
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => clearAppMessage(debugAppId)}
                  >
                    Eliminar mensaje
                  </button>
                </div>
              </div>
              <div className="debug-subsection">
                <div className="debug-subtitle">Ataque</div>
                <div className="debug-row">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => forceAttack(debugAppId)}
                  >
                    Forzar ataque
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => clearAppAttack(debugAppId)}
                  >
                    Quitar ataque
                  </button>
                </div>
              </div>
            </div>

            <div className="debug-section">
              <div className="debug-title">Navegación</div>
              <div className="debug-row">
                <button type="button" className="btn ghost" onClick={() => jumpToLevel(1)}>
                  Ir a nivel 1
                </button>
                <button type="button" className="btn ghost" onClick={() => jumpToLevel(2)}>
                  Ir a nivel 2
                </button>
                <button type="button" className="btn ghost" onClick={() => jumpToLevel(3)}>
                  Ir a nivel 3
                </button>
              </div>
            </div>

            <div className="debug-section">
              <div className="debug-title">Puntos</div>
              <div className="debug-row">
                <button type="button" className="btn ghost" onClick={() => applyPoints(10)}>
                  +10 puntos
                </button>
                <button type="button" className="btn ghost" onClick={() => applyPoints(100)}>
                  +100 puntos
                </button>
                <button type="button" className="btn ghost" onClick={() => applyPoints(-10)}>
                  -10 puntos
                </button>
                <button type="button" className="btn ghost" onClick={() => applyPoints(-100)}>
                  -100 puntos
                </button>
              </div>
            </div>

            <div className="debug-section">
              <div className="debug-title">Consejos</div>
              <div className="debug-row">
                <button type="button" className="btn ghost" onClick={unlockNextTip}>
                  Desbloquear consejo
                </button>
              </div>
            </div>

            <div className="debug-section">
              <div className="debug-title">Control</div>
              <div className="debug-row">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    if (paused) return;
                    tickTimers();
                    moveHacker();
                    spawnMessage();
                  }}
                >
                  Avanzar paso
                </button>
                <button type="button" className="btn ghost" onClick={resetCurrentLevel}>
                  Reiniciar nivel
                </button>
              </div>
            </div>
          </div>
        )}

        <Desktop
          apps={APPS}
          appStates={apps}
          assetFor={assetFor}
          onOpenApp={(appId) => {
            setOpenAppId(appId);
            setShowPasswordFormFor(null);
            setPasswordForm({ oldPassword: '', newPassword: '' });
            setPasswordError('');
          }}
          onLayout={onIconLayout}
          activeAppId={openAppId}
          backgroundUrl={backgroundUrl}
          onOpenTips={() => {
            setShowTips(true);
            setPaused(true);
          }}
        />

        {activeApp && level === 2 && activeAppState.message ? (
          <div className="app-window">
            <MessageWindow
              app={activeApp}
              message={activeAppState.message}
              timer={activeAppState.messageTimer}
              onClose={() => setOpenAppId(null)}
              onTrust={() => handleMessageAction(activeApp.id, 'trust')}
              onDelete={() => handleMessageAction(activeApp.id, 'delete')}
              localFeedback={activeAppState.localFeedback}
              localFeedbackType={activeAppState.localFeedbackType}
            />
          </div>
        ) : null}

        {activeApp && !(level === 2 && activeAppState.message) && (
          <div className="window app-window">
            <div className="window-header">
              <strong>{activeApp.name}</strong>
              <button
                type="button"
                className="window-close"
                onClick={() => {
                  setOpenAppId(null);
                  setShowPasswordFormFor(null);
                  setPasswordForm({ oldPassword: '', newPassword: '' });
                  setPasswordError('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="window-body">
              {level === 1 || level === 3 ? (
                <div className="window-section">
                  {activeAppState.status === 'under_attack' ? (
                    <>
                      <p className="window-intro">
                        Protege esta cuenta antes de que el hacker termine.
                      </p>
                      {activeAppState.tools.passwordManager && level === 3 ? (
                        <div className="window-hint">
                          <p>El gestor te permite cambiar en un clic.</p>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              setPasswordError('');
                              handleAutoPassword(activeApp.id);
                            }}
                          >
                            Cambiar contraseña
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            setPasswordError('');
                            setShowPasswordFormFor(activeApp.id);
                          }}
                        >
                          Cambiar contraseña
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="window-intro">
                      Esta cuenta está tranquila. Espera un ataque para actuar.
                    </p>
                  )}
                  {showPasswordFormFor === activeApp.id && (
                    <div className="password-form">
                      {activeAppState.passwordChanges > 0 && (
                        <label className="form-field">
                          Contraseña actual
                          <input
                            type="password"
                            value={passwordForm.oldPassword}
                            onChange={(event) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                oldPassword: event.target.value,
                              }))
                            }
                          />
                        </label>
                      )}
                      <label className="form-field">
                        Nueva contraseña
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: event.target.value,
                            }))
                          }
                        />
                      </label>
                      {passwordError && <p className="form-error">{passwordError}</p>}
                      <div className="window-actions">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handlePasswordSubmit(activeApp.id, passwordForm)}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            setShowPasswordFormFor(null);
                            setPasswordForm({ oldPassword: '', newPassword: '' });
                            setPasswordError('');
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  {activeAppState.localFeedback && (
                    <div className={`inline-feedback ${activeAppState.localFeedbackType}`}>
                      {activeAppState.localFeedback}
                    </div>
                  )}
                </div>
              ) : null}

              {level === 2 && !activeAppState.message && (
                <div className="window-section">
                  <p className="window-intro">Sin mensajes pendientes.</p>
                  {activeAppState.localFeedback && (
                    <div className={`inline-feedback ${activeAppState.localFeedbackType}`}>
                      {activeAppState.localFeedback}
                    </div>
                  )}
                </div>
              )}

              {level === 3 && (
                <div className="window-section">
                  {activeAppState.tools.passwordManager &&
                    activeAppState.tools.twoFactor && (
                      <div className="protected-banner">
                        <img src={assetFor('NT6I17')} alt="Protegido" />
                        <span>Esta cuenta ya está totalmente protegida.</span>
                      </div>
                    )}
                  <div className="tools-grid">
                    <div
                      className={`tool-card ${
                        activeAppState.tools.passwordManager ? 'active' : ''
                      }`}
                    >
                      <img src={assetFor('NT6I15')} alt="Gestor de contraseñas" />
                      <h4>Gestor de contraseñas</h4>
                      <p>Crea y recuerda contraseñas fuertes.</p>
                      <button
                        type="button"
                        className="btn"
                        disabled={
                          activeAppState.tools.passwordManager ||
                          activeAppState.status === 'under_attack' ||
                          points < TOOL_COSTS.passwordManager
                        }
                        onClick={() => activateTool(activeApp.id, 'passwordManager')}
                      >
                        {activeAppState.tools.passwordManager
                          ? 'Activado'
                          : `Activar (${TOOL_COSTS.passwordManager})`}
                      </button>
                    </div>
                    <div
                      className={`tool-card ${
                        activeAppState.tools.twoFactor ? 'active' : ''
                      }`}
                    >
                      <img src={assetFor('NT6I16')} alt="Autenticación 2FA" />
                      <h4>Autenticación 2FA</h4>
                      <p>Añade un código extra para verificar accesos.</p>
                      <button
                        type="button"
                        className="btn"
                        disabled={
                          activeAppState.tools.twoFactor ||
                          activeAppState.status === 'under_attack' ||
                          points < TOOL_COSTS.twoFactor
                        }
                        onClick={() => activateTool(activeApp.id, 'twoFactor')}
                      >
                        {activeAppState.tools.twoFactor
                          ? 'Activado'
                          : `Activar (${TOOL_COSTS.twoFactor})`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showTips && (
          <div className="floating-panel">
            <SecurityTipsPanel
              tips={allTips}
              unlockedTips={unlockedTips}
              onUnlock={unlockTip}
              onClose={() => {
                setShowTips(false);
                if (showLevelIntro == null) {
                  setPaused(false);
                }
              }}
              points={points}
              cost={TIP_COST}
            />
          </div>
        )}


        <HackerCursor position={hackerPos} cursorUrl={cursorUrl} />
      </div>

      {gameStatus !== 'playing' && (
        <div className="end-screen">
          <div className="end-card">
            <h2>
              {gameStatus === 'victory'
                ? '¡Gran trabajo! Todas las cuentas están protegidas.'
                : '¡Oh! Parece que el hacker se ha hecho con el control.'}
            </h2>
            <GameStats stats={stats} onRestart={handleRestart} tips={allTips} />
          </div>
        </div>
      )}

      {paused && gameStatus === 'playing' && showLevelComplete && completedLevel && (
        <div className="end-screen">
          <div className="end-card level-intro">
            <h2>¡Muy bien! Has superado el nivel.</h2>
            <p>Prepárate para el siguiente reto.</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (!nextLevelPending) return;
                setLevel(nextLevelPending);
                setShowLevelComplete(false);
                setShowLevelIntro(nextLevelPending);
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {paused && gameStatus === 'playing' && showLevelIntro != null && !showLevelComplete && (
        <div className="end-screen">
          <div className="end-card level-intro">
            <h2>{LEVEL_INTROS[showLevelIntro].title}</h2>
            <ul className="intro-list">
              {LEVEL_INTROS[showLevelIntro].lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setPaused(false);
                setShowLevelIntro(null);
                setCompletedLevel(null);
                setNextLevelPending(null);
              }}
            >
              {LEVEL_INTROS[showLevelIntro].action}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
