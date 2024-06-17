function evaluateSchedule(lectures) {
    let conflicts = 0;
    const tutorMap = new Map();
    const groupMap = new Map();
    const roomMap = new Map();

    for(const lecture of lectures) {
        const room = lecture.roomId;
        const start = lecture.start;
        const end = lecture.end;
        const day = lecture.day;

        if (!roomMap.has(lecture)) roomMap.set(room, []);
        conflicts += checkConflicts(roomMap.get(room), start, end, day);
        roomMap.get(room).push({ start: start, end: end, day: day });

        lecture.tutor_ids.forEach(tutor => {
            if (!tutorMap.has(tutor)) tutorMap.set(tutor, []);
            conflicts += checkConflicts(tutorMap.get(tutor), start, end, day);
            tutorMap.get(tutor).push({ start: start, end: end, day: day });
        });

        lecture.group_ids.forEach(group => {
            if (!groupMap.has(group)) groupMap.set(group, []);
            conflicts += checkConflicts(groupMap.get(group), start, end, day);
            groupMap.get(group).push({ start: start, end: end, day: day });
        });
    }
    
    const { totalIdle: groupIdle, maxIdle: groupMax } = evaluateIdleTime(groupMap);
    const { totalIdle: tutorIdle, maxIdle: tutorMax } = evaluateIdleTime(tutorMap);

    totalIdle = groupIdle + tutorIdle;

    return { totalIdle, groupMax, tutorMax, conflicts };
}


function checkConflicts(existingTimes, start, end, day) {
    let conflictCount = 0;
    existingTimes.forEach(({ start: existingStart, end: existingEnd, day: existingDay }) => {
        if (day === existingDay && (start < existingEnd && end > existingStart)) {
            conflictCount++;
        }
    });
    return conflictCount;
}


function evaluateIdleTime(map) {
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

    map.forEach(times => {
        const dayMap = new Map();
        times.forEach(time => {
            if (!dayMap.has(time.day)) {
                dayMap.set(time.day, []);
            }
            dayMap.get(time.day).push({ start: time.start, end: time.end });
        });

        dayMap.forEach(dayTimes => {
            maxIdle = Math.max(maxIdle, calculateIdle(dayTimes));
        });
    });

    return { totalIdle, maxIdle };
}

module.exports = {
    evaluateSchedule
}
