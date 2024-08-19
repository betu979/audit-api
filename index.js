const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')

const app = express();

connectToMongo() 


const port = 5000;
app.use(cors())
app.use(express.json())

//Available Routes
app.use('/api/auth', require('./routes/user'))
// app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
