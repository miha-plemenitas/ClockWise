const { getWeekNumber } = require("./preparer");

function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


function getDatesInRange(startDate, endDate){
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dateArray.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
};


async function generateTimeSlots(lectures) {
  //get dates tofilter out
  const dates = lectures.map(lecture => getDateFromTimestamp(lecture.startTime._seconds));

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const allDates = getDatesInRange(minDate, maxDate);
  console.log(minDate);
  console.log(maxDate);

  const result = allDates.map(date => {
    const hasLecture = dates.some(lectureDate => lectureDate.getTime() === date.getTime());
    const week = getWeekNumber(date);

    let startTime = 7;
    if (date.getDay() === 3){
      startTime = 10;
    }

    let hours = new Array();
    for(let index = startTime; index < 22; index++){
      hours.push(index);
    }

    return {
      date: date,
      week: week,
      hasLecture: hasLecture,
      hours: hours
    };
  });
  
  return result;
}


function groupLectures(lectures) {
  const dataType = new Map();

  for (const lecture of lectures) {
    let data = `C${lecture.courseId} E${lecture.executionTypeId} S${lecture.size} T${lecture.tutor_ids.join(",")} G${lecture.group_ids.join(",")}`;

    let lectureInfo = dataType.get(data);
    if (!lectureInfo) {
      lectureInfo = [];
      dataType.set(data, lectureInfo);
    }

    const lastLecture = lectureInfo[lectureInfo.length - 1];
    const duration = lastLecture ? lastLecture.duration + lecture.duration : lecture.duration;

    lectureInfo.push({ id: lecture.id, weekNo: lecture.week, duration: duration });
  }

  const json = Object.fromEntries(dataType);
  return json;
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
          rooms: [room],
          room_ids: [room.id],
          roomId: room.roomId,
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
  groupLectures
}
