const { addFacultyDocumentsFromList } = require('./addFaculties');
const { fetchProgramsForAllFaculties } = require('./addPrograms');
const { fetchBranchesByFacultyDoc } = require('./addBranches');
const { fetchCoursesByFacultyDoc } = require('./addCourses');
const { fetchTutorsByFacultyDoc } = require('./addTutors');
const { fetchGroupsByFacultyDoc } = require('./addGroups');
const { fetchLecturesByFacultyDoc } = require('./addLectures');
const { fetchRoomsByFacultyDoc } = require('./addRooms');


module.exports = {
  addFacultyDocumentsFromList,
  fetchProgramsForAllFaculties,
  fetchBranchesByFacultyDoc,
  fetchCoursesByFacultyDoc,
  fetchTutorsByFacultyDoc,
  fetchGroupsByFacultyDoc,
  fetchLecturesByFacultyDoc,
  fetchRoomsByFacultyDoc,
};
