# YatraStay

YatraStay is a full-stack property booking app inspired by vacation rental platforms. It lets users browse stays, search by destination and dates, create accounts, switch to host mode, publish listings with image uploads, leave reviews, and make reservations.

This repository is set up as a public portfolio / learning project, not a production deployment.

## Features

- Browse all listings with search by place, dates, and guest count
- View listing details, gallery images, reviews, and map location
- Sign up, log in, and log out with Passport local authentication
- Upgrade a normal account to a host account
- Hosts can create, edit, and delete their own listings
- Guests can reserve available properties for selected dates
- Guests and listing owners can cancel reservations
- Upload listing images to Cloudinary
- Auto-geocode listing locations for map display

## Tech Stack

- Node.js
- Express
- EJS + EJS Mate
- MongoDB + Mongoose
- Passport + passport-local-mongoose
- Cloudinary + Multer
- Joi validation
- Leaflet + OpenStreetMap tiles

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a reachable MongoDB connection string
- A Cloudinary account for image uploads
- Internet access for geocoding and map tiles

## Installation

```bash
npm install
```

Create your environment file:

```powershell
Copy-Item .env.example .env
```

Fill in real values inside `.env`.

## Environment Variables

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/YatraStay
SESSION_SECRET=replace_with_a_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Run Locally

Start the app:

```bash
npm start
```

The server runs at `http://localhost:8080` by default.

## Seed Sample Data

```bash
npm run seed
```

This clears existing listings and inserts the sample data from `init/data.js`.

Note: the seed script also creates a default owner record for sample listings using `demo1234@gmail.com`, but it does not create a usable login password for that account. It exists only to attach ownership to seeded listings.

## Available Scripts

- `npm start` runs the Express server
- `npm run seed` inserts sample listing data
- `npm run backfill:ownership -- <user-email>` assigns missing listing and review ownership to an existing user

## Project Structure

```text
.
|-- app.js
|-- controllers/
|-- init/
|-- models/
|-- public/
|-- routes/
|-- scripts/
|-- utilis/
`-- views/
```

## Notes

- Keep your real secrets only in `.env`, never in committed files.
- Cloudinary credentials are required at startup. The app will fail fast if they are missing.
- Listing geocoding uses OpenStreetMap Nominatim and may return `null` coordinates if the service is unavailable.
- The project currently does not include an automated test suite.

## Future Improvements

- Add automated tests for auth, listing flows, and reservations
- Move session storage from memory to MongoDB or Redis for production use
- Add authorization and validation coverage for more edge cases
- Add admin tooling and booking analytics
