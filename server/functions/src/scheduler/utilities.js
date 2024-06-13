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


function initializeSchedule(lectures, timeSlots) {
  let scheduledLectures = [];
  for (const lecture of lectures) {
    const roundedDuration = Math.ceil(lecture.duration);
    let validSlotSequences = findValidSlotSequences(timeSlots, roundedDuration, scheduledLectures, lecture);

    let retryCount = 0;
    while (validSlotSequences.length === 0 && retryCount < 5) {  // Allow some retries
      console.log(`Retrying to find a valid time slot for lecture with duration ${lecture.duration} hours.`);
      validSlotSequences = findValidSlotSequences(timeSlots, roundedDuration, scheduledLectures, lecture);
      retryCount++;
    }

    if (validSlotSequences.length === 0) {
      console.error(`No valid time slots found for lecture after retries. Aborting schedule.`);
      return null;
    }

    const chosenSequence = validSlotSequences[Math.floor(Math.random() * validSlotSequences.length)];
    scheduledLectures.push({
      lecture: lecture,
      timeSlot: {
        day: chosenSequence[0].day,
        start: chosenSequence[0].start,
        end: chosenSequence[chosenSequence.length - 1].end
      },
      room: lecture.rooms[Math.floor(Math.random() * lecture.rooms.length)]
    });
  }
  return scheduledLectures.filter(item => item !== null);
}


function findValidSlotSequences(timeSlots, duration, scheduledLectures, currentLecture) {
  let validSequences = [];
  slotLoop:
  for (let i = 0; i < timeSlots.length; i++) {
    let validSequence = [timeSlots[i]];
    let currentSlot = timeSlots[i];

    for (let j = 1; j < duration; j++) {
      if (i + j < timeSlots.length && timeSlots[i + j].day === currentSlot.day &&
          timeSlots[i + j].start === currentSlot.end) {
        validSequence.push(timeSlots[i + j]);
        currentSlot = timeSlots[i + j];
      } else {
        continue slotLoop;
      }
    }

    if (validSequence.length === duration && !hasConflicts(validSequence, scheduledLectures, currentLecture)) {
      validSequences.push(validSequence);
    }
  }
  return validSequences;
}


function hasConflicts(sequence, scheduledLectures, currentLecture) {
  for (const slot of sequence) {
    for (const scheduled of scheduledLectures) {
      if (slot.day === scheduled.timeSlot.day &&
          ((slot.start >= scheduled.timeSlot.start && slot.start < scheduled.timeSlot.end) ||
           (slot.end > scheduled.timeSlot.start && slot.end <= scheduled.timeSlot.end))) {
        if (scheduled.lecture.room === currentLecture.room ||
            scheduled.lecture.tutor === currentLecture.tutor ||
            scheduled.lecture.group === currentLecture.group) {
          return true;
        }
      }
    }
  }
  return false;
}


module.exports = {
  generateTimeSlots,
  initializeSchedule,
  findValidSlotSequences,
}