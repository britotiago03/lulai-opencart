 This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 2. file structure for Chatbot creation & configuration
```
chatbot-platform/
  └── src/
      ├── app/
      │   ├── dashboard/
      │   │   └── chatbots/              # Chatbot management routes
      │   │       ├── page.tsx           # List all chatbots
      │   │       ├── create/
      │   │       │   └── page.tsx       # Create new chatbot
      │   │       ├── [id]/
      │   │       │   ├── page.tsx       # View/Edit specific chatbot
      │   │       │   └── settings/
      │   │       │       └── page.tsx   # Chatbot settings
      │   │       └── templates/
      │   │           └── page.tsx       # Predefined templates
      │   └── api/
      │       └── chatbots/              # API routes for chatbots
      │           ├── route.ts           # GET/POST chatbots
      │           ├── [id]/
      │           │   └── route.ts       # GET/PUT/DELETE specific chatbot
      │           └── templates/
      │               └── route.ts       # GET predefined templates
      ├── components/
      │   └── chatbots/                  # Reusable chatbot components
      │       ├── ChatbotForm.tsx        # Form for creating/editing chatbots
      │       ├── ResponseEditor.tsx     # Editor for chatbot responses
      │       ├── TemplateSelector.tsx   # Template selection component
      │       └── TrainingSection.tsx    # NLP training interface
      ├── lib/
      │   └── chatbots/                  # Chatbot-related utilities
      │       ├── types.ts               # TypeScript types/interfaces
      │       ├── validation.ts          # Form validation schemas
      │       └── api.ts                 # API utility functions
      └── hooks/
          └── chatbots/                  # Custom hooks
              ├── useChatbot.ts          # Hook for chatbot operations
              └── useTemplates.ts        # Hook for template management
```
git branch
git checkout -b tungno-dev
git add (...)
git commit -m "..."
git push -u origin tungno-dev

```
new file structure after initialing db: 
chatbot-platform/
│
├── db/                           # Database files
│   └── init.sql                  # Database initialization script
│
├── src/
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── chatbots/
│   │   │   │   └── route.ts      # Chatbot API endpoints
│   │   │   └── templates/
│   │   │       └── route.ts      # Templates API endpoints
│   │   │
│   │   ├── dashboard/
│   │   │   └── chatbots/
│   │   │       ├── create/
│   │   │       │   └── page.tsx  # Create chatbot page
│   │   │       └── page.tsx      # Chatbot listing page
│   │   │
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout component
│   │
│   ├── components/
│   │   ├── chatbots/
│   │   │   ├── ChatbotForm.tsx   # Form for creating/editing chatbots
│   │   │   ├── ResponseEditor.tsx # Component for editing chatbot responses
│   │   │   └── TemplateSelector.tsx # Component for selecting templates
│   │   │
│   │   └── ui/
│   │       └── card.tsx          # Card UI component
│   │
│   └── lib/
│       ├── chatbots/
│       │   ├── db.ts             # Database functions for chatbots
│       │   └── types.ts          # Type definitions (moved to db/schema.ts)
│       │
│       └── db/
│           ├── client.ts         # Database client setup
│           └── schema.ts         # Zod schemas and type definitions
│
├── .env.local                    # Environment variables
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── package.json                  # Project dependencies
└── tsconfig.json                 # TypeScript configuration
```

How to run the project: 
## Start the PostgreSQL database
npm run db:init

## Install dependencies:
npm install pg zod
npm install --save-dev @types/pg

## Run the following commands to start your Docker containers:

### Build and start all containers
docker-compose up -d

### Check if containers are running
docker ps

### View logs if needed
docker-compose logs -f

## Start the application:
npm run dev



## If you want to develop outside of Docker (which might be easier), but use the Docker PostgreSQL database:
### Only start the PostgreSQL container
docker-compose up -d postgres

to destroy docker: up
docker-compose down -v

### Then update .env.local to use:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatbot_platform_db"



# Only start the PostgreSQL container
docker-compose up -d postgres

# Then update .env.local to use:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatbot_platform_db"

