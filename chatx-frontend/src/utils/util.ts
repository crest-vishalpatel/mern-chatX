export function getTime(date: string): string {
  const temp = date ? new Date(date) : new Date();
  const hours = temp.getHours();
  const minutes = temp.getMinutes();
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  return formattedTime;
}
