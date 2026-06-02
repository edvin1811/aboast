# aboast - Testimonials Management Platform

A modern testimonials/reviews management application built with Next.js 15. Gather, filter, manage, and display testimonials with customizable widgets that can be embedded anywhere.

## Features

- **Testimonial Management** - Collect, organize, and manage customer testimonials
- **Custom Forms** - Create custom collection forms for gathering testimonials
- **Widget Builder** - Multiple customizable widget templates (grid, carousel, masonry, etc.)
- **Easy Embedding** - Simple iframe-based embedding for any website
- **Authentication** - Secure user authentication with Clerk
- **Multi-workspace** - Manage multiple projects with separate workspaces
- **Filtering & Tags** - Organize testimonials with tags and filters
- **Rating System** - Built-in star rating support
- **Media Support** - Support for images and video testimonials

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Clerk
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here



# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:

```bash
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Setting up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key to `.env.local`
4. Configure your sign-in/sign-up URLs in the Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## Database Schema

The application uses the following main models:

- **User** - User accounts (synced with Clerk)
- **Workspace** - Projects/workspaces for organizing testimonials
- **Testimonial** - Individual testimonials with ratings, content, and metadata
- **Widget** - Embeddable widget configurations with customization options
- **Form** - Custom forms for collecting testimonials
- **WidgetTestimonial** - Junction table for widget-testimonial relationships

## Project Structure

```
aboast/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes
│   │   └── dashboard/       # Main dashboard pages
│   ├── api/                 # API routes
│   │   ├── testimonials/    # Testimonial API
│   │   ├── widgets/         # Widget API
│   │   └── webhooks/        # Clerk webhooks
│   ├── widget/              # Public widget pages
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── dashboard/           # Dashboard components
│   └── widgets/             # Widget templates
├── lib/
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
├── types/
│   └── index.ts            # TypeScript types
└── hooks/                  # Custom React hooks
```

## Widget Templates

The application supports multiple widget templates:

- **Grid** - Classic grid layout
- **Carousel** - Rotating carousel
- **Masonry** - Pinterest-style masonry layout
- **Wall of Love** - Full-width testimonial wall
- **Single** - Single testimonial display

Each template is fully customizable with:
- Colors (primary, background, text, stars)
- Typography
- Border radius
- Layout options
- Animation styles

## Embedding Widgets

Widgets can be embedded using a simple iframe snippet:

```html
<iframe
  src="https://yourdomain.com/widget/your-widget-slug"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

## Development

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Open Prisma Studio
npm run db:studio

# Push schema changes to database
npm run db:push
```

## Roadmap

- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Social media import
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Export functionality

## License

ISC
