# YouTube Music Overlay Extension
This firefox extension is to display the current song being played on YouTube Music in a minimal, but (hopefully) aesthetically pleasing way.

## Technical
The `/ui` folder contains a vite project using React and TypeScript. The `npm run build` script builds the vite project and copies the content of the resulting `/dist` folder into `/extension/ui`. The extension folder contains files to configure the rendering of the extension, while the `/extension/ui` folder is the static page content built from the dynamic vite project.