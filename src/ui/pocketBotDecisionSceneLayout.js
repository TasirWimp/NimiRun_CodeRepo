function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createRect(x, y, width, height) {
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function createPocketBotDecisionSceneLayout(width, height) {
  const margin = width <= 520 ? 12 : 18;
  const contentWidth = clamp(width - margin * 2, 320, 430);
  const contentX = Math.round((width - contentWidth) / 2);
  const resourceBarHeight = 54;
  const proposalHeight = height < 800 ? 72 : 82;
  const narratorHeight = height < 800 ? 50 : 58;
  const actionTrayHeight = height < 800 ? 126 : 144;
  const fixedHeight =
    margin +
    resourceBarHeight +
    margin +
    proposalHeight +
    8 +
    narratorHeight +
    margin +
    actionTrayHeight +
    margin;
  const arenaHeight = clamp(
    height - fixedHeight,
    260,
    Math.round(contentWidth * 1.08)
  );
  const resourceBar = createRect(contentX, margin, contentWidth, resourceBarHeight);
  const arenaCard = createRect(
    contentX,
    resourceBar.y + resourceBar.height + margin,
    contentWidth,
    arenaHeight
  );
  const botProposal = createRect(
    contentX,
    arenaCard.y + arenaCard.height + margin,
    contentWidth,
    proposalHeight
  );
  const narratorStrip = createRect(
    contentX,
    botProposal.y + botProposal.height + 8,
    contentWidth,
    narratorHeight
  );
  const actionTray = createRect(
    contentX,
    narratorStrip.y + narratorStrip.height + margin,
    contentWidth,
    actionTrayHeight
  );
  const traceDrawerHeight = clamp(Math.round(height * 0.42), 292, 360);

  return {
    isPhoneFirst: true,
    content: createRect(contentX, margin, contentWidth, height - margin * 2),
    resourceBar,
    arenaCard,
    botProposal,
    narratorStrip,
    actionTray,
    traceDrawer: createRect(
      contentX,
      height - traceDrawerHeight - margin,
      contentWidth,
      traceDrawerHeight
    ),
  };
}

export function layoutDecisionActionButtons(actionTray, actions = []) {
  const gap = 10;
  const buttonWidth = Math.floor((actionTray.width - gap) / 2);
  const buttonHeight = Math.floor((actionTray.height - gap) / 2);

  return actions.map((action, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);

    return {
      ...action,
      x: actionTray.x + column * (buttonWidth + gap),
      y: actionTray.y + row * (buttonHeight + gap),
      width: buttonWidth,
      height: buttonHeight,
    };
  });
}
