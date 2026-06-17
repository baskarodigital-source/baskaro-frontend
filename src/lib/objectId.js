/** True for a 24-char hex MongoDB ObjectId string. */
export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}
