require('dotenv').config({ path: require('path').resolve(__dirname, '../.dev.env') })
import app from "./server"

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
