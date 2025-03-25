const express = require("express");
const app = express();

require("dotenv").config();
const port = process.env.PORT || 3000;

const Sentry = require("@sentry/node");
const bodyParser = require("body-parser");
const cors = require("cors");

Sentry.init({
    dsn: process.env.sentry_dsn,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
    ],
    tracesSampleRate: 1.0
});

const router = require("./util/router");

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(cors({ origin: ["https://marketkings.work.gd"] })); // Restrict origin
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("/", router);

app.use(Sentry.Handlers.errorHandler());

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);
});

const { exec } = require("child_process");

// Automatic Git Pull
setInterval(() => {
    exec("git pull", (err, stdout) => {
        if (err) {
            console.error("Git Pull Error:", err);
            return;
        }
        if (stdout.includes("Already up to date.")) return;

        console.log(stdout);
        // Removed process.exit() to avoid server termination
    });
}, 30 * 1000); // 30 seconds