# AI Project Mentor

An AI-powered web application that helps developers understand any software project quickly. Upload your project files or paste code, and the AI mentor will answer questions about architecture, folder structure, API flows, authentication, and more.

Built for student hackathons and GDG Project of the Month submissions.

## Tech Stack

| Layer          | Technology              |
|----------------|------------------------|
| Frontend       | React.js + Tailwind CSS |
| Backend        | Node.js + Express.js   |
| Database       | MongoDB                |
| AI             | Google Gemini API      |
| Authentication | JWT                    |
| File Upload    | Multer + adm-zip       |

## Features

- User signup/login with JWT authentication
- Upload project files (individual or ZIP)
- Paste code directly
- AI-generated project summary
- Chat interface to ask questions about your project
- AI answers based ONLY on your uploaded code
- Clean, modern UI with Tailwind CSS
- Project dashboard with history

## Project Structure

```
ai-project-mentor/
├── backend/
│   ├── models/          # MongoDB schemas (User, Project, Chat)
│   ├── routes/          # API routes (auth, projects, chat)
│   ├── middleware/      # JWT auth middleware
│   ├── utils/           # Gemini AI helper functions
│   ├── uploads/         # Temporary file upload directory
│   ├── server.js        # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/       # React page components
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context (React Context API)
│   │   ├── services/    # Axios API service
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone and setup backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (copy from `.env.example`):

```
MONGODB_URI=mongodb://localhost:27017/ai-project-mentor
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### 2. Setup frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API requests to the backend on port 5000.

### 3. Open in browser

Visit `http://localhost:3000` — sign up, upload a project, and start chatting with the AI!

## How It Works (Beginner-Friendly Explanation)

1. **User signs up/logs in** → Backend creates a JWT token for authentication
2. **User uploads project files** → Backend reads file contents, stores in MongoDB
3. **AI generates a summary** → Gemini API analyzes all uploaded code and creates a project overview
4. **User asks questions in chat** → Backend sends the project code + question to Gemini API
5. **AI responds** → The response is based ONLY on the uploaded project content, not general knowledge
6. **Chat history is saved** → User can come back and continue the conversation

## API Endpoints

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| POST   | /api/auth/signup       | Register new user              |
| POST   | /api/auth/login        | Login user                     |
| GET    | /api/auth/me           | Get current user               |
| POST   | /api/projects/upload   | Upload project files           |
| POST   | /api/projects/paste    | Paste code directly            |
| GET    | /api/projects          | Get all user projects          |
| GET    | /api/projects/:id      | Get single project             |
| DELETE | /api/projects/:id      | Delete a project               |
| POST   | /api/chat/:projectId   | Ask AI a question              |
| GET    | /api/chat/:projectId   | Get chat history               |
| DELETE | /api/chat/:projectId   | Clear chat history             |

## Deployment Tips

- **Frontend**: Deploy on Vercel or Netlify
- **Backend**: Deploy on Render, Railway, or Fly.io
- **Database**: Use MongoDB Atlas (free tier)
- Update the frontend API base URL for production

## License

MIT - Free to use for hackathons, learning, and projects.
