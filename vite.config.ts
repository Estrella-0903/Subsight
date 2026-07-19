import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({mode})=>({
  plugins:[react()],
  // GitHub Pages serves this project below /Subsight/ rather than at the domain root.
  base:mode==='production'?'/Subsight/':'/',
  server:{host:'127.0.0.1',proxy:{'/api':'http://127.0.0.1:3001'}}
}));
