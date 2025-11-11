// AI Prompts Configuration
// This file contains all LLM prompts used by the application
// Separating prompts makes the code cleaner and easier to maintain

export const EVENT_GENERATION_PROMPT = (eventCount, userInput) => `
You are an intelligent calendar event generator. Based on the user's input "${userInput}", generate ${eventCount} diverse and realistic event titles that would commonly appear in a calendar.

Requirements:
1. Generate exactly ${eventCount} different event titles
2. Events should be diverse and realistic for a calendar
3. Each event should have an appropriate duration (30 minutes to 4 hours)
4. Consider common daily activities, meetings, tasks, and personal events
5. Make events specific and actionable (e.g., "Team Standup Meeting" instead of just "Meeting")
6. Include a mix of work, personal, and academic events if applicable
7. Response must be valid JSON format only

Return the response in this exact JSON format:
{
  "events": [
    {"title": "Event Title 1", "duration": 60},
    {"title": "Event Title 2", "duration": 30},
    {"title": "Event Title 3", "duration": 90}
  ]
}

Duration guidelines:
- Quick tasks: 30-45 minutes
- Standard meetings: 60 minutes
- Long meetings/deep work: 90-180 minutes
- Personal activities: 60-120 minutes
- Exercise: 60-90 minutes
- Study sessions: 90-120 minutes
- Travel: 30-180 minutes
- Appointments: 30-90 minutes
- Hobbies: 60-180 minutes
- Fitness activities: 45-90 minutes
- Professional development: 60-120 minutes

Note: Events will be scheduled with optimized gaps between them (15 minutes to 1 hour) based on user's preferred start time.
`;

export const EVENT_TYPE_EXAMPLES = {
  gym: "Gym Session - 60 min, Personal Training - 90 min, Cardio Workout - 45 min, Weight Training - 75 min, Yoga Class - 60 min",
  dental:
    "Dental Check-up - 45 min, Teeth Cleaning - 30 min, Orthodontist Visit - 60 min, Teeth Whitening - 30 min",
  medical:
    "Doctor Appointment - 45 min, Blood Test - 15 min, Specialist Consultation - 60 min, Physical Therapy - 60 min",
  work: "Team Meeting - 60 min, 1-on-1 with Manager - 30 min, Client Call - 45 min, Project Review - 90 min, Interview - 60 min",
  study:
    "Study Session - 90 min, Research Work - 120 min, Lecture - 90 min, Group Study - 75 min, Exam Preparation - 120 min",
  social:
    "Coffee Meeting - 60 min, Family Gathering - 90 min, Birthday Party - 180 min, Brunch with Friends - 90 min",
  hobby:
    "Photography Walk - 90 min, Reading Time - 60 min, Art Class - 120 min, Music Practice - 60 min, Gaming Session - 90 min",
  quick:
    "Quick Call - 15 min, Email Check - 10 min, Briefing - 30 min, Status Update - 15 min, Decision Making - 20 min",
};

export const FALLBACK_EVENTS = {
  work: [
    { title: "Team Standup Meeting", duration: 30 },
    { title: "Code Review Session", duration: 60 },
    { title: "Project Planning", duration: 90 },
    { title: "Client Call", duration: 45 },
    { title: "Documentation Writing", duration: 60 },
    { title: "Team Retrospective", duration: 60 },
    { title: "Sprint Planning", duration: 120 },
    { title: "One-on-One Meeting", duration: 30 },
    { title: "Team Sync", duration: 30 },
    { title: "Status Update Meeting", duration: 30 },
  ],
  personal: [
    { title: "Gym Workout", duration: 60 },
    { title: "Grocery Shopping", duration: 45 },
    { title: "Reading Time", duration: 60 },
    { title: "Meal Prep", duration: 45 },
    { title: "Walk in the Park", duration: 30 },
    { title: "Meditation Session", duration: 20 },
    { title: "Call with Family", duration: 60 },
    { title: "Hobby Time", duration: 90 },
    { title: "Coffee with Friends", duration: 60 },
    { title: "Movie Night", duration: 120 },
  ],
  academic: [
    { title: "Study Session", duration: 90 },
    { title: "Lecture Review", duration: 60 },
    { title: "Assignment Work", duration: 120 },
    { title: "Research Reading", duration: 75 },
    { title: "Online Course", duration: 60 },
    { title: "Group Project Meeting", duration: 90 },
    { title: "Exam Preparation", duration: 180 },
    { title: "Note Review", duration: 45 },
    { title: "Library Study", duration: 120 },
    { title: "Lab Work", duration: 90 },
  ],
};

export const DURATION_GUIDELINES = {
  physical_activities: { min: 30, max: 180, typical: [60, 90, 120] },
  professional_meetings: { min: 15, max: 120, typical: [30, 45, 60, 90] },
  learning_activities: { min: 45, max: 180, typical: [60, 90, 120] },
  social_activities: { min: 30, max: 240, typical: [60, 90, 120, 180] },
  medical_appointments: { min: 15, max: 90, typical: [30, 45, 60] },
  quick_tasks: { min: 10, max: 30, typical: [15, 20] },
};

export const SCHEDULING_CONSTRAINTS = {
  workingHours: {
    start: 8, // 8 AM
    end: 21, // 9 PM
    weekend: true, // Allow events on weekends
  },
  buffers: {
    betweenEvents: 5, // 5 minutes between events
    beforeWork: 0, // Can start at 8 AM sharp
    afterWork: 0, // Can end at 9 PM sharp
  },
  scheduling: {
    searchIncrement: 15, // Check every 15 minutes
    maxAttempts: 100,
    preferredDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
};
