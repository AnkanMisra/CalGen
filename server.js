import express from "express";
import { google } from "googleapis";
import fs from "fs";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configuration modules
import {
  EVENT_GENERATION_PROMPT,
  FALLBACK_EVENTS,
  DURATION_GUIDELINES,
  SCHEDULING_CONSTRAINTS,
} from "./prompts.js";
import {
  timeRangesOverlap,
  findAvailableTimeSlot,
  generateTimeRange,
  formatDuration,
} from "./calendarUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// Serve static files -优先使用React构建文件，开发时fallback到public
const isProduction = process.env.NODE_ENV === "production";
app.use(express.static(isProduction ? "frontend/dist" : "public"));

// Load credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

// Google People API for user info
const people = google.people({ version: "v1", auth: oAuth2Client });

// Generate dynamic event titles based on user input using AI
async function generateDynamicEventTitles(userInput, eventCount) {
  try {
    const prompt = EVENT_GENERATION_PROMPT(eventCount, userInput);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://fake-calendar-filler.com",
          "X-Title": "Fake Calendar Filler",
        },
        body: JSON.stringify({
          model: "z-ai/glm-4.5-air:free",
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "OpenRouter API error:",
        response.status,
        response.statusText,
      );
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenRouter API");
    }

    // Try to parse the JSON response
    let parsedContent;
    try {
      // Remove any markdown formatting that might be present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    const events = parsedContent.events || [];
    if (events.length === 0) {
      throw new Error("No events generated in response");
    }

    return events;
  } catch (error) {
    console.error("Error generating dynamic event titles:", error.message);

    // Fallback to predefined events based on user input if AI fails
    const fallbackEvents = generateFallbackEvents(userInput, eventCount);
    console.log("Using fallback events due to AI error");
    return fallbackEvents;
  }
}

// Generate fallback events when AI fails
function generateFallbackEvents(userInput, eventCount) {
  const input = userInput.toLowerCase();

  // Determine which category to use based on user input
  let selectedCategory = "personal"; // default

  if (
    input.includes("work") ||
    input.includes("job") ||
    input.includes("office") ||
    input.includes("meeting")
  ) {
    selectedCategory = "work";
  } else if (
    input.includes("study") ||
    input.includes("academic") ||
    input.includes("school") ||
    input.includes("college") ||
    input.includes("university")
  ) {
    selectedCategory = "academic";
  } else if (
    input.includes("gym") ||
    input.includes("exercise") ||
    input.includes("fitness") ||
    input.includes("workout")
  ) {
    selectedCategory = "personal";
  }

  const events =
    FALLBACK_EVENTS[selectedCategory] || FALLBACK_EVENTS["personal"];

  // Generate required number of events
  const result = [];
  for (let i = 0; i < eventCount; i++) {
    const event = events[i % events.length];
    result.push({
      ...event,
      title: `${event.title} ${i >= events.length ? `(${Math.floor(i / events.length) + 1})` : ""}`,
    });
  }

  return result;
}

const generateUniqueId = () => {
  return `fcf_${randomBytes(8).toString("hex")}`; // fcf = funny calendar filler
};

const checkAuthStatus = async () => {
  try {
    if (!fs.existsSync("token.json")) {
      return { authenticated: false, reason: "No token file" };
    }

    const tokens = JSON.parse(fs.readFileSync("token.json"));
    if (!tokens.access_token && !tokens.refresh_token) {
      return { authenticated: false, reason: "Invalid token format" };
    }

    // Set credentials for API calls
    oAuth2Client.setCredentials(tokens);

    // Get user info
    let userInfo = null;
    try {
      const response = await people.people.get({
        resourceName: "people/me",
        personFields: "names,emailAddresses,photos",
      });

      const person = response.data;
      const name = person.names?.[0]?.displayName || "Unknown";
      const email = person.emailAddresses?.[0]?.value || "Unknown";
      const photo = person.photos?.[0]?.url || null;

      userInfo = { name, email, photo };
    } catch (error) {
      console.warn(
        "Could not fetch user info (People API may need to be enabled):",
        error.message,
      );
      userInfo = { name: "Unknown", email: "Unknown", photo: null };
    }

    return {
      authenticated: true,
      reason: "Token valid",
      user: userInfo,
    };
  } catch (error) {
    return {
      authenticated: false,
      reason: `Error reading token: ${error.message}`,
    };
  }
};

// Simple version for non-async calls (fallback)
const checkAuthStatusSync = () => {
  try {
    if (!fs.existsSync("token.json")) {
      return { authenticated: false, reason: "No token file" };
    }

    const tokens = JSON.parse(fs.readFileSync("token.json"));
    if (!tokens.access_token && !tokens.refresh_token) {
      return { authenticated: false, reason: "Invalid token format" };
    }

    return { authenticated: true, reason: "Token valid" };
  } catch (error) {
    return {
      authenticated: false,
      reason: `Error reading token: ${error.message}`,
    };
  }
};

