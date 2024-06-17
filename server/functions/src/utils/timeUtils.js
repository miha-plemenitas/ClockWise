const { Timestamp } = require('firebase-admin/firestore');


function setFirestoreTimestampsAndDuration(lecture){
  const startTimeDateObj = new Date(lecture.start_time);
  const endTimeDateObj = new Date(lecture.end_time);

  const startTime = lecture.start_time ? Timestamp.fromDate(startTimeDateObj) : null;
  const endTime = lecture.end_time ? Timestamp.fromDate(endTimeDateObj) : null;
  const duration = (endTimeDateObj - startTimeDateObj) / (1000 * 60 * 60);

  return {startTime, endTime, duration};
}


module.exports = {
  setFirestoreTimestampsAndDuration
}