# Analytics & Logs Features Requirements
Conversation History - Store and display past customer interactions
Analytics Dashboard - Show usage, interactions, and conversion rates
Customer Feedback - Collect feedback on chatbot accuracy
Sales Influence Tracking - Track how chatbot interactions lead to sales
### Proposed file structure:
```
chatbot-platform/
├── db/
│   └── init.sql (Updated to include new tables for analytics & logs)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   │   ├── route.ts (GET analytics data)
│   │   │   │   ├── [chatbotId]/
│   │   │   │   │   ├── route.ts (GET specific chatbot analytics)
│   │   │   │   ├── feedback/
│   │   │   │   │   ├── route.ts (POST user feedback)
│   │   │   ├── conversations/
│   │   │   │   ├── route.ts (GET all conversations)
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts (GET specific conversation)
│   │   │   ├── chatbots/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── interact/
│   │   │   │   │   │   ├── route.ts (Updated to log interactions)
│   │   │   │   │   ├── logs/
│   │   │   │   │   │   ├── route.ts (GET chatbot logs)
│   │   │   │   │   ├── stats/
│   │   │   │   │   │   ├── route.ts (GET chatbot statistics)
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx (Main analytics dashboard)
│   │   │   ├── chatbots/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   ├── page.tsx (Chatbot-specific analytics)
│   │   │   │   │   ├── conversations/
│   │   │   │   │   │   ├── page.tsx (Conversation history)
│   │   │   │   │   │   ├── [conversationId]/
│   │   │   │   │   │   │   ├── page.tsx (Specific conversation)
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx (Main dashboard component)
│   │   │   ├── ChatbotAnalytics.tsx (Chatbot-specific analytics)
│   │   │   ├── ConversationsList.tsx (List of conversations)
│   │   │   ├── ConversationDetail.tsx (Single conversation view)
│   │   │   ├── FeedbackSummary.tsx (Feedback visualization)
│   │   │   ├── StatisticsCard.tsx (Reusable stat card component)
│   │   │   ├── ConversionRateChart.tsx (Chart for conversion rates)
│   │   │   ├── UsageChart.tsx (Chart for usage stats)
│   │   │   ├── TimelineChart.tsx (Timeline visualization)
│   │   │   ├── FilterBar.tsx (Filtering options for analytics)
│   │   ├── chatbots/
│   │   │   ├── ChatbotTester.tsx (Updated to collect feedback)
│   │   │   ├── FeedbackModal.tsx (Modal for collecting feedback)
│   ├── lib/
│   │   ├── analytics/
│   │   │   ├── db.ts (Database functions for analytics)
│   │   │   ├── calculations.ts (Utility functions for calculations)
│   │   │   ├── types.ts (Types for analytics data)
│   │   ├── conversations/
│   │   │   ├── db.ts (Database functions for conversations)
│   │   │   ├── types.ts (Types for conversation data)
│   │   ├── chatbots/
│   │   │   ├── matcher.ts (Updated to track matching success)
│   │   │   ├── logger.ts (Functions to log interactions)
│   │   ├── db/
│   │   │   ├── schema.ts (Updated with new types)
```

### How to Use

1. View Analytics: Visit the /dashboard/analytics page to see the main dashboard
2. View Conversations: Browse conversation history on the /dashboard/chatbots/[id]/conversations page
3. Collect Feedback: Users can now provide feedback via the updated chat interface
4. Track Conversions: Implement the conversion tracking API in your checkout flow

```
New API Endpoints

/api/analytics/[chatbotId] - Get analytics data
/api/feedback - Record user feedback
/api/conversions - Record conversions
/api/cron/aggregate-analytics - Run daily aggregation
```

### Test database: 
```
docker-compose exec postgres psql -U postgres -d chatbot_platform_db
```
```
-- List all tables
\dt

-- Get detailed information about a specific table
\d conversations
\d conversation_messages
\d chatbot_feedback

-- Check if conversations exist
SELECT id, session_id, started_at, ended_at FROM conversations LIMIT 10;

-- Check if messages exist
SELECT id, conversation_id, is_from_user, message_text, sent_at FROM conversation_messages LIMIT 10;
```