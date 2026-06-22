export function layoutGuidanceButtons(buttons = [], {
  x = 0,
  y = 0,
  maxWidth = Number.POSITIVE_INFINITY,
  gap = 8,
  rowGap = 24,
} = {}) {
  let offsetX = 0;
  let rowY = y;

  return buttons.map((button) => {
    const width = button.width || 72;

    if (offsetX > 0 && offsetX + width > maxWidth) {
      offsetX = 0;
      rowY += rowGap;
    }

    const positioned = {
      ...button,
      x: x + offsetX,
      y: rowY,
      width,
    };

    offsetX += width + gap;

    return positioned;
  });
}

export function createGuidanceButton(scene, {
  x,
  y,
  width = 72,
  height = 22,
  label,
  fill = 0x14202b,
  stroke = 0xf2b33d,
  textColor = '#f3e4c2',
  onClick,
}) {
  const container = scene.add.container(x, y);
  const background = scene.add
    .rectangle(0, 0, width, height, fill, 0.94)
    .setOrigin(0)
    .setStrokeStyle(1, stroke, 0.9);
  const text = scene.add
    .text(width / 2, height / 2, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: textColor,
      fontStyle: '700',
    })
    .setOrigin(0.5);

  container.add([background, text]);
  background.setInteractive({ useHandCursor: true });
  background.on('pointerover', () => background.setFillStyle(stroke, 0.2));
  background.on('pointerout', () => background.setFillStyle(fill, 0.94));
  background.on('pointerdown', () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  });

  return container;
}
