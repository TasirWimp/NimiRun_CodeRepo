export const DESKTOP_WORKSHOP_LAYOUT = Object.freeze({
  isMobile: false,
  header: {
    titleX: 32,
    titleY: 22,
    titleSize: '30px',
    supportX: 34,
    supportY: 62,
    supportSize: '15px',
    environmentX: 704,
    environmentY: 28,
    environmentWidth: 280,
    statusX: 34,
    statusY: 80,
    statusWidth: 620,
  },
  map: { x: 32, y: 112, width: 650, height: 430, innerWidth: 640, innerHeight: 420 },
  hud: { x: 704, y: 112, width: 288, height: 430 },
  details: { x: 32, y: 558, width: 470, height: 170 },
  proposal: { x: 520, y: 558, width: 472, height: 170 },
});

export function createWorkshopLayout(width, height) {
  if (width > 600 || height <= width) {
    return DESKTOP_WORKSHOP_LAYOUT;
  }

  const margin = 12;
  const panelWidth = Math.max(320, width - margin * 2);
  const headerHeight = 88;
  const mapHeight = Math.round(panelWidth * (420 / 640)) + 10;
  const proposalHeight = 176;
  const detailsHeight = 142;
  const hudHeight = Math.max(138, height - headerHeight - mapHeight - proposalHeight - detailsHeight - margin * 5);

  const mapY = headerHeight + margin;
  const proposalY = mapY + mapHeight + margin;
  const detailsY = proposalY + proposalHeight + margin;
  const hudY = detailsY + detailsHeight + margin;

  return {
    isMobile: true,
    header: {
      titleX: margin,
      titleY: 16,
      titleSize: '21px',
      supportX: margin,
      supportY: 43,
      supportSize: '11px',
      environmentX: width - margin - 150,
      environmentY: 18,
      environmentWidth: 150,
      statusX: margin,
      statusY: 64,
      statusWidth: panelWidth,
    },
    map: {
      x: margin,
      y: mapY,
      width: panelWidth,
      height: mapHeight,
      innerWidth: panelWidth - 10,
      innerHeight: mapHeight - 10,
    },
    proposal: { x: margin, y: proposalY, width: panelWidth, height: proposalHeight },
    details: { x: margin, y: detailsY, width: panelWidth, height: detailsHeight },
    hud: { x: margin, y: hudY, width: panelWidth, height: hudHeight },
  };
}
