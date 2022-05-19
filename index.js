const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended: false}))

//Save our users and exercise logs with simple id numbers
let users = [];
let id = 1;

//Create a new user, returning a username and id. Also sets up log and count for later
app.post('/api/users', (req,res)=>{
  let { username } = req.body;
  let userObject = {
    username: username,
    _id: id.toString(),
    count: 0,
    log: []
  };
  id++;
  users.push(userObject);
  res.json({
    username: userObject.username,
    _id: userObject._id
  });
  
})

//Request list of users and their id's
app.get('/api/users', (req,res)=>{
  
  res.json(users.map((user)=>{
    return {username: user.username, _id: user._id}
  }));
})

//Add an exercise to a user's log and returns the user and the exercise
app.post('/api/users/:_id/exercises', (req,res)=>{
  let { description, duration, date} = req.body;
  let {_id} = req.params;
  
  let user = users.find((user)=> user['_id'] == _id);
  
  if(!date){
    date = new Date();
  }else{
    date = new Date(date);
  }
  date = date.toDateString();

  let logEntry = {
    description: description,
    duration: parseInt(duration),
    date: date
  }
  user.log.push(logEntry);

  user.count++;
  res.json({
    username: user.username,
    _id: user._id,
    description: logEntry.description,
    duration: logEntry.duration,
    date: logEntry.date
  });
})

//Request a log of all of a user's exercises, or input parameters to filter the log
app.get('/api/users/:_id/logs', (req, res)=>{
  let {_id} = req.params;
  let { from, to, limit } = req.query;
  let user = users.find((user)=> user['_id'] == _id);
  
  let filteredLog = [...user.log];

  if(from){
    filteredLog = filteredLog.filter((log)=>{
      return (new Date(log.date) >= new Date(from))
    })
  }
  if(to){
    filteredLog = filteredLog.filter((log)=>{
      return (new Date(log.date) <= new Date(to))
    })
  }
  
  if(limit){
    filteredLog = filteredLog.slice(0, limit);
  }
  
  res.json({
    username: user.username,
    _id: user._id,
    count: filteredLog.length,
    log: filteredLog
  });
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
