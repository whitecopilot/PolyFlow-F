/**
 * 将数字格式化为带 K/M/B 后缀的简写形式
 * - < 1000: 直接显示，保留 decimals 位小数（默认 2）
 * - >= 1000: 使用 K/M/B 后缀，保留 decimals 位小数
 */
export function formatCompactNumber(value: number, decimals = 2): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000_000) {
    return sign + (abs / 1_000_000_000).toFixed(decimals) + 'B'
  }
  if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(decimals) + 'M'
  }
  if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(decimals) + 'K'
  }
  return value.toFixed(decimals)
}
