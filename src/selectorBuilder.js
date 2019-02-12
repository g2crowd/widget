export default function ({ attr, data }) {
  const result = [];

  if (attr) {
    result.push(`[${attr}]`);
  }

  if (data) {
    result.push(`[data-${data}]`);
  }

  return result.join(',');
}
