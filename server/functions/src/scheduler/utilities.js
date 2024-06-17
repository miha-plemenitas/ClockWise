function generateTimeSlots() {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [];
  const regularStartTime = 7;
  const regularEndTime = 21;

  for (let day of daysOfWeek) {
      let dayStartTime = regularStartTime;

      if (day === "Wednesday") {
          dayStartTime = 10;
      }

      for (let hour = dayStartTime; hour < regularEndTime; hour++) {
          timeSlots.push({
              day: day,
              start: hour,
              end: hour + 1
          });
      }
  }
  return timeSlots;
}


function initializeSchedule(lectures, timeSlots, rooms) {
  lectures.sort((a, b) => b.duration - a.duration);
  rooms.sort((a, b) => a.size - b.size);

  const schedule = [];

  for (const lecture of lectures) {
    const validTerm = findValidTerm(lecture, timeSlots, rooms, schedule);

    if (validTerm) {
      schedule.push(validTerm);
    } else {
      console.error(`Could not schedule lecture: ${lecture.course}`);
    }
  }

  return schedule;
}


function findValidTerm(lecture, timeSlots, rooms, schedule) {
  for (const room of rooms) {
    if (lecture.size > room.size) continue;

    for (const timeslot of timeSlots) {
      const lectureEnd = timeslot.start + lecture.duration;

      if (lectureEnd > 21) continue;

      if (!hasConflicts(lecture, room, timeslot, lectureEnd, schedule)) {
        return {
          ...lecture,
          roomId: room.roomId,
          roomName: room.roomName,
          day: timeslot.day,
          start: timeslot.start,
          end: lectureEnd,
        };
      }
    }
  }

  return null;
}


function hasConflicts(lecture, room, timeslot, lectureEnd, schedule) {
  return (
    schedule.some(
      (scheduledLecture) =>
        scheduledLecture.roomId === room.roomId &&
        scheduledLecture.day === timeslot.day &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= timeslot.start) ||
          (scheduledLecture.end > timeslot.start && scheduledLecture.end <= lectureEnd) ||
          (timeslot.start >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    schedule.some(
      (scheduledLecture) =>
        scheduledLecture.tutor_ids.some(tutorId => lecture.tutor_ids.includes(tutorId)) &&
        scheduledLecture.day === timeslot.day &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= timeslot.start) ||
          (scheduledLecture.end > timeslot.start && scheduledLecture.end <= lectureEnd) ||
          (timeslot.start >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    schedule.some(
      (scheduledLecture) =>
        scheduledLecture.group_ids.some(groupId => lecture.group_ids.includes(groupId)) &&
        scheduledLecture.day === timeslot.day &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= timeslot.start) ||
          (scheduledLecture.end > timeslot.start && scheduledLecture.end <= lectureEnd) ||
          (timeslot.start >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    )
  );
}


module.exports = {
  generateTimeSlots,
  initializeSchedule,
}