// 1️⃣ Step 1: Redirect user to Google OAuth (unchanged)
app.get("/auth", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(authUrl);
});

// 2️⃣ Step 2: Handle OAuth redirect - redirect to React app
app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync("token.json", JSON.stringify(tokens));

    // In development, redirect to Vite dev server
    // In production, redirect to same origin (React app)
    const frontendUrl =
      process.env.NODE_ENV === "production" ? "/" : "http://localhost:5173";

    res.redirect(frontendUrl);
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px;">
          <div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #c33; margin-top: 0;">❌ Authorization Failed</h2>
            <p style="color: #666;">${error.message}</p>
            <a href="/" style="color: #0066cc; text-decoration: none; font-weight: 500;">← Try Again</a>
          </div>
        </body>
      </html>
    `);
  }
});

// 3️⃣ NEW: Check authentication status
app.get("/api/auth/status", async (req, res) => {
  try {
    const status = await checkAuthStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      authenticated: false,
      reason: "Server error checking auth status",
      error: error.message,
    });
  }
});

// 3️⃣🚫 NEW: Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  try {
    // Remove token file
    if (fs.existsSync("token.json")) {
      fs.unlinkSync("token.json");
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
});

// 4️⃣ ENHANCED: Generate fake events with categories
app.post("/api/events", async (req, res) => {
  try {
    const authStatus = checkAuthStatusSync();
    if (!authStatus.authenticated) {
      return res.status(401).json({
        error: "Not authorized. Visit /auth first.",
        authStatus,
      });
    }

    // Validate request body
    const {
      startDate,
      endDate,
      count = 5,
      userInput = "general activities",
      timezone = "Asia/Kolkata",
      earliestStartTime = 8, // Default 8 AM start time
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required",
      });
    }

    if (count < 1 || count > 30) {
      return res.status(400).json({
        error: "Count must be between 1 and 30",
      });
    }

    const tokens = JSON.parse(fs.readFileSync("token.json"));
    oAuth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Generate all event titles at once based on user input
    const eventTitles = await generateDynamicEventTitles(userInput, count);

    // Create events with durations and no overlaps
    const scheduledEvents = [];
    const createdEvents = [];

    console.log(`Creating ${count} events with optimized scheduling...`);
    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
      const eventData = eventTitles[i];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const randomDays = Math.floor(
        (Math.random() * (end - start)) / (1000 * 60 * 60 * 24),
      );
      start.setDate(start.getDate() + randomDays);
      // Set start time to user's preferred time instead of random 8-12 PM
      start.setHours(earliestStartTime, 0, 0, 0); // User's preferred start time

      // Find available time slot to avoid overlaps with user's preferred start time
      const timeSlot = findAvailableTimeSlot(
        scheduledEvents,
        start,
        eventData.duration,
        { start, end },
        timezone,
        {
          workingHours: { start: earliestStartTime, end: 1 },
          scheduling: { maxAttempts: 50 }, // Reduced from 200 to 50 for better performance
        },
      );

      const event = {
        summary: eventData.title || `Generated Event ${i + 1}`,
        description: `🤖 Generated by Funny Calendar Filler | User request: "${userInput}" | Duration: ${eventData.duration} minutes`,
        start: { dateTime: timeSlot.start.toISOString(), timeZone: timezone },
        end: { dateTime: timeSlot.end.toISOString(), timeZone: timezone },
        extendedProperties: {
          private: {
            generated_by: "funny_calendar_filler",
            user_input: userInput,
            duration: eventData.duration,
          },
        },
      };

      // Add to scheduled events to prevent overlaps
      scheduledEvents.push({
        start: timeSlot.start,
        end: timeSlot.end,
        title: event.summary,
      });

      // Create the calendar event
      createdEvents.push({
        event: event,
        originalStart: start,
        duration: eventData.duration,
      });
    }

    const schedulingTime = Date.now() - startTime;
    console.log(`Scheduling completed in ${schedulingTime}ms`);

    // Execute all event creations in parallel
    const eventPromises = createdEvents.map(
      ({ event, originalStart, duration }) => {
        // Return a promise that resolves to the calendar insertion
        return calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });
      },
    );

    // Execute all event creations in parallel
    console.log(`Creating ${count} events in parallel...`);
    const apiStartTime = Date.now();
    const eventCreationResults = await Promise.allSettled(eventPromises);
    const apiTime = Date.now() - apiStartTime;
    console.log(`Google Calendar API calls completed in ${apiTime}ms`);

    // Process results and format response
    const events = [];
    eventCreationResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const createdEvent = result.value;
        events.push({
          id: createdEvent.data.id,
          title: createdEvent.data.summary,
          start: createdEvent.data.start.dateTime,
          end: createdEvent.data.end.dateTime,
          userInput: userInput,
          duration: createdEvents[index].duration,
        });
      } else {
        console.error(`Failed to create event ${index + 1}:`, result.reason);
        // Add a failed event to track the count
        events.push({
          id: `failed-${index}`,
          title:
            createdEvents[index]?.event?.summary || `Failed Event ${index + 1}`,
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          userInput: userInput,
          duration: createdEvents[index]?.duration || 60,
          error: true,
        });
      }
    });

    res.json({
      message: "Events created successfully",
      created: events,
      total: events.length,
      userInput: userInput,
      timezone: timezone,
    });
  } catch (error) {
    console.error("Error creating events:", error);
    res.status(500).json({
      error: "Failed to create events",
      details: error.message,
    });
  }
});

// 5️⃣ NEW: Get events created by this app
app.get("/api/events/created", async (req, res) => {
  try {
    const authStatus = checkAuthStatusSync();
    if (!authStatus.authenticated) {
      return res.status(401).json({
        error: "Not authorized. Visit /auth first.",
      });
    }

    const tokens = JSON.parse(fs.readFileSync("token.json"));
    oAuth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Get events from the last 30 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 30);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    // Filter events created by this app
    const fcfEvents = response.data.items
      .filter(
        (event) =>
          event.extendedProperties?.private?.generated_by ===
          "funny_calendar_filler",
      )
      .map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        userInput:
          event.extendedProperties?.private?.user_input || "general activities",
        htmlLink: event.htmlLink,
      }));

    res.json({
      events: fcfEvents,
      total: fcfEvents.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      error: "Failed to fetch events",
      details: error.message,
    });
  }
});

// 6️⃣ NEW: Delete all events created by this app
app.delete("/api/events", async (req, res) => {
  try {
    const authStatus = checkAuthStatusSync();
    if (!authStatus.authenticated) {
      return res.status(401).json({
        error: "Not authorized. Visit /auth first.",
      });
    }

    const tokens = JSON.parse(fs.readFileSync("token.json"));
    oAuth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Get events from the last 60 days (wider range for deletion)
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 60);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 60);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    // Filter and delete events created by this app
    const fcfEvents = response.data.items.filter(
      (event) =>
        event.extendedProperties?.private?.generated_by ===
        "funny_calendar_filler",
    );

    // Delete all events in parallel
    console.log(`Deleting ${fcfEvents.length} events in parallel...`);
    const deletePromises = fcfEvents.map(async (event) => {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: event.id,
        });
        return {
          id: event.id,
          title: event.summary,
          deleted: true,
        };
      } catch (error) {
        return {
          id: event.id,
          title: event.summary,
          deleted: false,
          error: error.message,
        };
      }
    });

    // Execute all deletions in parallel
    const deletionResults = await Promise.all(deletePromises);

    const successfulDeletions = deletionResults.filter((r) => r.deleted);
    const failedDeletions = deletionResults.filter((r) => !r.deleted);

    res.json({
      message: "Event deletion completed",
      total_found: fcfEvents.length,
      successfully_deleted: successfulDeletions.length,
      failed_deletions: failedDeletions.length,
      results: deletionResults,
    });
  } catch (error) {
    console.error("Error deleting events:", error);
    res.status(500).json({
      error: "Failed to delete events",
      details: error.message,
    });
  }
});

// 7️⃣ LEGACY: Keep the old endpoint for backward compatibility
app.post("/create-events", async (req, res) => {
  // Convert old format to new format
  const { startDate, endDate, count = 5 } = req.body;

  // Forward to new endpoint
  const response = await fetch(`http://localhost:3000/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, count, category: "funny" }),
  });

  const data = await response.json();

  if (response.ok) {
    // Format response for old frontend
    res.json({
      message: data.message,
      created: data.created.map((e) => e.title),
    });
  } else {
    res.status(response.status).json(data);
  }
});

// Redirect root to React app
app.get("/", (req, res) => {
  // In development, redirect to Vite dev server
  // In production, serve React build files
  if (process.env.NODE_ENV !== "production") {
    res.redirect("http://localhost:5173");
  } else {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  }
});

app.listen(3000, () => {
  console.log(
    "🚀 Enhanced Funny Calendar Filler running on http://localhost:3000",
  );
  console.log("📆 Features:");
  console.log("  • AI-powered event title generation");
  console.log("  • User-defined event types (no fixed categories)");
  console.log("  • Auth status checking with user info");
  console.log("  • Event listing and deletion");
  console.log("  • Timezone support");
  console.log("  • Enhanced error handling");
});
