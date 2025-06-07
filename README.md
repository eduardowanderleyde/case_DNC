# Monster Battle - Pokémon-style Monster Battle Game

## Description

A web-based monster battle game inspired by Pokémon, featuring a React frontend and a Node.js/Express + Prisma backend. Includes normal battle arenas and an isolated Test Arena, with battle logic faithful to the Pokémon universe.

## Tech Stack

- **Frontend:** React.js + Material UI
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Prisma ORM)
- **Testing:** Jest, Supertest
- **Realtime:** Socket.io

## Project Structure

```
case-DNC/
├── prisma/           # Migrations, seed, and database schema
├── src/
│   ├── api/         # Backend (controllers, services, routes)
│   ├── frontend/    # React frontend
│   └── server.js    # Backend entry point
├── package.json     # Backend scripts
└── README.md        # This file
```

## How to Run the Project

### 1. Clone the repository

```bash
git clone <repo-url>
cd case-DNC
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure the database

- Create a local PostgreSQL database (e.g., `monster_battle`)
- Copy `.env.example` to `.env` and update the connection variables

### 4. Run migrations and seed the database

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Start the backend

```bash
npm run dev
# or
npm start
```

The backend runs by default on port **3001**.

### 6. Start the frontend

Open a new terminal and run:

```bash
cd src/frontend
npm install
npm start
```

The frontend runs by default on port **3000** and is already set up to proxy API requests.

### 7. Access the system

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Scripts

- `npm test` — Run backend tests
- `npm run seed` — Seed the database with initial data
- `npx prisma studio` — Visual interface for the database

## Notes

- The backend exposes main routes at `/api/monsters`, `/api/players`, `/api/arenas`, `/api/test-arena`.
- The seed script creates players, classic monsters, and test arenas.
- To reset the database, just run the seed script again.
- The frontend is in `src/frontend` and can be customized as needed.

## Testing

- Unit tests are in `src/api/__tests__`.
- To run: `npm test`

---
Questions or suggestions? Open an issue or get in touch!
