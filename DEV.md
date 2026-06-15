# Development Guide

This document explains how to set up the `squoosh-lib` project for local development, especially if you have just cloned the repository freshly from GitHub.

## Initial Setup

Because the WASM binaries (`codecs/`) and the original Squoosh reference source (`ref/`) are excluded from version control (`.gitignore`), a fresh clone will be missing the core WASM files required to run the library.

You have two options to get the WASM binaries:

### Option 1: Download from GitHub Actions (Recommended)

1. Go to the **Actions** tab of your GitHub repository.
2. Select the **Build Squoosh WASM Codecs** workflow.
3. Click **Run workflow** (you can leave the default branch/repo settings).
4. Wait for the workflow to complete (it takes a few minutes to build everything using Docker).
5. Once complete, scroll down to the **Artifacts** section and download the `squoosh-codecs-<ref>` zip file.
6. Extract the contents of the zip file directly into the `codecs/` folder in the root of your project. The structure should look like `codecs/mozjpeg/enc/mozjpeg_enc.js`, etc.

### Option 2: Build locally (Requires Docker)

If you want to compile the WASM binaries yourself locally, you can do so by cloning the Squoosh repo into the `ref/` folder and running the build scripts.

1. Clone the original Squoosh repository into the `ref/` directory:
   ```bash
   git clone https://github.com/GoogleChromeLabs/squoosh.git ref/squoosh-dev
   ```
2. Build the codecs you need using Docker. For example:
   ```bash
   cd ref/squoosh-dev/codecs/webp
   npm install
   npm run build
   ```
3. Run the setup script to copy the newly built browser artifacts into the local `codecs/` directory:
   ```bash
   npm run setup
   ```

## Running the Example App

Once the `codecs/` directory is populated with the `.js` and `.wasm` files, you can test the library using the included example app.

```bash
npm install
npm run serve-example
```

Then, open `http://localhost:8080/examples/` in your browser.

## Project Structure

- `src/` - The ESM wrappers around the WASM codecs. This is the main source code of the library.
- `codecs/` - The compiled WASM binaries and Emscripten/wasm-bindgen JS glue code (generated/downloaded).
- `examples/` - The example web application demonstrating how to use the library.
- `scripts/` - Helper scripts (like `setup-codecs.sh`).
- `ref/` - (Optional) The original Squoosh source code for reference or local building.
