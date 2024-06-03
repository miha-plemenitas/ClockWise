module.exports = {
  wttUrl: "https://wise-tt.com/WTTWebRestAPI/ws/rest/",
  bufferedCredentials: Buffer.from("wtt_api_user_a:H50lsd2$XejBIBv7t"),
  userAllowedKeys: ["facultyId", "programId", "branchId", "groupId"],
  eventAllowedKeys: ["startTime", "endTime", "title", "notes", "location"],
  allowedRoles: ['student', 'professor', 'referat','admin'],
  faculties: [
    {
       "schoolCode":"wtt_umpf",
       "name":"Pravna fakulteta",
       "id": 0
    },
    {
       "schoolCode":"wtt_um_pef",
       "name":"Pedagoška fakulteta",
       "id": 1
    },
    {
       "schoolCode":"wtt_um_mf",
       "name":"Medicinska fakulteta",
       "id": 2
    },
    {
       "schoolCode":"wtt_um_ff",
       "name":"Filozofska fakulteta",
       "id": 3
    },
    {
       "schoolCode":"wtt_um_fzv",
       "name":"Fakulteta za zdravstvene vede",
       "id": 4
    },
    {
       "schoolCode":"wtt_ft",
       "name":"Fakulteta za turizem",
       "id": 5
    },
    {
       "schoolCode":"wtt_um_fvv",
       "name":"Fakulteta za varnostne vede",
       "id": 6
    },
    {
       "schoolCode":"wtt_um_fs",
       "name":"Fakulteta za strojništvo",
       "id": 7
    },
    {
       "schoolCode":"wtt_um_fkbv",
       "name":"Fakulteta za kmetijstvo in biosistemske vede",
       "id": 8
    },
    {
       "schoolCode":"wtt_um_fnm",
       "name":"Fakulteta za naravoslovje in matematiko",
       "id": 9
    },
    {
       "schoolCode":"wtt_um_fl",
       "name":"Fakulteta za logistiko",
       "id": 10
    },
    {
       "schoolCode":"wtt_um_fkkt",
       "name":"Fakulteta za kemijo in kemijsko tehnologijo",
       "id": 11
    },
    {
       "schoolCode":"wtt_um_feum",
       "name":"Fakulteta za energetiko",
       "id": 12
    },
    {
       "schoolCode":"wtt_um_feri",
       "name":"Fakulteta za elektrotehniko, računalništvo in informatiko",
       "id": 13
    },
    {
       "schoolCode":"wtt_um_fgpa",
       "name":"Fakulteta za gradbeništvo, prometno inženirstvo in arhitekturo",
       "id": 14
    },
    {
       "schoolCode":"wtt_um_epf",
       "name":"Ekonomsko-poslovna fakulteta",
       "id": 15
    }
 ]
};
