# Using Squoosh-Lib in Angular

Because this library relies on WebAssembly (`.wasm`) files, integrating it into Angular requires handling those binary assets correctly so the browser can load them at runtime. Angular's bundler (Webpack/esbuild) sometimes struggles to automatically resolve `.wasm` files from third-party libraries.

Here is the easiest, most reliable way to integrate this into an Angular project by treating the WASM files as static assets.

## Step 1: Copy WASM binaries to `assets/`
In your Angular project, copy the `codecs/` folder from this library directly into your Angular `src/assets/` directory.

Your Angular project should look like this:
```text
my-angular-app/
  src/
    assets/
      codecs/
        mozjpeg/
        webp/
        avif/
        ...
```
*Why?* Angular automatically serves anything in the `assets/` folder as static HTTP files, bypassing the bundler entirely. This is perfect for WASM binaries.

## Step 2: Copy the Library Source
Copy the `src/` folder from this library into your Angular project's source code. For example, into `src/app/squoosh/`.

## Step 3: Update the Wrapper Paths
Because you moved the files and want to bypass the bundler for the WASM files, you need to update the import paths in the wrapper files (`src/app/squoosh/encoders/mozjpeg.js`, etc.).

Change the `import(...)` path to point to your absolute assets URL. This forces the browser to fetch the JS and WASM directly, rather than Angular trying to bundle them.

For example, in `mozjpeg.js`:

**Before:**
```javascript
function initModule() {
  return import('../../codecs/mozjpeg/enc/mozjpeg_enc.js').then((m) =>
    initEmscriptenModule(m.default),
  );
}
```

**After:**
```javascript
function initModule() {
  // Use absolute path to the assets folder
  return import('/assets/codecs/mozjpeg/enc/mozjpeg_enc.js').then((m) =>
    initEmscriptenModule(m.default),
  );
}
```
*(You will need to do this for `webp.js`, `avif.js`, `png.js`, `resize.js`, etc.)*

## Step 4: Fix `locateFile` for WASM (Crucial for Emscripten)
Emscripten modules try to magically find their `.wasm` files, which often breaks when moved into Angular's asset folder. To make it bulletproof, update `src/app/squoosh/utils.js` to explicitly tell the module where its `.wasm` file is:

**Update `utils.js`:**
```javascript
export function initEmscriptenModule(moduleFactory, wasmUrl) {
  return moduleFactory({ 
    noInitialRun: true,
    locateFile: (path) => {
      // If we provided a hardcoded URL, use it
      if (path.endsWith('.wasm') && wasmUrl) return wasmUrl;
      return path;
    }
  });
}
```

**Then update your encoders to pass the URL:**
```javascript
// In mozjpeg.js:
function initModule() {
  return import('/assets/codecs/mozjpeg/enc/mozjpeg_enc.js').then((m) =>
    initEmscriptenModule(m.default, '/assets/codecs/mozjpeg/enc/mozjpeg_enc.wasm')
  );
}
```

## Step 5: Use it in your Component
Now you can import the wrappers directly into your Angular components. Because they are standard JS modules, TypeScript/Angular will interop with them perfectly.

```typescript
import { Component } from '@angular/core';
// Import from the folder where you placed the src files
import { nativeDecode, mozjpeg } from '../squoosh/index.js';

@Component({
  selector: 'app-image-compressor',
  template: `<input type="file" (change)="onFileSelected($event)">`
})
export class ImageCompressorComponent {
  
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 1. Decode to raw ImageData
      const imageData = await nativeDecode.decode(file);
      
      // 2. Compress to MozJPEG
      const compressedBuffer = await mozjpeg.encode(imageData, { quality: 80 });
      
      console.log('Compressed size:', compressedBuffer.byteLength);
    } catch (err) {
      console.error('Compression failed', err);
    }
  }
}
```

## Step 6: Cherry-Picking Specific Codecs (Optional)

If you only need certain features—for example, if you **only** want to use `resize` and the `webp` codec—you absolutely do not have to copy everything. The library is highly modular.

To save space in your Angular app, you can delete the rest:

1. **In your `assets/codecs/` folder:**
   Keep only the `resize` and `webp` folders. Delete `mozjpeg`, `avif`, `png`, `jxl`, etc.
   
2. **In your `src/app/squoosh/` folder:**
   - Keep `utils.js` and `feature-detect.js` (these are shared).
   - Keep `decoders/native.js` (highly recommended for Canvas decoding).
   - Keep `encoders/webp.js` and `decoders/webp.js`.
   - Keep `processors/resize.js`.
   - Delete all other encoder and decoder files.
   - copy all d.ts files relevant to above including index.d.ts and emscripten-wasm.d.ts

3. **In `src/app/squoosh/index.js`:**
   Remove the `export` lines for the codecs you deleted so TypeScript doesn't complain about missing files. 

Because each codec dynamically lazy-loads its own WASM file individually, leaving out the ones you don't use won't break anything else!
