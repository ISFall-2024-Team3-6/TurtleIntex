/*
Davis Larson
Assignment 4 - Connects to a pokemon database allowing for displaying, editing, creating and deleting of data
*/

let express = require("express");

// Create the express app
let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

let security = false;

// Connects to the locally hosted database
const knex = require("knex") ({
  client : "pg",
  connection : {
      host : process.env.RDS_HOSTNAME || "localhost",
      user : process.env.RDS_USERNAME || "postgres",
      password : process.env.RDS_PASSWORD || "iowa",
      database : process.env.RDS_DB_NAME || "assignment3a",
      port : process.env.RDS_PORT ||  5432,
      ssl : process.env.DB_SSL ? {rejectUnauthorized : false} : false
  }
});

// Route to display Pokemon records
app.get('/', (req, res) => {
    // knex('pokemon')
    //   .join('poke_type', 'pokemon.poke_type_id', '=', 'poke_type.id')
    //   .select(
    //     'pokemon.id',
    //     'pokemon.description',
    //     'pokemon.base_total',
    //     'pokemon.date_created',
    //     'pokemon.active_poke',
    //     'pokemon.gender',
    //     'pokemon.poke_type_id',
    //     'poke_type.description as poke_type_description'
    //   )
    //   .then(pokemon => {
    //     // Render the index.ejs template and pass the data
    //     res.render('index', { pokemon, security });
    //   })
    //   .catch(error => {
    //     console.log('Error querying database:', error);
    //     res.status(500).send('Internal Server Error');
    //   });
    res.send("Hello");
  });

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
      // Query the user table to find the record
      const user = knex('user')
          .select('*')
          .where({ username, password }) // Replace with hashed password comparison in production
          .first(); // Returns the first matching record
      if (user) {
          security = true;
      } else {
          security = false;
      }
  } catch (error) {
      res.status(500).send('Database query failed: ' + error.message);
  }
  res.redirect("/")
});








