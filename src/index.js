import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";

dotenv.config();

// Check environment variables
if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing in .env");
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is missing in .env");
}

if (!process.env.GOOGLE_SHEETS_ID) {
  throw new Error("GOOGLE_SHEETS_ID is missing in .env");
}

// Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// ============================================
// USER MEMORY
// ============================================

async function getUserProfile(userId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return null;
    }

    const headers = rows[0];

    const users = rows.slice(1).map((row) => {
      return Object.fromEntries(
        headers.map((header, index) => [header, row[index] || ""])
      );
    });

    const user = users.find(
      (profile) => String(profile.user_id) === String(userId)
    );

    return user || null;
  } catch (error) {
    console.error(
      "❌ Error reading user profile:",
      error.response?.data?.error?.message || error.message
    );

    return null;
  }
}

// ============================================
// CREATE USER PROFILE
// ============================================

async function createUserProfile(userData) {
  try {
    const now = new Date().toISOString();

    const row = [
      userData.user_id || "",
      userData.username || "",
      userData.first_name || "",
      userData.goal || "",
      userData.fitness_level || "",
      userData.weight_kg || "",
      userData.height_cm || "",
      userData.conversation_history || "",
      now,
      now,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    console.log("✅ User profile created:", userData.user_id);

    return {
      ...userData,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error(
      "❌ Error creating user profile:",
      error.response?.data?.error?.message || error.message
    );

    return null;
  }
}

// ==========================================
// SAVE CONVERSATION HISTORY
// ==========================================

async function saveConversationHistory(userId, history) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log("ℹ️ No users found in Google Sheets.");
      return false;
    }

    const headers = rows[0];

    const userRowIndex = rows.slice(1).findIndex(
      (row) => String(row[0]) === String(userId)
    );

    if (userRowIndex === -1) {
      console.log("ℹ️ User not found for history:", userId);
      return false;
    }

    // Google Sheets row number.
    // +2 because row 1 contains headers.
    const sheetRow = userRowIndex + 2;

    const historyJson = JSON.stringify(history);

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Users!H${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[historyJson]],
      },
    });

    console.log("💾 Conversation history saved:", userId);

    return true;
  } catch (error) {
    console.error(
      "❌ Error saving conversation history:",
      error.response?.data?.error?.message || error.message
    );

    return false;
  }
}

// ==================================================
// UPDATE USER GOAL
// ==================================================

async function updateUserGoal(userId, goal) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: "Users!A:J",
        });

        const rows = response.data.values || [];

        if (rows.length === 0) {
            console.log("⚠️ No users found in Google Sheets.");
            return false;
        }

        const userRowIndex = rows.slice(1).findIndex(
            (row) => String(row[0]) === String(userId)
        );

        if (userRowIndex === -1) {
            console.log("⚠️ User not found for goal:", userId);
            return false;
        }

        // Google Sheets row number.
        // +2 because row 1 contains headers.
        const sheetRow = userRowIndex + 2;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: `Users!D${sheetRow}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[goal]],
            },
        });

        console.log("🎯 User goal saved:", userId, "→", goal);

        return true;
    } catch (error) {
        console.error(
            "❌ Error saving user goal:",
            error.response?.data?.error?.message || error.message
        );

        return false;
    }
}

// ==========================================
// UPDATE USER FITNESS LEVEL
// ==========================================

async function updateUserFitnessLevel(userId, fitnessLevel) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: "Users!A:J",
        });

        const rows = response.data.values || [];

        if (rows.length === 0) {
            console.log("⚠️ No users found in Google Sheets.");
            return false;
        }

        const userRowIndex = rows.slice(1).findIndex(
            (row) => String(row[0]) === String(userId)
        );

        if (userRowIndex === -1) {
            console.log("⚠️ User not found for fitness level:", userId);
            return false;
        }

        // Google Sheets row number.
        // +2 because row 1 contains headers.
        const sheetRow = userRowIndex + 2;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: `Users!E${sheetRow}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[fitnessLevel]],
            },
        });

        console.log(
            "🏋️ Fitness level saved:",
            userId,
            "→",
            fitnessLevel
        );

        return true;
    } catch (error) {
        console.error(
            "❌ Error saving fitness level:",
            error.response?.data?.error?.message || error.message
        );

        return false;
    }
}

// =====================================================
// UPDATE USER WEIGHT
// =====================================================

