/** Türkçe büyük harf: i → İ, ı → I (JS'in toUpperCase'i "DAKIKA" yazar). */
export function trBuyuk(s: string) {
  return s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}
