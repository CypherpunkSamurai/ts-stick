const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

const shared = {
  entryPoints: [
    'src/joystick/Button.ts',
    'src/joystick/Dpad.ts', 
    'src/joystick/Joystick.ts',
    'src/joystick/RetractableSlider.ts'
  ],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2015'],
  plugins: [nodeExternalsPlugin()]
}

// ESM build
esbuild.build({
  ...shared,
  format: 'esm',
  outdir: 'dist/esm',
  splitting: true
})

// CJS build
esbuild.build({
  ...shared, 
  format: 'cjs',
  outdir: 'dist/cjs'
})

// UMD build
esbuild.build({
  ...shared,
  format: 'iife',
  globalName: 'TsStick',
  outdir: 'dist/umd',
  footer: {
    js: 'if(typeof module!=="undefined")module.exports=TsStick;' 
  }
})