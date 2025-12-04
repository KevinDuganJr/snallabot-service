import fs from 'fs';
import path from 'path';

const devEnvPath = path.resolve(__dirname, '../.dev.env');
if (process.env.NODE_ENV !== 'production' && fs.existsSync(devEnvPath)) {
  require('dotenv').config({ path: devEnvPath });
}

import app from "./server"

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
