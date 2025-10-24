require("dotenv").config();

import { createServer } from "http";
import { neon } from "@neondatabase/serverless";
import { parse } from 'url';

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in .env file");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);


// Request handler
const requestHandler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = parse(req.url, true);
  
  try {
    // Test database connection route
    if (parsedUrl.pathname === '/api/test-db') {
      try {
        const result = await sql`SELECT NOW()`;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          status: 'success', 
          message: 'Database connection successful',
          time: result[0].now 
        }));
        return;
      } catch (dbError) {
        console.error("Database connection test failed:", dbError);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          status: 'error', 
          message: 'Database connection failed',
          error: dbError.toString() 
        }));
        return;
      }
    }

    // Messages routes
    if (parsedUrl.pathname === '/api/messages') {
      if (req.method === 'GET') {
        const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(messages));
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { name, phone, email, location, message } = JSON.parse(body);
            const result = await sql`
              INSERT INTO messages (name, phone, email, location, message) 
              VALUES (${name}, ${phone}, ${email}, ${location}, ${message}) 
              RETURNING *
            `;
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result[0]));
          } catch (insertError) {
            console.error("Error inserting message:", insertError);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ 
              status: 'error', 
              message: 'Failed to insert message',
              error: insertError.toString() 
            }));
          }
        });
      }
    }
    
    // Feedback routes
    else if (parsedUrl.pathname === '/api/feedback') {
      if (req.method === 'GET') {
        const feedback = await sql`SELECT * FROM feedback ORDER BY created_at DESC`;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(feedback));
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          const { name, location, rating, text, visible } = JSON.parse(body);
          const result = await sql`
            INSERT INTO feedback (name, location, rating, text, visible) 
            VALUES (${name}, ${location}, ${rating}, ${text}, ${visible}) 
            RETURNING *
          `;
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result[0]));
        });
      }
    }
    
    // Availability routes
    else if (parsedUrl.pathname === '/api/availability') {
      if (req.method === 'GET') {
        const availability = await sql`
          SELECT * FROM availability ORDER BY updated_at DESC LIMIT 1
        `;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(availability[0] || { is_available: true, note: '' }));
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          const { is_available, note } = JSON.parse(body);
          const result = await sql`
            INSERT INTO availability (is_available, note) 
            VALUES (${is_available}, ${note}) 
            RETURNING *
          `;
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result[0]));
        });
      }
    }
    
    // Default route
    else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error: " + error.toString());
  }
};

// Create and start server
const server = createServer(requestHandler);
const PORT = process.env.PORT || 3000;

// Initialize tables before starting server
initializeTables().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error("Failed to initialize tables:", error);
  process.exit(1);
});
