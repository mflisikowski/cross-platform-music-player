export const componentToHex = (c: number) => {
  if (!c) return;
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/**
 * Gets a css variable value and returns it as hex color string.
 * @param variableName - The name of the css variable to get (eg: "--color-primary").
 * @returns A string representing the color in hex format (eg: "#ff0000").
 */
export const getThemeColorHex = (variableName: string): string => {
  const [r, g, b] = getThemeColorRgb(variableName);
  return rgbToHex(r, g, b);
};

/**
 * Gets a css variable value and returns it as an array of RGB values.
 * @param variableName The name of the css variable to get (eg: "--color-primary").
 * @returns An array containing the RGB values [r, g, b].
 */
export const getThemeColorRgb = (variableName: string): [number, number, number] => {
  const [rString,gString,bString] = getComputedStyle(document.documentElement).getPropertyValue(variableName).split(", ");
  const r = typeof rString == "string" ? parseFloat(rString) : rString;
  const g = typeof gString == "string" ? parseFloat(gString) : gString;
  const b = typeof bString == "string" ? parseFloat(bString) : bString;
  return [r, g, b];
};