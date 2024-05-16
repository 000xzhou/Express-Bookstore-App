/** Server for bookstore. */

const app = require("./app");

app.listen(0, () => {
  console.log(`Server starting on port 0`);
});
