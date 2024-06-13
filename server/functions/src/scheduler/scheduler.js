const { db } = require('../utils/firebaseAdmin');
const { generateTimeSlots, initializeSchedule, findValidSlotSequences } = require("./utilities");
const { evaluateSchedule } = require("./evaluator");
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");


async function deleteCollectionAndGetTwoWeekSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const generatedScheduleRef = facultyRef.collection("generated_lectures");

  await deleteAllDocumentsInCollection(generatedScheduleRef);

  const lectures = await getWeekTwoSchedule(facultyRef);
  return lectures;
}


async function getWeekTwoSchedule(facultyRef) {
  const lectureRef = facultyRef.collection("original_lectures");

  const startTime = new Date("2024-03-04");
  const endTime = new Date("2024-03-09");

  startTime.setHours(0, 0, 0, 0);
  endTime.setHours(0, 0, 0, 0)

  const lectureQuery = lectureRef.where("startTime", ">=", startTime)
    .where("startTime", "<=", endTime)
    .where("hasRooms", "==", true)
    .where("executionTypeId", "!=", "99");

  const snapshot = await lectureQuery.get();
  const lectures = snapshot.docs.map(doc => {
    const data = doc.data();
    delete data.id;
    delete data.startTime;
    delete data.endTime;
    delete data.r;
    delete data.hasRooms;

    return data;
  });

  return lectures;
}


function mutateSchedule(schedule, timeSlots) {
  const newSchedule = [...schedule];
  const index = Math.floor(Math.random() * newSchedule.length);
  const lecture = newSchedule[index];

  const validSequences = findValidSlotSequences(timeSlots, Math.ceil(lecture.lecture.duration));
  if (validSequences.length === 0) {
    console.error("No valid sequences found for lecture, skipping mutation for this lecture.");
    return newSchedule; 
  }

  const chosenSequence = validSequences[Math.floor(Math.random() * validSequences.length)];

  if (Math.random() > 0.5) {
    lecture.timeSlot = {
      day: chosenSequence[0].day,
      start: chosenSequence[0].start,
      end: chosenSequence[chosenSequence.length - 1].end
    };
  } else {
    lecture.room_ids = lecture.lecture.room_ids[Math.floor(Math.random() * lecture.lecture.room_ids.length)];
  }

  return newSchedule;
}



function evolutionaryStrategy(schedule, timeSlots) {
  const candidate = mutateSchedule(schedule, timeSlots);
  if (evaluateSchedule(candidate) <= evaluateSchedule(schedule)) {
    return candidate;
  }
  return schedule;
}


function simulatedAnnealing(schedule, maxSteps, initialTemp, coolingRate, timeSlots) {
  let currentSchedule = schedule;
  let currentEnergy = evaluateSchedule(currentSchedule);
  let temperature = initialTemp;

  for (let i = 0; i < maxSteps; i++) {
    const newSchedule = mutateSchedule(currentSchedule, timeSlots);
    const newEnergy = evaluateSchedule(newSchedule);
    const energyDifference = newEnergy - currentEnergy;

    if (energyDifference < 0 || Math.exp(-energyDifference / temperature) > Math.random()) {
      currentSchedule = newSchedule;
      currentEnergy = newEnergy;
    }

    temperature *= coolingRate;
  }

  return currentSchedule;
}


async function generateSchedule() {
  const lectures = await deleteCollectionAndGetTwoWeekSchedule("13");
  const timeSlots = generateTimeSlots();

  let schedule = initializeSchedule(lectures, timeSlots);

  let bestSchedule = schedule;
  let { totalCost: bestScore, maxIdle: bestIdle } = evaluateSchedule(schedule);

  console.log(`Initial Schedule Score: ${bestScore}`);

  for (let i = 0; i < 1000; i++) {
    let candidate = evolutionaryStrategy(schedule, timeSlots);
    let { totalCost: candidateScore, maxIdle: candidateMaxIdle } = evaluateSchedule(candidate);

    if (candidateScore < bestScore) {
        bestSchedule = candidate;
        bestScore = candidateScore;
        bestIdle = candidateMaxIdle
    }

    if ((i + 1) % 1000 === 0) {
        console.log(`Generation ${i + 1}: Current Best Score: ${bestScore}, Current Max Idle Time: ${bestIdle}`);
    }

    schedule = candidate;
}

  schedule = simulatedAnnealing(bestSchedule, 1000, 100, 0.95, timeSlots);
  schedule = simulatedAnnealing(schedule, 1000, 100, 0.95, timeSlots);

  return schedule;
}


module.exports = {
  generateSchedule
}