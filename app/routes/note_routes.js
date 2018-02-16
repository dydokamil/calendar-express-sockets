var ObjectID = require("mongodb").ObjectID;
var _ = require("lodash");

module.exports = function(app, db) {
  app.get("/events/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db
      .db("first")
      .collection("notes")
      .findOne(details, (err, item) => {
        if (err) {
          res.send({ error: "An error has occurred." });
        } else {
          res.send(item);
        }
      });
  });

  app.get("/events", (req, res) => {
    let { year, month, day } = req.query;
    year = parseInt(year, 10);
    month = parseInt(month, 10);
    day = parseInt(day, 10);

    let match = { year, month, day };
    match = _.pickBy(match, _.isInteger);

    aggregated = db
      .db("first")
      .collection("notes")
      .aggregate([
        {
          $project: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
            start: true,
            end: true,
            date: true,
            label: true
          }
        },
        { $match: match },
        {
          $project: {
            date: true,
            end: true,
            start: true,
            label: true
          }
        }
      ]);

    aggregated.toArray((err, results) => {
      if (err) console.log(err);
      res.send(results);
    });
  });

  app.post("/events", (req, res) => {
    let { date, start, end, label } = req.body;

    let errors = {};

    if (!label) {
      errors = { ...errors, label: "Provide the label" };
    }

    if (!date) {
      errors = { ...errors, date: "Provide the date" };
    }

    if (errors.length) {
      res.statusCode = 400;
      res.send(errors);
      return;
    }

    if (!(start && end)) {
      start = end = undefined;
    } else {
      start = new Date(start);
      end = new Date(end);
    }

    date = new Date(date);

    let calendarEvent = {
      date,
      label,
      start,
      end
    };

    db
      .db("first")
      .collection("notes")
      .insert(calendarEvent, (err, result) => {
        if (err) {
          res.send({ error: "An error has occured." });
        } else {
          res.send(result.ops[0]);
        }
      });
  });

  app.delete("/events/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db
      .db("first")
      .collection("notes")
      .remove(details, (err, item) => {
        if (err) {
          res.send({ error: "An error has occured" });
        } else {
          res.send(`Note ${id} deleted!`);
        }
      });
  });

  // app.put("/events/:id", (req, res) => {
  //   const id = req.params.id;
  //   const details = { _id: new ObjectID(id) };
  //
  //   let record = db
  //     .db("first")
  //     .collection("notes")
  //     .findOne(details, (err, item) => {
  //       console.log({ ...item, year: req.body.year });
  //       if (err) {
  //         res.send({ error: "An error has occurred." });
  //       } else {
  //         res.send(item);
  //       }
  //     });
  //
  //   record = { ...record, year: req.body.year };
  //
  //   console.log(record);
  //   return;
  //
  //   const calendarEvent = { text: req.body.body, title: req.body.title };
  //   db
  //     .db("first")
  //     .collection("notes")
  //     .update(details, calendarEvent, (err, result) => {
  //       if (err) {
  //         res.send({ error: "An error has occured." });
  //       } else {
  //         res.send(calendarEvent);
  //       }
  //     });
  // });
};