async function updateUserWeight(userId, weightKg) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log("⚠️ No users found in Google Sheets.");
      return false;
    }

    const userRowIndex = rows.slice(1).findIndex(
      (row) => String(row[0]) === String(userId)
    );

    if (userRowIndex === -1) {
      console.log("⚠️ User not found for weight:", userId);
      return false;
    }

    // Google Sheets row number.
    // +2 because row 1 contains headers.
    const sheetRow = userRowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Users!F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[weightKg]],
      },
    });

    console.log(
      "⚖️ User weight saved:",
      userId,
      "→",
      weightKg,
      "kg"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error saving user weight:",
      error.response?.data?.error?.message || error.message
    );

    return false;
  }
}

// ============================================
// EXTRACT USER HEIGHT
// ============================================

function extractHeight(userMessage) {
  const message = userMessage.toLowerCase().trim();

  const heightMatch = message.match(
    /(?:my\s*height\s*(?:is|:)?\s*|height\s*(?:is|:)?\s*|i\s*am\s*)(\d+(?:[.,]\d+)?)\s*(?:cm|centimeters?|centimetres?)?/i
  );

  if (heightMatch) {
    const height = parseFloat(
      heightMatch[1].replace(",", ".")
    );

    if (height >= 100 && height <= 250) {
      return height;
    }
  }

  return null;
}

// ============================================
// UPDATE USER HEIGHT
// ============================================

async function updateUserHeight(userId, heightCm) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log("⚠️ No users found in Google Sheets.");
      return false;
    }

    const userRowIndex = rows.slice(1).findIndex(
      (row) => String(row[0]) === String(userId)
    );

    if (userRowIndex === -1) {
      console.log("⚠️ User not found for height:", userId);
      return false;
    }

    // Google Sheets row number.
    // +2 because row 1 contains headers.
    const sheetRow = userRowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Users!G${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[heightCm]],
      },
    });

    console.log(
      "📏 User height saved:",
      userId,
      "→",
      heightCm,
      "cm"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error saving user height:",
      error.response?.data?.error?.message || error.message
    );

    return false;
  }
}

// ============================================
// CREATE WORKOUT
// ============================================

async function createWorkout(workoutData) {
    try {
        const now = new Date().toISOString();

        const workoutId =
            workoutData.workout_id || `W-${Date.now()}`;

        const workoutDate =
            workoutData.workout_date || now.slice(0, 10);

        const row = [
            workoutId,
            workoutData.user_id || "",
            workoutDate,
            workoutData.workout_type || "",
            workoutData.duration_min ?? "",
            workoutData.completed ?? "",
            workoutData.notes || "",
            now
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: "Workouts!A:H",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [row]
            }
        });

        console.log(
            "✅ Workout saved:",
            workoutId,
            "for user:",
            workoutData.user_id
        );

        return workoutId;

    } catch (error) {
        console.error(
            "❌ Error saving workout:",
            error.response?.data?.error?.message || error.message
        );

        return false;
    }
}

// ============================================
// EXTRACT COMPLETED WORKOUT
// ============================================

function extractCompletedWorkout(userMessage) {
    const message = userMessage.toLowerCase().trim();

    const completionKeywords = [
        "completed",
        "finished",
        "did my workout",
        "finished my workout",
        "completed my workout",
        "workout done",
        "training completed",
        "finished training"
    ];

    const isCompleted = completionKeywords.some(keyword =>
        message.includes(keyword)
    );

    if (!isCompleted) {
        return null;
    }

    let workoutType = "general";

    if (
        message.includes("endurance") ||
        message.includes("cardio") ||
        message.includes("running") ||
        message.includes("cycling") ||
        message.includes("rowing")
    ) {
        workoutType = "endurance";
    } else if (
        message.includes("strength") ||
        message.includes("weights") ||
        message.includes("weight training")
    ) {
        workoutType = "strength";
    } else if (
        message.includes("mobility") ||
        message.includes("stretching") ||
        message.includes("recovery")
    ) {
        workoutType = "mobility";
    }

    const durationMatch = message.match(
        /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min)\b/i
    );

    const durationMin = durationMatch
        ? Number(durationMatch[1])
        : null;

    return {
        workout_type: workoutType,
        duration_min: durationMin,
        completed: true,
        notes: userMessage
    };
}

// ==================================================
// EXTRACT FITNESS GOAL
// ==================================================

