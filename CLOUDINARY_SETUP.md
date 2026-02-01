# Cloudinary Setup Instructions

This project uses Cloudinary for image uploads (castaway images and team logos).

## Backend Configuration

The backend is already configured to use Cloudinary. Make sure your `.env` file has these variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=survivor
```

## Frontend Configuration (for Team Logos)

Team logos can be uploaded directly from the profile page. To enable this:

### 1. Get Your Cloudinary Credentials

1. Log in to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Find your **Cloud Name** on the dashboard home page
3. Copy the cloud name for the next steps

### 2. Create an Unsigned Upload Preset

Since the frontend uploads directly to Cloudinary, we need an unsigned upload preset:

1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `survivor_team_logos`
   - **Signing mode**: **Unsigned** (important!)
   - **Folder**: `survivor/teams`
   - **Transformations**: Add these transformations in order:
     - `c_fill,w_400,h_400,g_auto` (square crop, 400x400)
     - `r_24` (rounded corners)
     - `q_auto,f_auto` (quality and format optimization)
4. Click **Save**

### 3. Update Frontend Environment Variables

Edit `frontend/.env.local` and add:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=survivor_team_logos
```

Replace `your_cloud_name_here` with your actual Cloudinary cloud name.

### 4. Restart the Development Server

After updating the `.env.local` file:

```bash
cd frontend
npm run dev
```

## Testing the Upload

1. Sign in to the app
2. Navigate to `/profile`
3. Find one of your teams
4. Click "Upload Logo"
5. Select an image (JPG, PNG, or WebP, max 5MB)
6. The image will be uploaded, cropped to a square, and saved to your team

## Upload Widget Features

The Cloudinary Upload Widget provides:

- **Image cropping**: Force users to crop images to a square (1:1 aspect ratio)
- **File validation**: Only allows JPG, PNG, and WebP files up to 5MB
- **Camera access**: Users can take photos directly (on mobile)
- **Automatic optimization**: Images are automatically optimized for web delivery

## Folder Structure in Cloudinary

Images are organized as follows:

```
survivor/
├── castaways/
│   └── castaway_{id}
└── teams/
    └── team_{id}
```

## Troubleshooting

### "Cloudinary widget not loaded" error

Make sure the Cloudinary Upload Widget script is loaded. The `CloudinaryUploadWidget` component automatically loads it, but it may take a moment on first load.

### Upload fails with "Invalid signature"

This means the upload preset is not configured as **Unsigned**. Go back to your Cloudinary dashboard and make sure the preset's signing mode is set to "Unsigned".

### Images not appearing after upload

- Check browser console for errors
- Verify the `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Make sure the upload preset name matches exactly: `survivor_team_logos`

### Upload succeeds but image doesn't save to database

This likely means the backend API endpoints aren't working. Check:
- Backend is running
- User is authenticated
- User owns the team they're trying to update
