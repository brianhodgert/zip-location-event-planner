async function availabilityCollector(
  playerID,
  activities,
  availabilities,
  location,
  db
) {
  console.log(playerID);
  console.log(activities);
  console.log(availabilities);
  console.log(location);
  for (var activity of activities) {
    for (var availability of availabilities) {
      const expression = "#pk = :pk AND #sk = :sk ";
      const names = {
        "#pk": "PK",
        "#sk": "SK",
      };
      const values = {
        ":pk": `${activity.activity}-${location}-player`,
        ":sk": `${availability.dayOfWeek}-${playerID}-${availability.timeOfDay}`,
      };
      console.log(values);
      const response = await db.queryItem(expression, names, values);
      console.log(response);
      for (item of response) {
        const key = { PK: item.PK, SK: item.SK };
        console.log(key);
        await db.deleteItem(key);
      }
    }
  }
}
module.exports.availabilityCollector = availabilityCollector;