function extractFitnessGoal(userMessage) {
    const message = userMessage.toLowerCase().trim();

    if (
        message.includes("build muscle") ||
        message.includes("gain muscle") ||
        message.includes("build more muscle") ||
        message.includes("put on muscle") ||
        message.includes("muscle gain")
    ) {
        return "build muscle";
    }

    if (
        message.includes("lose fat") ||
        message.includes("lose weight") ||
        message.includes("burn fat") ||
        message.includes("fat loss") ||
        message.includes("weight loss")
    ) {
        return "lose fat";
    }

    if (
        message.includes("get stronger") ||
        message.includes("be stronger") ||
        message.includes("increase strength") ||
        message.includes("build strength")
    ) {
        return "get stronger";
    }

    if (
        message.includes("improve endurance") ||
        message.includes("better endurance") ||
        message.includes("increase endurance") ||
        message.includes("improve stamina") ||
        message.includes("better stamina")
    ) {
        return "improve endurance";
    }

    if (
        message.includes("general fitness") ||
        message.includes("get fit") ||
        message.includes("stay fit") ||
        message.includes("improve fitness") ||
        message.includes("overall fitness")
    ) {
        return "general fitness";
    }

    return null;
}

// ==========================================
// EXTRACT FITNESS LEVEL
// ==========================================

function extractFitnessLevel(userMessage) {
    const message = userMessage.toLowerCase().trim();

    if (
        message.includes("beginner") ||
        message.includes("new to training") ||
        message.includes("just started training") ||
        message.includes("starting to train")
    ) {
        return "beginner";
    }

    if (
        message.includes("intermediate") ||
        message.includes("moderately experienced") ||
        message.includes("training for a few years") ||
        message.includes("trained for a few years")
    ) {
        return "intermediate";
    }

    if (
        message.includes("advanced") ||
        message.includes("advanced athlete") ||
        message.includes("experienced athlete") ||
        message.includes("highly experienced") ||
        message.includes("training for many years")
    ) {
        return "advanced";
    }

    return null;
}

// =================================================
// EXTRACT USER WEIGHT
// =================================================

function extractWeight(userMessage) {
  const message = userMessage.toLowerCase().trim();

  const weightMatch = message.match(
    /(?:i\s*(?:weigh|weight)\s*(?:is|:)?\s*|my\s*weight\s*(?:is|:)?\s*)(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilograms?)?/i
  );

  if (weightMatch) {
    const weight = parseFloat(weightMatch[1].replace(",", "."));

    if (weight >= 30 && weight <= 300) {
      return weight;
    }
  }

  return null;
}

// ==============================================
// LOAD CONVERSATION HISTORY
// ==============================================

async function loadConversationHistory(userId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Users!A:J",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log("ℹ️ No users found in Google Sheets.");
      return [];
    }

    const headers = rows[0];

    const users = rows.slice(1).map((row) => {
      return Object.fromEntries(
        headers.map((header, index) => [header, row[index] || ""])
      );
    });

    const user = users.find(
      (profile) => String(profile.user_id) === String(userId)
    );

    if (!user) {
      console.log("ℹ️ User not found for history:", userId);
      return [];
    }

    if (!user.conversation_history) {
      console.log("ℹ️ No conversation history for user:", userId);
      return [];
    }

    try {
      const history = JSON.parse(user.conversation_history);

      console.log("💾 Conversation history loaded:", userId);
      console.log("🧠 History messages:", history.length);

      return Array.isArray(history) ? history : [];
    } catch (parseError) {
      console.error(
        "❌ Error parsing conversation history:",
        parseError.message
      );

      return [];
    }
  } catch (error) {
    console.error(
      "❌ Error loading conversation history:",
      error.response?.data?.error?.message || error.message
    );

    return [];
  }
}

// ============================================
// LOAD WORKOUT HISTORY
// ============================================

async function getWorkoutHistory(userId) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: "Workouts!A:H",
        });

        const rows = response.data.values || [];

        if (rows.length <= 1) {
            console.log("🏋️ No workout history found.");
            return [];
        }

        const headers = rows[0];

        const workouts = rows
            .slice(1)
            .map((row) => {
                return Object.fromEntries(
                    headers.map((header, index) => [
                        header,
                        row[index] || ""
                    ])
                );
            })
            .filter(
                (workout) =>
                    String(workout.user_id) === String(userId)
            );

        console.log(
            "🏋️ Workout history loaded:",
            userId,
            workouts.length
        );

        return workouts;

    } catch (error) {
        console.error(
            "❌ Error loading workout history:",
            error.response?.data?.error?.message || error.message
        );

        return [];
    }
}

// ============================================
// WORKOUT ANALYTICS
// ============================================

