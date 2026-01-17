export default function getGreeting(date: Date) {
  const hour = date.getHours()
  if (hour <= 11) {
    return "Good Morning,"
  }
  if (hour <= 13) {
    return "Good Day,"
  }
  if (hour <= 17) {
    return "Good Afternoon,"
  }
  if (hour <= 21) {
    return "Good Evening,"
  }
  return "Good Night,"
}