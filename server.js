import { readFile } from "fs/promises";
import { createServer } from "http";
import path from "path";
import db from "./db.js";

const PORT = 3000;

/* ---------- File Server Helper ---------- */
const serveFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
};

/* ---------- HTTP Server ---------- */
const server = createServer((req, res) => {
    console.log(req.method, req.url);

    if (req.method === "GET") {
        if (req.url === "/") {
            return serveFile(res, path.join("public", "index.html"), "text/html");
        }

        if (req.url === "/style.css") {
            return serveFile(res, path.join("public", "style.css"), "text/css");
        }
    }

    if (req.method === "POST" && req.url === "/submit") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const data = JSON.parse(body);

                const {
                    stuName,
                    stuEmail,
                    dob,
                    gender,
                    mobile,
                    city,
                    state,
                    cetPercentile
                } = data;

                const sql = `
                    INSERT INTO students
                    (stuName, stuEmail, dob, gender, mobile, city, state, cetPercentile)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    stuName,
                    stuEmail,
                    dob,
                    gender,
                    mobile,
                    city,
                    state,
                    cetPercentile
                ];

                db.query(sql, values, err => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Database error");
                        return;
                    }

                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("Form submitted successfully");
                });

            } catch (err) {
                console.error(err);
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Invalid data");
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