async function getWorkoutAnalytics(userId) {
    try {
        const workouts = await getWorkoutHistory(userId);

        if (workouts.length === 0) {
            console.log("📊 No workout data for analytics:", userId);

            return {
                total_workouts: 0,
                completed_workouts: 0,
                total_duration_min: 0,
                average_duration_min: 0,
                workout_types: {},
                last_workout: null
            };
        }

        const completedWorkouts = workouts.filter(
            (workout) =>
                workout.completed === true ||
                String(workout.completed).toLowerCase() === "true"
        );

        const totalDuration = completedWorkouts.reduce(
            (total, workout) =>
                total + (parseFloat(workout.duration_min) || 0),
            0
        );

        const averageDuration =
            completedWorkouts.length > 0
                ? Math.round(totalDuration / completedWorkouts.length)
                : 0;

        const workoutTypes = {};

        completedWorkouts.forEach((workout) => {
            const type = workout.workout_type || "unknown";

            workoutTypes[type] = (workoutTypes[type] || 0) + 1;
        });

        const sortedWorkouts = [...completedWorkouts].sort(
            (a, b) =>
                new Date(b.workout_date) - new Date(a.workout_date)
        );

        const lastWorkout =
            sortedWorkouts.length > 0
                ? sortedWorkouts[0]
                : null;

        const analytics = {
            total_workouts: workouts.length,
            completed_workouts: completedWorkouts.length,
            total_duration_min: totalDuration,
            average_duration_min: averageDuration,
            workout_types: workoutTypes,
            last_workout: lastWorkout
        };

        console.log(
            "📊 Workout analytics:",
            userId,
            analytics
        );

        return analytics;

    } catch (error) {
        console.error(
            "❌ Error calculating workout analytics:",
            error.response?.data?.error?.message || error.message
        );

        return {
            total_workouts: 0,
            completed_workouts: 0,
            total_duration_min: 0,
            average_duration_min: 0,
            workout_types: {},
            last_workout: null
        };
    }
}

// ============================================================
// WORKOUT PROGRESS TRACKING
// ============================================================

async function getWorkoutProgress(userId) {
  try {
    const workouts = await getWorkoutHistory(userId);

    const completedWorkouts = workouts.filter(
      (workout) =>
        workout.completed === true ||
        String(workout.completed).toLowerCase() === "true"
    );

    if (completedWorkouts.length === 0) {
      console.log("📊 No completed workouts for progress tracking:", userId);

      return {
        total_completed_workouts: 0,
        recent_workouts: 0,
        previous_workouts: 0,
        recent_duration_min: 0,
        previous_duration_min: 0,
        duration_change_percent: 0,
        average_duration_recent_min: 0,
        average_duration_previous_min: 0,
        trend: "no_data",
      };
    }

    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) =>
        new Date(a.workout_date) - new Date(b.workout_date)
    );

    const splitIndex = Math.max(
      0,
      sortedWorkouts.length - 3
    );

    const previousWorkouts = sortedWorkouts.slice(0, splitIndex);
    const recentWorkouts = sortedWorkouts.slice(splitIndex);

    const calculateDuration = (workoutList) =>
      workoutList.reduce(
        (total, workout) =>
          total + (parseFloat(workout.duration_min) || 0),
        0
      );

    const recentDuration = calculateDuration(recentWorkouts);
    const previousDuration = calculateDuration(previousWorkouts);

    const recentAverage =
      recentWorkouts.length > 0
        ? Math.round(recentDuration / recentWorkouts.length)
        : 0;

    const previousAverage =
      previousWorkouts.length > 0
        ? Math.round(previousDuration / previousWorkouts.length)
        : 0;

    const durationChangePercent =
      previousDuration > 0
        ? Math.round(
            ((recentDuration - previousDuration) /
              previousDuration) *
              100
          )
        : 0;

    let trend = "stable";

    if (previousWorkouts.length === 0) {
      trend = "new";
    } else if (durationChangePercent >= 10) {
      trend = "improving";
    } else if (durationChangePercent <= -10) {
      trend = "declining";
    }

    const progress = {
      total_completed_workouts: completedWorkouts.length,

      recent_workouts: recentWorkouts.length,
      previous_workouts: previousWorkouts.length,

      recent_duration_min: recentDuration,
      previous_duration_min: previousDuration,

      duration_change_percent: durationChangePercent,

      average_duration_recent_min: recentAverage,
      average_duration_previous_min: previousAverage,

      trend,
    };

    console.log(
      "📈 Workout progress:",
      userId,
      progress
    );

    return progress;
  } catch (error) {
    console.error(
      "❌ Error calculating workout progress:",
      error.response?.data?.error?.message || error.message
    );

    return {
      total_completed_workouts: 0,
      recent_workouts: 0,
      previous_workouts: 0,
      recent_duration_min: 0,
      previous_duration_min: 0,
      duration_change_percent: 0,
      average_duration_recent_min: 0,
      average_duration_previous_min: 0,
      trend: "error",
    };
  }
}

