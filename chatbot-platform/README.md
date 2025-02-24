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


file structure for Chatbot creation & configuration
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