async function availabilityGenerator(
  playerID,
  activities,
  availabilities,
  location,
  db
) {
  for (var activity of activities) {
    for (var availability of availabilities) {
      var startTime = "05:00";
      var endTime = "23:00";
      if (availability.timeOfDay) {
        if (availability.timeOfDay == "morning") {
          (startTime = "05:00"), (endTime = "11:00");
        }
        if (availability.timeOfDay == "afternoon") {
          (startTime = "11:00"), (endTime = "13:00");
        }
        if (availability.timeOfDay == "evening") {
          (startTime = "13:00"), (endTime = "23:00");
        }
      }

      const searchableAvailiability = {
        PK: `${activity.activity}-${location}-player`,
        SK: `${availability.dayOfWeek}-${playerID}-${availability.timeOfDay}`,
        playerID: playerID,
        dayOfWeek: availability.dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        activity: activity.activity,
        location: location,
        skill: activity.skill,
      };

      await db.putItem(searchableAvailiability);
    }
  }
}
module.exports.availabilityGenerator = availabilityGenerator;