// Test Google Sheets connection
async function testGoogleSheetsConnection() {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    fields: "properties.title,sheets.properties.title",
  });

  console.log("✅ Google Sheets connected:", response.data.properties.title);
  console.log(
    "📊 Sheets:",
    response.data.sheets.map(sheet => sheet.properties.title)
  );
}

// Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// AI WORKOUT COACH SYSTEM INSTRUCTION
// =====================================================

const SYSTEM_INSTRUCTION = `
You are AI Workout Coach, a professional personal fitness trainer AI.

When the user asks about training progress, workout progress,
improvement, performance trends, or what they should do next,
use the WORKOUT PROGRESS data and WORKOUT HISTORY provided in the user context.

Provide a concise personalized progress report that includes:
1. Overall training trend.
2. Recent training volume and duration.
3. Comparison with previous training.
4. One or two practical recommendations for the next workouts.

Do not simply repeat raw numbers.
Interpret the data in plain, encouraging language.
If there is not enough historical data for a meaningful comparison,
clearly say that more workouts are needed before identifying a reliable trend.

Your job is to help users with:
- workout planning
- strength training
- cardio and conditioning
- mobility and recovery
- general nutrition guidance
- motivation and training consistency

Rules:
- Be practical, concise, friendly and energetic.
- Adapt your answers to the user's goals and fitness level when known.
- Remember information from the current conversation.
- If the user tells you their fitness goal, use it in later answers.
- Do not diagnose medical conditions.
- Do not pretend to be a doctor.
- If a question requires medical diagnosis, recommend consulting an appropriate healthcare professional.
- Always answer in the same language as the user's message.
`;

// =====================================================
// TEMPORARY USER MEMORY
// =====================================================

// Memory is stored separately for every Telegram user.
const userMemory = new Map();

// Maximum number of messages kept for each user.
const MAX_HISTORY = 10;

// =====================================================
// /start COMMAND
// =====================================================

bot.start(async (ctx) => {
  // Create memory for this user if it does not exist yet.
  if (!userMemory.has(ctx.from.id)) {
    userMemory.set(ctx.from.id, []);
  }

  await ctx.reply(
    "💪 Welcome to AI Workout Coach!\n\n" +
      "I'm your personal AI workout assistant.\n\n" +
      "Tell me your fitness goal and I'll remember it during our conversation. 🧠"
  );
});

// =====================================================
// NORMAL TEXT MESSAGES
// =====================================================

async function sendLongMessage(ctx, text) {
  const MAX_LENGTH = 4000;

  for (let i = 0; i < text.length; i += MAX_LENGTH) {
    const chunk = text.slice(i, i + MAX_LENGTH);
    await ctx.reply(chunk);
  }
}

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;

  // Load persistent user profile from Google Sheets.
  let userProfile = await getUserProfile(userId);

  // Create a new profile if this is a new user.
  if (!userProfile) {
    userProfile = await createUserProfile({
      user_id: String(userId),
      username: ctx.from.username || "",
      first_name: ctx.from.first_name || "",
      goal: "",
      fitness_level: "",
      weight_kg: "",
      height_cm: "",
      conversation_history: "",
    });
  }

  console.log(
    userProfile
      ? "💾 User profile loaded: " + userProfile.user_id
      : "⚠️ User profile not available"
  );

  // Detect and save user's fitness goal.
  const detectedGoal = extractFitnessGoal(userMessage);

  if (detectedGoal) {
      console.log("🎯 Detected fitness goal:", detectedGoal);

      await updateUserGoal(userId, detectedGoal);

      // Keep the current user profile synchronized.
      userProfile.goal = detectedGoal;
  }

  // Detect and save user's fitness level.
const detectedFitnessLevel = extractFitnessLevel(userMessage);

if (detectedFitnessLevel) {
  console.log("💪 Detected fitness level:", detectedFitnessLevel);

  await updateUserFitnessLevel(userId, detectedFitnessLevel);

  // Keep the current user profile synchronized.
  userProfile.fitness_level = detectedFitnessLevel;
}

