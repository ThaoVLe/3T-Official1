
import { format } from "date-fns";

export const formatTimeAgo = (createdAt: string | Date) => {
  const now = new Date();
  const entryDate = new Date(createdAt);
  const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays > 30) {
    return format(entryDate, "MMM dd, yyyy");
  } else if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    const diffInHours = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInMinutes = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
  }
};
