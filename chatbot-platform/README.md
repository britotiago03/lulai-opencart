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