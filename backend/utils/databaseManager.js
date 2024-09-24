class DbUtils {
  constructor(db, tableName) {
    this.DB = db;
    this.tableName = tableName;
  }

  deleteItem(key) {
    const params = {
      TableName: this.tableName,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      this.DB.delete(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  deleteItems(pk, items) {
    if (items.length > 0) {
      const params = {
        RequestItems: {
          [this.tableName]: [],
        },
      };

      for (var item of items) {
        const key = {
          PK: pk,
          SK: item.SK,
        };

        params.RequestItems[this.tableName].push({
          DeleteRequest: {
            Key: key,
          },
        });
      }

      return new Promise((resolve, reject) => {
        this.DB.batchWrite(params, function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
  }

  putItem(itemObject) {
    const params = {
      Item: itemObject,
      TableName: this.tableName,
    };
    return new Promise((resolve, reject) => {
      this.DB.put(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  getItem(key) {
    const params = {
      Key: key,
      TableName: this.tableName,
    };
    return new Promise((resolve, reject) => {
      this.DB.get(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          var response = null;
          if (data?.Item) {
            response = data?.Item;
          }
          resolve(response);
        }
      });
    });
  }

  updateItem(expression, key, names, values, condition = undefined) {
    const params = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: expression,
      ConditionExpression: condition,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    };
    return new Promise((resolve, reject) => {
      this.DB.update(params, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  queryItem(expression, names, values, consistentRead = false) {
    var params = {
      TableName: this.tableName,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConsistentRead: consistentRead,
    };
    return new Promise((resolve, reject) => {
      this.DB.query(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          var response = null;
          if (data?.Items) {
            response = data?.Items;
          }
          resolve(response);
        }
      });
    });
  }
}
module.exports = DbUtils;
