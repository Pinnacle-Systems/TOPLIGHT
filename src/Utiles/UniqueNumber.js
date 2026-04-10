export function generateUniqueId_Number() {
  const timestamp = Date.now(); // 13-digit millisecond timestamp
  const random = Math.floor(Math.random() * 90 + 10); // 2-digit random number
  return Number(`${timestamp}${random}`); // total: 15 digits
}

