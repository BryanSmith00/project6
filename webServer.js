/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try {
      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        // No SchemaInfo found - return 500 error
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch (err) {
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }
  } else if (param === "counts") {
    // If the request parameter is "counts", we need to return the counts of all collections.
    // To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
    // We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.

    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    try {
      await Promise.all(
        collections.map(async (col) => {
          col.count = await col.collection.countDocuments({});
          return col;
        })
      );

      const obj = {};
      for (let i = 0; i < collections.length; i++) {
        obj[collections[i].name] = collections[i].count;
      }
      return response.end(JSON.stringify(obj));
    } catch (err) {
      return response.status(500).send(JSON.stringify(err));
    }
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  User.find({}, ["_id", "first_name", "last_name"])
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      response.status(400).send();
    });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  const id = request.params.id;

  User.findById(id, [
    "_id",
    "first_name",
    "last_name",
    "location",
    "description",
    "occupation",
  ])
    .then((result) => {
      if (result) {
        response.status(200).send(result);
      } else {
        response.status(400).send("Error: User not found");
      }
    })
    .catch(() => {
      response.status(400).send("User " + id + "not found");
    });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;
  try {
    let photos = await Photo.find({ user_id: id }, [
      "_id",
      "user_id",
      "comments",
      "file_name",
      "date_time",
    ]).populate("comments");

    let result = [];

    for (let i = 0; i < photos.length; i++) {
      let photo = photos[i];
      let comments = [];

      for (let j = 0; j < photos[i].comments.length; j++) {
        let comment = photo.comments[j];
        // eslint-disable-next-line no-await-in-loop
        let author = await User.findById(comment.user_id);

        comments.push({
          comment: comment.comment,
          date_time: comment.date_time,
          _id: comment._id,
          user: {
            _id: author._id,
            first_name: author.first_name,
            last_name: author.last_name,
          },
        });
      }
      result.push({
        _id: photo._id,
        user_id: photo.user_id,
        comments: comments,
        file_name: photo.file_name,
        date_time: photo.date_time,
      });
    }

    response.status(200).send(result);
  } catch (error) {
    response.status(400).send("Error with ID");
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
