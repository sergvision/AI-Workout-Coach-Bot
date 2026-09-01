# AI Workout Coach Bot

AI-powered personal fitness assistant for Telegram with persistent user memory, workout history, workout analytics, progress tracking, and personalized AI recommendations.

## Project Overview

AI Workout Coach Bot is a Telegram-based AI fitness assistant designed to provide personalized workout guidance and maintain long-term context about the user.

The system combines conversational AI with persistent user data stored in Google Sheets. It can remember the user's fitness profile, store completed workouts, analyze training history, identify progress trends, and generate personalized recommendations.

## Key Features

- 💬 AI fitness coaching through Telegram
- 🧠 Persistent user memory
- 👤 Personal fitness profile
- 🏋️ Workout history tracking
- 📊 Workout analytics
- 📈 Training progress tracking
- 🤖 AI-generated personalized recommendations
- 🗂️ Persistent conversation history
- 📚 Google Sheets as a lightweight data layer
- 🔄 Context-aware responses based on previous activity

## How It Works

The user communicates with the AI Workout Coach through Telegram.

The system then:

1. Identifies the user.
2. Loads the user's persistent profile.
3. Loads previous conversation history.
4. Loads recent workout history.
5. Calculates workout analytics and progress.
6. Builds a structured context for the AI model.
7. Sends the context and conversation to Gemini.
8. Generates a personalized response.
9. Stores the updated conversation history and user data.

## Architecture

```text
Telegram User
      │
      ▼
Telegram Bot
      │
      ▼
Node.js Application
      │
      ├──────────────► Google Sheets
      │                    │
      │                    ├── Users
      │                    └── Workouts
      │
      ▼
Persistent User Memory
      │
      ▼
Workout History
      │
      ▼
Workout Analytics
      │
      ▼
Progress Tracking
      │
      ▼
Structured AI Context
      │
      ▼
Google Gemini
      │
      ▼
Personalized AI Response
      │
      ▼
Telegram
```

## Persistent User Memory
The system maintains a persistent user profile including:

- User ID
- Username
- Fitness goal
- Fitness level
- Weight
- Height
- Workout plan
- Conversation history

This allows the assistant to maintain continuity between conversations.

For example:

> "I remember your goal is fat loss. Let's adjust your training plan."

## Workout Tracking

Completed workouts are stored in Google Sheets and linked to the user's ID.

Each workout can contain:

- Workout ID
- User ID
- Workout date
- Workout type
- Duration
- Completion status
- Notes
- Creation timestamp

This creates a persistent training history that can be analyzed over time.

## Workout Analytics

The system calculates training statistics such as:

- Total workouts
- Completed workouts
- Total training duration
- Average workout duration
- Workout type distribution
- Most recent workout

Example:

```text
Total workouts: 3
Completed workouts: 3
Total duration: 170 minutes
Average duration: 57 minutes
```

## Workout Progress Tracking

The Progress Tracking module compares recent training activity with a previous training period.

It evaluates:

- Recent workout volume
- Previous workout volume
- Average session duration
- Change in training duration
- Training trend

Possible training trends include:
```
new
improving
stable
declining
no_data
error
```

Example test result:

Previous training: 105 minutes
Recent training:   170 minutes
Change:            +62%
Trend:             improving

The AI then interprets these metrics and converts them into a natural-language progress report.

## AI Personalization

Gemini receives structured information about the user before generating a response.

The AI context includes:

- User profile
- Workout history
- Workout analytics
- Workout progress
- Conversation history

This allows the assistant to generate responses based on the user's actual training context rather than generic fitness advice.

## Example User Scenarios

### Workout History

User:

> What was my last workout?

The AI returns the user's most recent recorded workout, including date, type, duration, completion status, and notes.

### Progress Tracking

User:

> How is my training progress?

The AI can generate a personalized Training Progress Report including:

- Overall training trend
- Recent training volume
- Comparison with previous training
- Practical recommendations

### Next Workout Recommendation

User:

> What should I do next?

The AI uses the user's recent workout and training context to recommend an appropriate next session.

## Technology Stack

- Node.js
- JavaScript
- Telegram Bot API
- Google Gemini API
- Google Sheets API
- Google Cloud
- dotenv
- Telegraf

## Data Layer

Google Sheets is used as a lightweight persistent storage layer.

### Users

Stores persistent user profiles and conversation history.

### Workouts

Stores completed workout records used for analytics and progress tracking.

## Project Structure

```text
AI-Workout-Coach-Bot/
│
├── src/
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
└── README.md

## Validation & Testing

The system has been tested through real Telegram interactions and Google Sheets data.

Validated capabilities include:

- ✅ User profile persistence
- ✅ Conversation memory
- ✅ Workout history retrieval
- ✅ Workout analytics
- ✅ Progress tracking
- ✅ Previous vs. recent training comparison
- ✅ AI progress interpretation
- ✅ Personalized workout recommendations
- ✅ Telegram response delivery

## Example Progress Test

A controlled test using six workout records produced:

```text
Previous period: 105 minutes
Recent period:   170 minutes
Duration change: +62%
Training trend:  improving
```

The AI correctly interpreted the result as measurable training improvement and generated personalized recommendations.

## Personal AI Ecosystem

This project is part of a broader AI ecosystem focused on fitness, health, travel, and digital innovation.

The ecosystem combines practical AI applications, automation, web technologies, and knowledge-based digital products.

🌐 https://www.healthsportvoyageai.com

## Future Improvements

Planned improvements include:

- Web-based fitness dashboard
- Advanced workout analytics
- Progress charts and visualizations
- More detailed fitness metrics
- Additional AI coaching capabilities
- Integration with external fitness platforms
- Multi-user production deployment

## License

This project is licensed under the MIT License.