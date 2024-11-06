/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */

class CustomError extends Error {
  constructor(status, statusText) {
    super(status);
    this.status = status;
    this.statusText = statusText;
  }
}

function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);

    fetch(url)
      .then((response) => {
        if (response.ok) {
          response
            .json()
            .then((data) => {
              resolve({ data: data });
            })
            .catch(() => reject(new CustomError(response.status, response.statusText))
            );
        } else {
          reject(new CustomError(response.status, response.statusText));
        }
      })
      .catch(() => reject(new CustomError(404, "Not Found")));
  });
}

export default fetchModel;
