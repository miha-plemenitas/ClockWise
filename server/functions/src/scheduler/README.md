# Scheduler

The scheduler is triggered by calling `POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addFaculties'`. It currently works only for `facultyId 13` (FERI), since each faculty uses its own execution types and rooms.
## Prerequisites
- Integrated existing lectures and rooms from the Wise TimeTable API.
- Scraped room data from Wise TimeTable Web UI to obtain room sizes.
## Preparation
### Room data
The room data is retrieved from the `faculty.rooms` Firestore collection. IDs 213 (a room that does not exist) and 308 (MS Teams) are filtered out.

The rooms are then separated into three diffrent arrays. 
- LArooms: Rooms for lab exercises 
- RUrooms: Rooms with computers
- otherRooms: rooms that do not fit into other two arrays
### Lectures
All lectures are received from the `faculty.original_lectures` Firestore collection and formatted into the desired format.
- The maximum size room in the `room_ids` is found to determine which rooms can accommodate the number of students for each lecture.
- The execution types are grouped.
- It is decided whether the lectures will be scheduled again. They will not be scheduled if the `executionTypeId` is 102 (Bachelor thesis), 116 (Project), 110 (Master's thesis), or 93 (Internship). Lectures without a size or with an empty course string will also not be scheduled. If they are to be scheduled, `lecture.schedulable` is set to 1; otherwise, it is set to -1.
- An `id` is assigned to each lecture.
### Expanding lectures
Lectures are grouped based on course, execution type, size, tutors, and groups. 
- Each lecture is then assigned the ID of the previous and next lecture to enable traversal through connected lectures.
### TimeSlots
Days off are retrieved from the `faculty.daysOff` Firestore collection. The dates of the first and last lectures are determined, and an array of all the dates between these two is generated, excluding days off and weekends. 
For each of these dates, an array of hours is generated: 
- From 7:00 to 21:00, or 
- From 10:00 to 21:00 if the day is Wednesday. 

This information is then assigned to `globalTimeSlots`.
## Scheduling
All formatted lectures are separated into two arrays: those with `schedulable` set to -1 and all others.
#### Unschedulables
The original date and hour of the unschedulable lectures are retained and input into the new schedule. However, if the original date is not in `timeSlots`, they are not scheduled. Additionally, conflicts are not checked for these lectures.
### Schedulables
The array of lectures is first shuffled and then sorted so that lectures with `prevId` of -1 are first. 
The function `scheduleLecture` receives the current lecture, an array of lectures, and a `failSafe` parameter. The `failSafe` parameter is initially set to 0, but it is checked each time the function is called. If `failSafe` is greater than 1, it indicates that the lecture could not be scheduled. Additionally, the function checks if `schedulable` is 0, meaning the lecture is already scheduled.
#### Finding valid term
A valid term is sought based on the execution type and ensuring there are no conflicts. If conflicts exist and a lecture cannot be scheduled, the course is logged and skipped. Conflicts are checked for each room, tutor, and group already in the schedule. If there is an overlap, the lecture will not be scheduled for that time slot.

When a valid term is found and the lecture is scheduled, it is checked if the lecture `nextId` is not -1. If it does, the lecture with that `nextId` is scheduled next.
#### Scheduling next lecture
The date and hour of the previous lecture are determined, and it is checked if the date plus one week is in the time slots. If it is not, it is then checked if the entire week is off or only that specific day. An array of available days is returned.

If the next week date is available, it is scheduled by finding a valid term with preference, which first checks if the day and hour are without conflicts. If not, it continues to iterate like normal. The same process is followed for the array of available days.

If the next week is later than the cutoff date for the summer semester ("2024-06-14"), the search starts from the beginning, with the fail-safe set to 1. The function then calls itself recursively to schedule the next lecture.
