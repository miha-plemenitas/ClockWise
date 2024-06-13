function evaluateSchedule(schedule) {
  let conflicts = 0;
  const tutorMap = new Map();
  const groupMap = new Map();
  const roomMap = new Map();

  schedule.forEach(({ lecture, timeSlot, room }) => {
      if (!roomMap.has(room)) roomMap.set(room, []);
      conflicts += checkConflicts(roomMap.get(room), timeSlot.start, timeSlot.end);
      roomMap.get(room).push({ start: timeSlot.start, end: timeSlot.end });

      lecture.tutors.forEach(tutor => {
          if (!tutorMap.has(tutor)) tutorMap.set(tutor, []);
          conflicts += checkConflicts(tutorMap.get(tutor), timeSlot.start, timeSlot.end);
          tutorMap.get(tutor).push({ start: timeSlot.start, end: timeSlot.end });
      });

      lecture.groups.forEach(group => {
          if (!groupMap.has(group)) groupMap.set(group, []);
          conflicts += checkConflicts(groupMap.get(group), timeSlot.start, timeSlot.end);
          groupMap.get(group).push({ start: timeSlot.start, end: timeSlot.end });
      });
  });

  let { idleTime, maxIdle } = evaluateIdleTime(tutorMap, groupMap);
  let totalCost = conflicts + idleTime;

  return { totalCost, maxIdle, conflicts };
}


function checkConflicts(existingTimes, start, end) {
  let conflictCount = 0;
  existingTimes.forEach(({ start: existingStart, end: existingEnd }) => {
      if ((start < existingEnd && end > existingStart)) {
          conflictCount++;
      }
  });
  return conflictCount;
}


function evaluateIdleTime(tutorMap, groupMap) {
  let totalIdle = 0;
  let maxIdle = 0;

  const calculateIdle = (times) => {
      times.sort((a, b) => a.start - b.start);
      let localMaxIdle = 0;
      for (let i = 0; i < times.length - 1; i++) {
          const idlePeriod = times[i + 1].start - times[i].end;
          totalIdle += idlePeriod;
          if (idlePeriod > localMaxIdle) {
              localMaxIdle = idlePeriod;
          }
      }
      return localMaxIdle;
  };

  tutorMap.forEach(times => {
      maxIdle = Math.max(maxIdle, calculateIdle(times));
  });
  groupMap.forEach(times => {
      maxIdle = Math.max(maxIdle, calculateIdle(times));
  });

  return { idleTime: totalIdle, maxIdle };
}


function calculateIdleTimeForEntity(times) {
  times.sort((a, b) => a.start - b.start);

  let totalIdle = 0;
  let maxEntityIdle = 0;
  for (let i = 0; i < times.length - 1; i++) {
      const currentEnd = times[i].end;
      const nextStart = times[i + 1].start;
      if (nextStart > currentEnd) {
          const idleGap = nextStart - currentEnd;
          totalIdle += idleGap;
          maxEntityIdle = Math.max(maxEntityIdle, idleGap);
      }
  }

  return { totalIdle, maxEntityIdle };
}


module.exports = {
  evaluateSchedule
}