export const getOffersRowAmount = () => {
  const width = window.innerWidth;
  if (width < 1210) return 2;
  if (width < 1582) return 3;
  if (width < 1953) return 4;
  if (width < 2326) return 5;
  return 5;
}