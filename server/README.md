# API Documentation
//TODO opiši login itd itd

## Faculty

### addFaculties

`POST /integration-addFaculties`

Adds or updates faculty documents in the Firestore `faculties` collection from a given list of faculties that includes schoolCode, name and id.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addFaculties \
-u 'username:password'
```

#### Response
**Success (200)**
```
{
    "result": "All faculties added or updated successfully"
}
```
**Error (403)**
```
Unauthorized
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /faculty-get`

Fetches request faculty data from the Firestore `faculties` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/faculty-get?facultyId=13 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId        | String | The ID of the faculty | Yes       |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "13",
        "name": "Fakulteta za elektrotehniko, računalništvo in informatiko",
        "schoolCode": "wtt_um_feri",
        "facultyId": 13,
        "numberOfPrograms": 20
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAll

`GET /faculty-getAll`

Fetches all faculty data from the Firestore `faculties` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/faculty-getAll \
-u 'username:password'
```
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "0",
            "name": "Pravna fakulteta",
            "schoolCode": "wtt_umpf",
            "facultyId": 0,
            "numberOfPrograms": 4
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (405)**
```
Method {Request method} not allowed
```
## Program

### addPrograms

`POST /integration-addPrograms`

Fetches all academic programs for every faculty currently stored in Firestore, retrieves the corresponding data from the Wise TimeTable API, and saves the updated program information back into Firestore `faculty.programs` collection.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addPrograms \
-u 'username:password'
```

#### Response
**Success (200)**
```
{
    "result": "Added programs for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /program-get`

Fetches requested program data of faculty from the Firestore `faculty.programs` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/program-get?facultyId=13&programId=7 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| programId | String | The ID of the program | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "7",
        "name": "INFORMATIKA IN TEHNOLOGIJE KOMUNICIRANJA UN (BU30)",
        "programDuration": "3",
        "programId": 7
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {programId} does not exist in faculty.programs under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForFaculty

`GET /program-get`

Fetches all programs for faculty from the Firestore `faculty.programs` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/program-get?facultyId=13 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId        | String | The ID of the faculty | Yes       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "1",
            "name": "ELEKTROTEHNIKA UN (BU10)",
            "programDuration": "3",
            "programId": 1
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Branch

### addBranches

`POST /integration-addBranches`

Fetches all  branches for every faculty and program currently stored in Firestore, retrieves the corresponding data from the Wise TimeTable API, and saves the updated program information back into Firestore `faculty.branches` collection.

Receives an optional request parameter `id`. If `id` is present, it fetches branches only for the selected faculty; otherwise, it fetches branches for all faculties.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addBranches?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id        | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added programs for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /branch-get`

Fetches requested branch data of faculty Firestore `faculty.branches` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/branch-get?facultyId=13&branchId=7 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| branchId  | String | The ID of the branch  | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "146",
        "name": "INFORMACIJSKA VARNOST (BU34)",
        "branchId": 146,
        "year": 3,
        "programId": 7
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {branchId} does not exist in faculty.branches under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForProgram

`GET /branch-getAllForProgram`

Fetches all branches for faculty and program from the Firestore `faculty.branches` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/branch-getAllForProgram?facultyId=13&programId=7 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| programId | String | The ID of the program | Yes      |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "105",
            "name": "INFORMACIJSKI SISTEMI (BU31)",
            "branchId": 105,
            "year": 3,
            "programId": 7
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForProgramYear

`GET /branch-getAllForProgramYear`

Fetches all branches for faculty, program and year from the Firestore `faculty.branches` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/branch-getAllForProgramYear?facultyId=13&programId=7&year=3 \
-u 'username:password'
```

| Parameter | Type   | Description             | Required |
| --------- | ------ | ----------------------- | -------- |
| facultyId | String | The ID of the faculty   | Yes      |
| programId | String | The ID of the program   | Yes      |
| year      | String | The year of the program | Yes      |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "105",
            "name": "INFORMACIJSKI SISTEMI (BU31)",
            "branchId": 105,
            "year": 3,
            "programId": 7
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Group

### addGroups

`POST /integration-addGroups`

Fetches all  groups for every faculty and branch currently stored in Firestore, retrieves the corresponding data from the Wise TimeTable API, and saves the updated program information back into Firestore `faculty.groups` collection.

Receives an optional request parameter `id`. If `id` is present, it fetches groups only for the selected faculty; otherwise, it fetches groups for all faculties.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addGroups?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added groups to all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /group-get`

Fetches requested group data of faculty Firestore `faculty.groups` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/group-get?facultyId=13&groupId=503 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| groupId   | String | The ID of the branch  | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "503",
        "groupId": 503,
        "name": "ITK 3 UN IV RV2",
        "branchId": 146,
        "programId": 7
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {groupId} does not exist in faculty.branches under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForProgram

`GET /group-getAllForBranch

Fetches all groups for faculty and branch from the Firestore `faculty.groups` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/group-getAllForBranch?facultyId=13&branchId=156 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| branchId  | String | The ID of the branch  | Yes      |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "495",
            "groupId": 495,
            "name": "ITK 3 UN IV",
            "branchId": 146,
            "programId": 7
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Lecture

### addLectures

`POST /integration-addLectures`

Fetches all lectures for every faculty currently stored in Firestore. Retrieves the corresponding data from the Wise TimeTable API and saves the updated program information back into Firestore `faculty.original_lectures` collection.

Receives an optional request parameter `id`. If `id` is present, it fetches lectures only for the selected faculty; otherwise, it fetches lectures for all faculties.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addLectures?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added lectures for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### duplicateLectures

`POST /integration-duplicateLectures`

Duplicates the `faculty.original_lectures` collection into the `faculty.lectures` collection in Firestore. This process involves copying all documents from `faculty.original_lectures` and saving them into `faculty.lectures`.

Receives an optional request parameter `id`. If `id` is present, it duplicates lectures only for the selected faculty; otherwise, it duplicates lectures for all faculties.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-duplicateLectures?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "The lectures were duplicated for all lectures"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForCourse

`GET /lecture-getAllForCourse`

Fetches all lectures for faculty and course from the Firestore `faculty.lectures` collection. 

If `startTime` is defined and `endTime` is not, lectures that start after the `startTime` will be returned. If `endTime` is defined and `startTime` is not, all lectures between today's date and the `endTime` will be returned. If neither is defined, all of today's lectures will be returned. If both are defined, lectures between the `startTime` and `endTime` will be returned.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-getAllForCourse?facultyId=13&courseId=1010&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| courseId  | String | The ID of the course                        | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | No       |
| endTime   | String | The end time of the date range (ISO 8601)   | No       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "S202 2024-02-26T07:00:00",
            "startTime": {
                "_seconds": 1708930800,
                "_nanoseconds": 0
            },
            "endTime": {
                "_seconds": 1708941600,
                "_nanoseconds": 0
            },
            "courseId": "1010",
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "executionTypeId": "2",
            "executionType": "PR",
            "branch_ids": [
                103,
                105,
                146
            ],
            "room_ids": [
                115
            ],
            "group_ids": [
                202,
                204,
                495
            ],
            "tutor_ids": [
                203
            ],
            "rooms": [
                {
                    "id": 115,
                    "name": "G2-P01, pritličje"
                }
            ],
            "tutors": [
                {
                    "id": 203,
                    "name": "LUKA PAVLIČ"
                }
            ],
            "groups": [
                {
                    "id": 202,
                    "name": "MK 3 UN MP"
                },
                {
                    "id": 204,
                    "name": "ITK 3 UN IS"
                },
                {
                    "id": 495,
                    "name": "ITK 3 UN IV"
                }
            ],
            "branches": [
                {
                    "id": 103,
                    "name": "BU51-R"
                },
                {
                    "id": 105,
                    "name": "BU31-R"
                },
                {
                    "id": 146,
                    "name": "BU34-R"
                }
            ],
            "duration": 3,
            "hasRooms": true
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForBranch

`GET /lecture-getAllForBranch`

Fetches all lectures for faculty and branch from the Firestore `faculty.lectures` collection. 

If `startTime` is defined and `endTime` is not, lectures that start after the `startTime` will be returned. If `endTime` is defined and `startTime` is not, all lectures between today's date and the `endTime` will be returned. If neither is defined, all of today's lectures will be returned. If both are defined, lectures between the `startTime` and `endTime` will be returned.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.getAllForBranch.net/lecture-getAllForCourse?facultyId=13&branchId=105&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| branchId  | String | The ID of the branch                        | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | No       |
| endTime   | String | The end time of the date range (ISO 8601)   | No       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "S202 2024-02-26T07:00:00",
            "startTime": {
                "_seconds": 1708930800,
                "_nanoseconds": 0
            },
            "endTime": {
                "_seconds": 1708941600,
                "_nanoseconds": 0
            },
            "courseId": "1010",
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "executionTypeId": "2",
            "executionType": "PR",
            "branch_ids": [
                103,
                105,
                146
            ],
            "room_ids": [
                115
            ],
            "group_ids": [
                202,
                204,
                495
            ],
            "tutor_ids": [
                203
            ],
            "rooms": [
                {
                    "id": 115,
                    "name": "G2-P01, pritličje"
                }
            ],
            "tutors": [
                {
                    "id": 203,
                    "name": "LUKA PAVLIČ"
                }
            ],
            "groups": [
                {
                    "id": 202,
                    "name": "MK 3 UN MP"
                },
                {
                    "id": 204,
                    "name": "ITK 3 UN IS"
                },
                {
                    "id": 495,
                    "name": "ITK 3 UN IV"
                }
            ],
            "branches": [
                {
                    "id": 103,
                    "name": "BU51-R"
                },
                {
                    "id": 105,
                    "name": "BU31-R"
                },
                {
                    "id": 146,
                    "name": "BU34-R"
                }
            ],
            "duration": 3,
            "hasRooms": true
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForGroup

`GET /lecture-getAllForGroup`

Fetches all lectures for faculty and group from the Firestore `faculty.lectures` collection. 

If `startTime` is defined and `endTime` is not, lectures that start after the `startTime` will be returned. If `endTime` is defined and `startTime` is not, all lectures between today's date and the `endTime` will be returned. If neither is defined, all of today's lectures will be returned. If both are defined, lectures between the `startTime` and `endTime` will be returned.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.getAllForGroup.net/lecture-getAllForCourse?facultyId=13&courseId=495&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| groupId   | String | The ID of the branch                        | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | No       |
| endTime   | String | The end time of the date range (ISO 8601)   | No       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "S202 2024-02-26T07:00:00",
            "startTime": {
                "_seconds": 1708930800,
                "_nanoseconds": 0
            },
            "endTime": {
                "_seconds": 1708941600,
                "_nanoseconds": 0
            },
            "courseId": "1010",
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "executionTypeId": "2",
            "executionType": "PR",
            "branch_ids": [
                103,
                105,
                146
            ],
            "room_ids": [
                115
            ],
            "group_ids": [
                202,
                204,
                495
            ],
            "tutor_ids": [
                203
            ],
            "rooms": [
                {
                    "id": 115,
                    "name": "G2-P01, pritličje"
                }
            ],
            "tutors": [
                {
                    "id": 203,
                    "name": "LUKA PAVLIČ"
                }
            ],
            "groups": [
                {
                    "id": 202,
                    "name": "MK 3 UN MP"
                },
                {
                    "id": 204,
                    "name": "ITK 3 UN IS"
                },
                {
                    "id": 495,
                    "name": "ITK 3 UN IV"
                }
            ],
            "branches": [
                {
                    "id": 103,
                    "name": "BU51-R"
                },
                {
                    "id": 105,
                    "name": "BU31-R"
                },
                {
                    "id": 146,
                    "name": "BU34-R"
                }
            ],
            "duration": 3,
            "hasRooms": true
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForRoom

`GET /lecture-getAllForRoom`

Fetches all lectures for faculty and room from the Firestore `faculty.lectures` collection. 

If `startTime` is defined and `endTime` is not, lectures that start after the `startTime` will be returned. If `endTime` is defined and `startTime` is not, all lectures between today's date and the `endTime` will be returned. If neither is defined, all of today's lectures will be returned. If both are defined, lectures between the `startTime` and `endTime` will be returned.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-getAllForTutor?facultyId=13&roomId=111&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| roomId    | String | The ID of the room                          | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | No       |
| endTime   | String | The end time of the date range (ISO 8601)   | No       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "S469 2024-02-26T07:00:00",
            "startTime": {
                "_seconds": 1708930800,
                "_nanoseconds": 0
            },
            "endTime": {
                "_seconds": 1708941600,
                "_nanoseconds": 0
            },
            "courseId": "58",
            "course": "SENZORSKA TEHNIKA I",
            "executionTypeId": "2",
            "executionType": "PR",
            "branch_ids": [
                6,
                141
            ],
            "room_ids": [
                111
            ],
            "group_ids": [
                6,
                335
            ],
            "tutor_ids": [
                36,
                538,
                506
            ],
            "rooms": [
                {
                    "id": 111,
                    "name": "G2-P2 BETA, pritličje"
                }
            ],
            "tutors": [
                {
                    "id": 36,
                    "name": "DENIS ĐONLAGIĆ"
                },
                {
                    "id": 538,
                    "name": "MATEJ NJEGOVEC"
                },
                {
                    "id": 506,
                    "name": "SIMON PEVEC"
                }
            ],
            "groups": [
                {
                    "id": 6,
                    "name": "E 2 VS avt."
                },
                {
                    "id": 335,
                    "name": "MEHA 2 VS"
                }
            ],
            "branches": [
                {
                    "id": 6,
                    "name": "BV11-R"
                },
                {
                    "id": 141,
                    "name": "BV70-R"
                }
            ],
            "duration": 3,
            "hasRooms": true
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForTutor

`GET /lecture-getAllForTutor`

Fetches all lectures for faculty and tutor from the Firestore `faculty.lectures` collection. 

If `startTime` is defined and `endTime` is not, lectures that start after the `startTime` will be returned. If `endTime` is defined and `startTime` is not, all lectures between today's date and the `endTime` will be returned. If neither is defined, all of today's lectures will be returned. If both are defined, lectures between the `startTime` and `endTime` will be returned.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-getAllForTutor?facultyId=13&tutor=203&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| tutorId   | String | The ID of the tutor                         | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | No       |
| endTime   | String | The end time of the date range (ISO 8601)   | No       |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "S202 2024-02-26T07:00:00",
            "startTime": {
                "_seconds": 1708930800,
                "_nanoseconds": 0
            },
            "endTime": {
                "_seconds": 1708941600,
                "_nanoseconds": 0
            },
            "courseId": "1010",
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "executionTypeId": "2",
            "executionType": "PR",
            "branch_ids": [
                103,
                105,
                146
            ],
            "room_ids": [
                115
            ],
            "group_ids": [
                202,
                204,
                495
            ],
            "tutor_ids": [
                203
            ],
            "rooms": [
                {
                    "id": 115,
                    "name": "G2-P01, pritličje"
                }
            ],
            "tutors": [
                {
                    "id": 203,
                    "name": "LUKA PAVLIČ"
                }
            ],
            "groups": [
                {
                    "id": 202,
                    "name": "MK 3 UN MP"
                },
                {
                    "id": 204,
                    "name": "ITK 3 UN IS"
                },
                {
                    "id": 495,
                    "name": "ITK 3 UN IV"
                }
            ],
            "branches": [
                {
                    "id": 103,
                    "name": "BU51-R"
                },
                {
                    "id": 105,
                    "name": "BU31-R"
                },
                {
                    "id": 146,
                    "name": "BU34-R"
                }
            ],
            "duration": 3,
            "hasRooms": true
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### findAvailableByIds

`GET /lecture-findAvailableByIds`

Fetches available time slots for faculty, group, room, and tutor from the Firestore `faculty.lectures` collection. It retrieves all lectures based on the provided IDs and finds free time slots for each day between startTime and endTime, within the hours of 7:00 AM and 9:00 PM.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-findAvailableByIds?facultyId=13&group=503&tutorId=203&roomId=115&startTime=2024-02-26&endTime=2024-06-14 \
-u 'username:password'
```

| Parameter | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                       | Yes      |
| startTime | String | The start time of the date range (ISO 8601) | Yes      |
| endTime   | String | The end time of the date range (ISO 8601)   | Yes      |
| groupId   | String | The ID of the group                         | No       |
| tutorId   | String | The ID of the tutor                         | No       |
| roomId    | String | The ID of the room                          | No       |
TutorId, groupId and roomId are all optional, however there are none recived, there will be a Error (400) response code.
#### Response
**Success (200)**
```
{
    "result": [
        "2024-02-26": [
            {
                "start": "07:00",
                "end": "21:00",
                "duration": 14
            }
        ], ...
    ]
}
```
**Error (400)**
```
No group, room or tutor ID sent
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### findAvailableRoomSizeAndGroupIds

`GET /lecture-findAvailableRoomSizeAndGroupIds`

Fetches available time slots for faculty, groups, and room size from the Firestore `faculty.lectures` collection. It retrieves all lectures based on the provided group IDs and room sizes greater than the requested size. Then, it finds all free time slots for each day between `startTime` and `endTime`, within the hours of 7:00 AM and 9:00 PM.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-findAvailableRoomSizeAndGroupIds?facultyId=13&roomSize=100&startTime=2024-02-26&endTime=2024-06-14&groupIds=503_502 \
-u 'username:password'
```

| Parameter | Type   | Description                                                     | Required |
| --------- | ------ | --------------------------------------------------------------- | -------- |
| facultyId | String | The ID of the faculty                                           | Yes      |
| startTime | String | The start time of the date range (ISO 8601)                     | Yes      |
| endTime   | String | The end time of the date range (ISO 8601)                       | Yes      |
| roomSize  | String | At least how many seats should the room have                    | Yes      |
| groupIds  | String | IDs of groups, can be one or more. If more seperate them with _ | No       |
#### Response
**Success (200)**
```
{
    "result": {
        "17": {
            "2024-02-26": [
                {
                    "start": "19:00",
                    "end": "21:00",
                    "duration": 2
                }
            ],
        }, ...
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### add

`POST /lecture-add

Recives a lecture object and saves it into Firestore `faculty.lectures` collection.

#### Request
```
curl -X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-add?facultyId=13 \
-u 'username:password' \
-H 'Content-Type: application/json' \ 
-d '{ 
	"courseId": "", 
	"course": "", 
	"rooms": [], 
	"tutors": [], 
	"groups": [],
	"branches": [], 
	"startTime": [],
	"endTime": []
	"executionType": "",
	"executionTypeId": "",
	"exam": ""
}'
```

| Parameter       | Type    | Description                  | Required    |
| --------------- | ------- | ---------------------------- | ----------- |
| facultyId       | String  | The ID of the faculty        | Yes         |
| courseId        | String  | The ID of the course         | No          |
| course          | String  | Course name                  | No          |
| rooms           | Array   | Array of courses             | Yes (empty) |
| tutors          | Array   | Array of tutors              | Yes (empty) |
| groups          | Array   | Array of groups              | Yes (empty) |
| branches        | Array   | Array of branches            | Yes (empty) |
| startTime       | String  | The start time (ISO 8601)    | No          |
| endTime         | String  | The end time (ISO 8601)      | No          |
| executionType   | String  | Execution type               | No          |
| executionTypeId | String  | The ID of the execution type | No          |
| exam            | Boolean | If there's a sheduled exam   | No          |

#### Response
**Success (200)**
```
{
    "result": {
        "startTime": null,
        "endTime": null,
        "courseId": "a",
        "course": "12",
        "executionTypeId": "99",
        "executionType": "99",
        "branch_ids": [],
        "room_ids": [],
        "group_ids": [],
        "tutor_ids": [],
        "rooms": [],
        "tutors": [],
        "groups": [],
        "branches": [],
        "duration": null,
        "hasRooms": false,
        "exam": true,
        "id": "FwlVdXbiVdkXIZp3OvT5"
    }
}
```
**Error (400)**
```
No rooms, tutors, groups or branches sent
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### update

`PUT /lecture-update

Recives a lecture object and saves it into Firestore `faculty.lectures` collection.

#### Request
```
curl -X PUT 'https://<your-region>-<your-project-id>.cloudfunctions.net/lecture-add?facultyId=13 \
-u 'username:password' \
-H 'Content-Type: application/json' \ 
-d '{ 
	"id": "Refb8f248-3de2-46e0-9887-5a1c814e7994 2024-02-28T07:00:00",
	"courseId": "", 
	"course": "", 
	"rooms": [], 
	"tutors": [], 
	"groups": [],
	"branches": [], 
	"startTime": [],
	"endTime": []
	"executionType": "",
	"executionTypeId": "",
	"exam": ""
}'
```

| Parameter       | Type    | Description                  | Required    |
| --------------- | ------- | ---------------------------- | ----------- |
| facultyId       | String  | The ID of the faculty        | Yes         |
| id              | String  | The ID of the lecture        | Yes         |
| courseId        | String  | The ID of the course         | No          |
| course          | String  | Course name                  | No          |
| rooms           | Array   | Array of courses             | Yes (empty) |
| tutors          | Array   | Array of tutors              | Yes (empty) |
| groups          | Array   | Array of groups              | Yes (empty) |
| branches        | Array   | Array of branches            | Yes (empty) |
| startTime       | String  | The start time (ISO 8601)    | No          |
| endTime         | String  | The end time (ISO 8601)      | No          |
| executionType   | String  | Execution type               | No          |
| executionTypeId | String  | The ID of the execution type | No          |
| exam            | Boolean | If there's a sheduled exam   | No          |

#### Response
**Success (200)**
```
{
    "result": {
        "exam": true,
        "id": "Refb8f248-3de2-46e0-9887-5a1c814e7994 2024-02-28T07:00:00",
        "courseId": "a",
        "course": "12",
        "branches": [],
        "duration": null,
        "hasRooms": false,
        "startTime": null,
        "endTime": null
    }
}
```
**Error (400)**
```
No lecture ID sent in request body
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Tutor

### addTutors
`POST /integration-addTutors`

Fetches all tutors for every faculty currently stored in Firestore, retrieves the corresponding data from the Wise TimeTable API, and saves the updated program information back into Firestore `faculty.tutors` collection.

Receives an optional request parameter `id`. If `id` is present, it fetches tutors only for the selected faculty; otherwise, it fetches tutors for all faculties.

#### Request
```
curl -X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addTutors?id=0 -u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added tutors for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /tutor-get`

Fetches requested tutor data of faculty Firestore `faculty.tutors` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/tutor-get?facultyId=13&tutorId=168 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| tutorId   | String | The ID of the tutor   | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "168",
        "tutorId": 168,
        "firstName": "IZTOK",
        "lastName": "PALČIČ"
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {tutorId} does not exist in faculty.branches under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForFaculty

`GET /tutor-getAllForFaculty

Fetches all tutors for faculty from the Firestore `faculty.tutors` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/tutor-getAllForFaculty?facultyId=13& \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |

#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "1",
            "tutorId": 1,
            "firstName": "IZTOK",
            "lastName": "PETERIN"
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Course

### addCourses

`POST /integration-addCourses`

Fetches all courses for every faculty currently stored in Firestore, retrieves the corresponding data from the Wise TimeTable API, and saves the updated program information back into Firestore `faculty.courses` collection.

Receives an optional request parameter `id`. If `id` is present, it fetches courses only for the selected faculty; otherwise, it fetches courses for all faculties.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addCourses?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added courses for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /course-get`

Fetches requested course data of faculty Firestore `faculty.courses` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/course-get?facultyId=13&courseId=1013 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| courseId  | String | The ID of the course  | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "1018",
        "courseId": 1018,
        "course": "SPLETNE TEHNOLOGIJE IN OZNAČEVALNI JEZIKI",
        "programId": 8,
        "branchId": 47
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {courseId} does not exist in faculty.branches under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForFaculty

`GET /course-getAllForFaculty

Fetches all courses for faculty from the Firestore `faculty.courses` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/course-getAllForFaculty?facultyId=13 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |

#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "1005",
            "courseId": 1005,
            "course": "RAZSVETLJAVA",
            "programId": 2,
            "branchId": 99
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForProgram

`GET /course-getAllForProgram

Fetches all courses for faculty and program from the Firestore `faculty.courses` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/course-getAllForProgram?facultyId=13&programId=7 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| programId | String | The ID of the program | Yes      |

#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "1010",
            "courseId": 1010,
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "programId": 7,
            "branchId": 105
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForBranch

`GET /course-getAllForBranch

Fetches all courses for faculty and branch from the Firestore `faculty.courses` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/course-getAllForBranch?facultyId=13&branchId=105 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| branchId  | String | The ID of the branch  | Yes      |
#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "1010",
            "courseId": 1010,
            "course": "PRAKTIKUM: SPLETNI SISTEMI IN VSEBINE",
            "programId": 7,
            "branchId": 105
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
## Room

### addRooms

`POST /integration-addRooms`

Obtains all existing rooms from lectures currently stored in Firestore, returning room IDs and room names. Data scraped from the Wise TimeTable web interface is then added to the rooms that match the room names. The enriched room information is then saved back into Firestore `faculty.rooms` collection.

Receives an optional request parameter `id`. If `id` is present, it obtains rooms only for the selected faculty; otherwise, it obtains rooms for all faculties.

#### Request
```
curl \
-X POST 'https://<your-region>-<your-project-id>.cloudfunctions.net/integration-addRooms?id=0 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| id | String | The ID of the faculty | No       |
#### Response
**Success (200)**
```
{
    "result": "Added rooms for all faculties"
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
### get

`GET /room-get`

Fetches requested room data of faculty Firestore `faculty.rooms` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/room-get?facultyId=13&roomId=314 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |
| roomId    | String | The ID of the room    | Yes      |
#### Response
**Success (200)**
```
{
    "result": {
        "id": "314",
        "roomId": 314,
        "roomName": "(LA) G2-2N.10 TESLA",
        "size": 0,
        "equipment": ""
    }
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
```
Item with id {roomId} does not exist in faculty.rooms under faculty with id {facultyId}
```
**Error (405)**
```
Method {Request method} not allowed
```
### getAllForFaculty

`GET /room-getAllForFaculty

Fetches all rooms for faculty from the Firestore `faculty.rooms` collection.

#### Request
```
curl \
-X GET 'https://<your-region>-<your-project-id>.cloudfunctions.net/rooms-getAllForFaculty?facultyId=13 \
-u 'username:password'
```

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| facultyId | String | The ID of the faculty | Yes      |

#### Response
**Success (200)**
```
{
    "result": [
        {
            "id": "111",
            "roomId": 111,
            "roomName": "G2-P2 BETA, pritličje",
            "size": 70,
            "equipment": ""
        }, ...
    ]
}
```
**Error (403)**
```
Unauthorized
```
**Error (404)**
```
Faculty with this ID was not found
```
**Error (405)**
```
Method {Request method} not allowed
```
