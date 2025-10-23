
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { neon } from '@neondatabase/serverless';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from this folder
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware to log all routes
app.use((req, res, next) => {
  try {
    
    // Safely log registered routes
    if (app._router && app._router.stack) {
      const registeredRoutes = app._router.stack
        .filter(r => r.route)
        .map(r => ({
          method: Object.keys(r.route.methods).join(', '),
          path: r.route.path
        }));
      
      }
  } catch (logError) {
    console.error('Error in route logging middleware:', logError);
  }
  
  next();
});

// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON in request body'
    });
  }
  next();
});

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to handle OPTIONS requests for global availability
app.options("/api/global-availability", cors());

// Parse JSON bodies
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('Invalid JSON:', e);
      throw new Error('Invalid JSON');
    }
  }
}));


// ✅ Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// ✅ Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));


// Test route
app.get("/api/test", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.json({
      message: "Connected to Neon!",
      version: result[0].version,
    });
  } catch (err) {
    console.error('Connection failed:', err);
    res.status(500).json({ error: err.message });
  }
});


// Availability routes
app.get("/api/availability", async (req, res) => {
  try {
    // Fetch both hospital details
    const hospitals = await sql`
      SELECT 
        hospital_type, 
        hospital_name, 
        hospital_address, 
        hospital_map_url, 
        weekly_schedule, 
        exceptions,
        is_available,
        note
      FROM availability 
      WHERE hospital_type IN ('maqsooda', 'pinum')
    `;

    
    // Convert result to expected structure
    const result = {
      maqsooda: hospitals.find(h => h.hospital_type === 'maqsooda'),
      pinum: hospitals.find(h => h.hospital_type === 'pinum')
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch availability',
      error: error.toString() 
    });
  }
});

app.post("/api/availability", async (req, res) => {
  try {
    
    const { 
      hospital_type, 
      hospital_name, 
      hospital_address, 
      hospital_map_url, 
      weekly_schedule, 
      exceptions,
      is_available,
      note
    } = req.body;
    

    // Validate required fields
    if (!hospital_type || !hospital_name) {
      console.error('Validation failed: hospital_type or hospital_name missing');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Hospital type and name are required' 
      });
    }

    // Upsert hospital details
    const result = await sql`
      INSERT INTO availability 
      (hospital_type, hospital_name, hospital_address, hospital_map_url, 
       weekly_schedule, exceptions, is_available, note) 
      VALUES (
        ${hospital_type}, 
        ${hospital_name}, 
        ${hospital_address || ''}, 
        ${hospital_map_url || ''}, 
        ${JSON.stringify(weekly_schedule || {})}, 
        ${JSON.stringify(exceptions || [])},
        ${is_available !== undefined ? is_available : true},
        ${note || ''}
      )
      ON CONFLICT (hospital_type) 
      DO UPDATE SET 
        hospital_name = EXCLUDED.hospital_name,
        hospital_address = EXCLUDED.hospital_address,
        hospital_map_url = EXCLUDED.hospital_map_url,
        weekly_schedule = EXCLUDED.weekly_schedule,
        exceptions = EXCLUDED.exceptions,
        is_available = EXCLUDED.is_available,
        note = EXCLUDED.note,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.status(200).json({
      status: 'success',
      message: 'Hospital details updated successfully',
      data: result[0]
    });
  } catch (insertError) {
    console.error("Error updating hospital details:", insertError);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update hospital details',
      error: insertError.toString(),
      stack: insertError.stack
    });
  }
});

// Global Availability Routes
app.get("/api/global-availability", async (req, res) => {
  
  try {
    
    const globalAvailability = await sql`
      SELECT is_available, note 
      FROM global_availability 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;


    if (!globalAvailability || globalAvailability.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'No global availability found' 
      });
    }

    const availabilityData = globalAvailability[0];
    
    // Validate response data
    if (typeof availabilityData.is_available !== 'boolean') {
      console.warn('Invalid is_available value:', availabilityData.is_available);
      availabilityData.is_available = true; // Default to true
    }

    res.status(200).json({
      status: 'success',
      data: {
        is_available: availabilityData.is_available,
        note: availabilityData.note || ''
      }
    });
  } catch (error) {
    console.error("Error fetching global availability:", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch global availability',
      error: error.toString(),
      ...(error.stack ? { stack: error.stack } : {})
    });
  }
});

app.post("/api/global-availability", async (req, res) => {
  
  try {
    
    const { 
      is_available, 
      note 
    } = req.body || {};
    

    // Validate input
    if (is_available === undefined || is_available === null) {
      console.error('Validation failed: is_available is required');
      return res.status(400).json({ 
        status: 'error', 
        message: 'is_available is required and must be a boolean' 
      });
    }

    // Ensure is_available is a boolean
    const safeIsAvailable = !!is_available;
    const safeNote = (note || '').toString().trim();

    // Insert new global availability record
    const result = await sql`
      INSERT INTO global_availability 
      (is_available, note) 
      VALUES (
        ${safeIsAvailable}, 
        ${safeNote}
      )
      RETURNING *
    `;


    if (!result || result.length === 0) {
      console.error('No result returned from database insert');
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save global availability'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Global availability updated successfully',
      data: {
        is_available: result[0].is_available,
        note: result[0].note || ''
      }
    });
  } catch (insertError) {
    console.error("Error updating global availability:", insertError);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update global availability',
      error: insertError.toString(),
      ...(insertError.stack ? { stack: insertError.stack } : {})
    });
  }
});