// Detect and save user's weight.
const detectedWeight = extractWeight(userMessage);

if (detectedWeight !== null) {
    console.log("⚖️ Detected user weight:", detectedWeight);

    await updateUserWeight(userId, detectedWeight);

    // Keep the current user profile synchronized.
    userProfile.weight_kg = detectedWeight;
}

const detectedHeight = extractHeight(userMessage);

if (detectedHeight) {
  console.log("📏 Detected user height:", detectedHeight);

  await updateUserHeight(userId, detectedHeight);

  // Keep the current user profile synchronized.
  userProfile.height_cm = detectedHeight;
}

// Detect and save completed workout.
const detectedWorkout = extractCompletedWorkout(userMessage);

if (detectedWorkout) {
    console.log("🏋️ Completed workout detected:", detectedWorkout);

    await createWorkout({
        user_id: String(userId),
        workout_date: new Date().toISOString().slice(0, 10),
        workout_type: detectedWorkout.workout_type,
        duration_min: detectedWorkout.duration_min,
        completed: detectedWorkout.completed,
        notes: detectedWorkout.notes
    });
}

  // Get existing memory or create a new one.
  // Load persistent conversation history from Google Sheets.
  let history = await loadConversationHistory(userId);

  // Restore history into in-memory memory.
  userMemory.set(userId, history);

  console.log("🧠 Persistent memory restored:", userId);

  try {
    // Add user's new message to memory.
    history.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Keep only the latest messages.
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Load recent workout history from Google Sheets.
const workoutHistory = await getWorkoutHistory(userId);

// Calculate workout progress from recent training history.
const workoutProgress = await getWorkoutProgress(userId);

console.log("📈 Workout progress loaded:", userId, workoutProgress);

// Build a compact workout history context for Gemini.
const workoutHistoryContext = workoutHistory
    .slice(-10)
    .map((workout, index) => {
        return [
            `${index + 1}. Date: ${workout.workout_date}`,
            `Type: ${workout.workout_type}`,
            `Duration: ${workout.duration_min || "not set"} min`,
            `Completed: ${workout.completed}`,
            `Notes: ${workout.notes || "none"}`
        ].join(" | ");
    })
    .join("\n");
    
    // Build structured user profile context for Gemini.
    const userProfileContext = `
    USER PROFILE:
    Goal: ${userProfile?.goal || "not set"}
    Fitness level: ${userProfile?.fitness_level || "not set"}
    Weight: ${userProfile?.weight_kg || "not set"} kg
    Height: ${userProfile?.height_cm || "not set"} cm
    Workout plan: ${userProfile?.workout_plan || "not set"}

    WORKOUT HISTORY:
    ${workoutHistoryContext || "No workout history available."}

    WORKOUT PROGRESS:
    Total completed workouts: ${workoutProgress.total_completed_workouts}
    Recent workouts: ${workoutProgress.recent_workouts}
    Previous workouts: ${workoutProgress.previous_workouts}
    Recent duration: ${workoutProgress.recent_duration_min} min
    Previous duration: ${workoutProgress.previous_duration_min} min
    Duration change: ${workoutProgress.duration_change_percent}%
    Average duration (recent): ${workoutProgress.average_duration_recent_min} min
    Average duration (previous): ${workoutProgress.average_duration_previous_min} min
    Training trend: ${workoutProgress.trend}
    `;

    // Send conversation history to Gemini.
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: history,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${userProfileContext}`,
        temperature: 0.7,
        maxOutputTokens: 6000,
      },
    });

    const answer = response.text;

    // Add Gemini response to memory.
    history.push({
      role: "model",
      parts: [{ text: answer }],
    });

    // Keep memory within the limit.
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Save updated memory.
    userMemory.set(userId, history);

    // Save conversation history to Google Sheets.
    await saveConversationHistory(userId, history);

    // Send AI response to Telegram.
    await sendLongMessage(ctx, answer);
  } catch (error) {
    console.error("Gemini error:", error);

    // Remove the user's message if Gemini failed.
    history = history.filter(
      (message) =>
        !(
          message.role === "user" &&
          message.parts?.[0]?.text === userMessage
        )
    );

    userMemory.set(userId, history);

    await ctx.reply(
      "⚠️ Sorry, I couldn't process your request right now. Please try again."
    );
  }
});

// =====================================================
// START BOT
// =====================================================

testGoogleSheetsConnection().catch(error => {
  console.error("❌ Google Sheets connection failed:", error.message);
});


bot.launch();

console.log("🤖 AI Workout Coach is running...");