// THIS IS FOR EVENTS.EJS -> FOR THE ADMIN TO EDIT EVENTS
app.get('/events/:id', (req, res) => {
let id = req.params.id;
// Query the Volunteer by ID first
knex('pokemon') // CHANGE THIS TO THE NAME OF THE TABLE IN THE DATABASE THAT HOLDS EVENTS
    .where('id', id)
    .first()
    .then(events => {
    if (!events) {
        return res.status(404).send('Event not found');
    }
    
    // WE MAY OR MAY NOT NEED THIS!! I DON'T THINK SO, BECAUSE WE DO NOT NEED TO PULL DATA FROM ANOTHER 
    // TABLE TO EDIT THE EVENTS, WE JUST NEED TO EDIT A CERTAIN EVENT (DATA FROM THIS EVENT MAY BE EDITIED, IF SO
    // THEN WE WOULD NEED THIS SEGMENT BELOW)
    
    // Query all Pokémon types after fetching the Pokémon
    knex('poke_type')
        .select('id', 'description')
        .then(poke_types => {
        // Render the edit form and pass both pokemon and poke_types
        res.render('editPoke', { pokemon, poke_types });
        })
        .catch(error => {
        console.log('Error fetching Pokémon types:', error);
        res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
    console.log('Error fetching Event for editing:', error);
    res.status(500).send('Internal Server Error');
    });
});

app.post('/events/:id', (req, res) => {
  const id = req.params.id;

  const event_name = req.body.event_name
  const description = req.body.description
  
  const event_date = req.body.event_date
  const back_up_date_1 = req.body.back_up_date_1
  const back_up_date_2 = req.body.back_up_date_2
  
  const event_start_time = req.body.event_start_time

  const event_duration_projected = parseInt(req.body.event_duration_projected)
  const event_duration_actual = parseInt(req.body.event_duration_actual)

  const event_address = req.body.event_address

  const event_num_participants_projected = parseInt(req.body.event_num_participants_projected)
  const event_num_participants_actual = parseInt(req.body.event_num_participants_actual)

  const requestee_name = req.body.requestee_name
  const requestee_phone = req.body.requestee_phone
  const requestee_email = req.body.requestee_email

  const jen_story = req.body.jen_story === 'true'

  // Update the Events in the database
    knex('pokemon') // MAKE SURE THIS IS THE NAME OF THE TABLE IN THE DATABASE
     .where('id', id)
     .update({
       event_name: event_name,
       description: description,
       
       event_date: event_date,
       back_up_date_1: back_up_date_1,
       back_up_date_2: back_up_date_2,
       
       event_start_time: event_start_time, 
       
       event_duration_projected: event_duration_projected, 
       event_duration_actual: event_duration_actual, 
       
       event_address: event_address,

       event_num_participants_projected: event_num_participants_projected, 
       event_num_participants_actual: event_num_participants_actual, 

       requestee_name: requestee_name, 
       requestee_phone: requestee_phone, 
       requestee_email: requestee_email, 

       jen_story: jen_story, 


     })
     .then(() => {
       res.redirect('/'); // Redirect to the list of events after saving -> FIX THIS ROUTE, IT WILL BE WRONG
     })
     .catch(error => {
       console.log('Error updating Event:', error);
       res.status(500).send('Internal Server Error');
     });
 });








// THIS IS FOR volunteers.EJS -> for the admin to EDIT INFO FOR VOLUNTEERS

app.get('/volunteers/:id', (req, res) => {
  let id = req.params.id; // to extract a parameter out of the route ^^^ , id is the parameter ID; if it was num, do req.params.num
  // using it to find the record in the database
  
  // Query the Volunteer by ID first
  knex('volunteer') // CHANGE THIS TO THE TABLE NAME
      // didnt need a select, it is basically select *
    .where('id', id) // go to the table where the PARAMETER(which is id) = id in the pokemon table
    .first() // the query will come back as an array, but we say I just want the first record which then it becomes an object with NO ARRAY (BECAUSE ID IS THE PRIMARY KEY!!, which is why I get only 1 record (and play i have a .first()))
    .then(volunteers => { // store this first record/value that is returned from this query as the variable pokemon
      if (!volunteers) {
        return res.status(404).send('Volunteer not found');
      }



// SAME THING - DO I REALLY NEED THIS??????
// Query all Volunteer types after fetching the Volunteers YOU WANT TO UPDATE

      knex('poke_type') // embeded in the other knex for error handling 
        .select('id', 'description') // from the other table, go grab these 2
        .then(poke_types => { // pass this data from this query to variable poke_types
          // Render the edit form and pass both pokemon and poke_types
          res.render('editPoke', { pokemon, poke_types }); // we are passing editPoke (we need to go make this ejs file) 2 parameters/pieces of data (the 1 record for the id, and the array called poke_types) -> this will get put in a combo box for the user to choose from a drop down ()
          // if you want more drop down boxes, just pass more parameters after pokemon IN RES.RENDER!!!! this will only be used to build a drop down box in the HTML
          // an array with all the poke_types POSSIBLE! JUST PULLS THE DATA
        })
        .catch(error => {
          console.error('Error fetching Volunteer types:', error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
      console.error('Error fetching Volunteer for editing:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.post('/volunteers/:id', (req, res) => {
  const id = req.params.id; // this is how you pull out the parameter TO SEE WHAT POKEMON YOU ARE DEALING WITH
  

  const first_name = req.body.first_name
  const last_name = req.body.last_name
  const volunteer_email = req.body.volunteer_email
  
  const volunteer_phone = req.body.volunteer_phone

  const volunteer_street_address = req.body.volunteer_street_address
  const volunteer_city = req.body.volunteer_city
  const volunteer_state = req.body.volunteer_state
  const volunteer_zip = req.body.volunteer_zip
  const volunteer_referral_method = req.body.volunteer_referral_method
  const volunteer_availability = req.body.volunteer_availability; // This will be an array of selected days
  
  const volunteer_hours_willing = parseInt(req.body.volunteer_hours_willing)

  const sewing_level = req.body.sewing_level

  const volunteer_consent_for_contact = req.body.volunteer_consent_for_contact === 'true'; // Check if the checkbox is checked
  
  const preferred_contact = req.body.preferred_contact

  const notification_preferences = req.body.notification_preferences


  // Update the Volunteer in the database
  knex('volunteer') // pokemon is the table 
    .where('id', id) // in the route, we got the id; if the ID is the same, then do the edit/update
    // then go update it; 
    // LEFT: column names IN THE TABLE ALREADY
    // RIGHT: values you want to store in the database that were entered into the FORM! CAN USE VARIABLES BC YOU MADE CONST ONES ABOVE
    // description could have been req.body.description, but since we made these variables up top, we can just use the variables here
    .update({

      first_name: first_name, 
      last_name: last_name, 
      volunteer_email: volunteer_email,

      volunteer_phone: volunteer_phone,
      
      volunteer_street_address: volunteer_street_address, 
      volunteer_city: volunteer_city, 
      volunteer_state: volunteer_state, 
      volunteer_zip: volunteer_zip,
      volunteer_referral_method: volunteer_referral_method, 
      volunteer_availability: JSON.stringify(volunteer_availability), // Store the array as a JSON string (IN YOUR postgreSQL DATABASE > MAKE SURE THE TYPE OF DATA IS JSONB, not varchar)

      volunteer_hours_willing: volunteer_hours_willing,

      sewing_level: sewing_level,

      volunteer_consent_for_contact: volunteer_consent_for_contact,  // Store the consent status

      preferred_contact: preferred_contact, 

      notification_preferences: notification_preferences, 

    })

    })
    .then(() => {
      res.redirect('/'); // Redirect to the list of Pokémon after saving; go back to the route/home page!!! IT IS THE ROUTE, not an ejs file
    })
    .catch(error => {
      console.error('Error updating Volunteer:', error);
      res.status(500).send('Internal Server Error');
    });


  

  // LETS YOU DELETE A VOLUNTEER 
  app.post('/deleteVolunteer/:id', (req, res) => {
    const id = req.params.id;
    knex('volunteer') // put the name of the database here
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Pokémon list after deletion
      })
      .catch(error => {
        console.log('Error deleting Volunteer:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  // LETS YOU DELETE AN EVENT 
  app.post('/deleteEvent/:id', (req, res) => {
    const id = req.params.id;
    knex('event') // put the name of the database here
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Pokémon list after deletion
      })
      .catch(error => {
        console.log('Error deleting Event:', error);
        res.status(500).send('Internal Server Error');
      });
  });






  app.get('/addPoke', (req, res) => {
    // Fetch Pokémon types to populate the dropdown
    knex('poke_type')
        .select('id', 'description')
        .then(poke_types => {
            // Render the add form with the Pokémon types data
            res.render('addPoke', { poke_types });
        })
        .catch(error => {
            console.log('Error fetching Pokémon types:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.post('/addPoke', (req, res) => {
  // Extract form values from req.body
  const description = req.body.description || ''; // Default to empty string if not provided
  const base_total = parseInt(req.body.base_total, 10); // Convert to integer
  const date_created = req.body.date_created || new Date().toISOString().split('T')[0]; // Default to today
  const active_poke = req.body.active_poke === 'true'; // Checkbox returns true or undefined
  const gender = req.body.gender || 'U'; // Default to 'U' for Unknown
  const poke_type_id = parseInt(req.body.poke_type_id, 10); // Convert to integer
  // Insert the new Pokémon into the database
  knex('pokemon')
      .insert({
          description: description.toUpperCase(), // Ensure description is uppercase
          base_total: base_total,
          date_created: date_created,
          active_poke: active_poke,
          gender: gender,
          poke_type_id: poke_type_id,
      })
      .then(() => {
          res.redirect('/'); // Redirect to the Pokémon list page after adding
      })
      .catch(error => {
          console.log('Error adding Pokémon:', error);
          res.status(500).send('Internal Server Error');
      });
});

// Allows the server to listen
app.listen(port, () => console.log("Express App has started and server is listening on http://localhost:" + port));