// --- Contact Message Submission ---
app.post("/api/messages", async (req, res) => {
  try {
    const { name, phone, email, location, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    await sql`
      INSERT INTO messages (name, phone, email, location, message)
      VALUES (${name}, ${phone}, ${email}, ${location}, ${message})
    `;

    res.json({ success: true, message: "Message saved successfully!" });

  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message." });
  }
});


// --- Save contact message ---
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, location, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Insert into messages table (read = false by default)
    const result = await sql`
      INSERT INTO messages (name, phone, email, location, message, read)
      VALUES (${name}, ${phone}, ${email}, ${location}, ${message}, false)
      RETURNING *
    `;

    res.status(200).json({
      status: 'success',
      message: 'Message saved successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// --- MESSAGES ADMIN ROUTES ---

// 📥 Get all messages (optionally unread only)
app.get('/api/admin/messages', async (req, res) => {
  try {
    const { filter } = req.query; // "all" or "unread"
    const messages = await sql`
      SELECT * FROM messages
      ${filter === 'unread' ? sql`WHERE read = false` : sql``}
      ORDER BY created_at DESC
    `;
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});



// 🗑️ Delete a message
app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM messages WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});




// Feedback Routes
// Create new feedback
app.post("/api/feedback", async (req, res) => {
  
  try {
    // Log parsed request body
    const { 
      name, 
      location, 
      message, 
      rating 
    } = req.body;


    // Detailed input validation with logging
    const validationErrors = [];
    if (!name) validationErrors.push('Name is required');
    if (!location) validationErrors.push('Location is required');
    if (!message) validationErrors.push('Message is required');

    // Validate rating
    const validRatings = [3.0, 3.5, 4.0, 4.5, 5.0];
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || !validRatings.includes(parsedRating)) {
      validationErrors.push('Invalid rating');
    }

    if (validationErrors.length > 0) {
      console.error('🚨 Validation Errors:', validationErrors);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    // Insert feedback - set visible to false by default
    const result = await sql`
    INSERT INTO feedback 
    (name, location, message, rating, visible) 
    VALUES (
      ${name}, 
      ${location}, 
      ${message}, 
      ${parsedRating}, 
      false
    )
    RETURNING *
    `;



    // Verify insertion
    if (!result || result.length === 0) {
      console.error('No rows were inserted');
      return res.status(500).json({
        status: 'error',
        message: 'Failed to insert feedback - no rows affected'
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully. It will be reviewed by admin.',
      data: result[0]
    });
  } catch (error) {
    // Comprehensive error logging
    console.error('FULL Feedback Submission Error:', error);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);

    // Check for specific PostgreSQL errors
    if (error.code) {
      console.error('PostgreSQL Error Code:', error.code);
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to submit feedback',
      errorDetails: {
        message: error.message,
        name: error.name,
        code: error.code
      }
    });
  }
});

// Fetch approved and featured feedbacks for public display
app.get("/api/feedback", async (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      featured = false 
    } = req.query;

    const query = featured ? 
    sql`
        SELECT * FROM feedback 
        WHERE visible = true
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    : sql`
        SELECT * FROM feedback 
        WHERE visible = true
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

    const feedbacks = await query;

    res.status(200).json({
      status: 'success',
      data: feedbacks
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedbacks',
      error: error.toString()
    });
  }
});

// Admin routes for managing feedback
app.get("/api/admin/feedback", async (req, res) => {
  
  try {
    const { 
      limit = 50, 
      offset = 0, 
      approved = null 
    } = req.query;

    let query;
    if (approved === null) {
      // Fetch all feedbacks
      query = sql`
        SELECT * FROM feedback 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Fetch filtered feedbacks
      query = sql`
        SELECT * FROM feedback 
        WHERE visible = true
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
    }

    const feedbacks = await query;

    res.status(200).json({
      status: 'success',
      data: feedbacks
    });
  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedbacks',
      error: error.toString()
    });
  }
});

// Update feedback status (approve/feature/visibility)
app.patch("/api/admin/feedback/:id", async (req, res) => {
  
  try {
    const { id } = req.params;
    const { visible } = req.body;
  
    const result = await sql`
      UPDATE feedback
      SET visible = COALESCE(${visible}, visible)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: result[0]
    });
  } catch (error) {
    console.error('Admin feedback update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update feedback',
      error: error.toString()
    });
  }
});

// Delete feedback
app.delete("/api/admin/feedback/:id", async (req, res) => {
  
  try {
    const { id } = req.params;
  
    const result = await sql`
      DELETE FROM feedback
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Feedback deleted successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Admin feedback delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete feedback',
      error: error.toString()
    });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Handle any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
