require("./settings");
const http = require("http");
const app = require("./index");
const PORTHOST = port || 8890;

http.createServer(app).listen(PORTHOST, () => {
    console.log(`Server running on http://localhost:` + PORTHOST)
console.log(`Hello ${creator}`)
})

process.on("uncaughtException", (err) => {
    console.error("There was an uncaught exception:", err);
    // Optionally shut down the server gracefully
  //  process.exit(1);
  });
  
  // Catch unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Optionally shut down the server gracefully
   // process.exit(1);
  });
  