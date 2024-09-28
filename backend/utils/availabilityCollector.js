async function availabilityCollector(
  playerID,
  activities,
  availabilities,
  location,
  db
) {
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

      const response = await db.queryItem(expression, names, values);

      for (item of response) {
        const key = { PK: item.PK, SK: item.SK };

        await db.deleteItem(key);
      }
    }
  }
}
module.exports.availabilityCollector = availabilityCollector;
