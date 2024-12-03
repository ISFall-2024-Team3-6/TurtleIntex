let express = require("express");

// Create the express app
let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

let admin = false;

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
    res.render('index', {admin});
  });

app.get('/eventSignup/', (req, res) => {
    res.render('eventSignup')
});

app.get('/volunteerSignup/', (req, res) => {

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

  res.render('volunteerSignup', {states} )
});

app.post('/volunteerSignup', (req, res) => {

  const first_name = req.body.first_name
  const last_name = req.body.last_name
  const volunteerEmail = req.body.volunteerEmail
  const volunteerPhone = req.body.volunteerPhone
  const volunteerStreetAddress = req.body.volunteerStreetAddress
  const volunteerCity = req.body.volunteerCity
  const volunteerState = req.body.volunteerState
  const volunteerZip = req.body.volunteerZip
  const volunteerReferral = req.body.volunteerReferral
  const volunteerHours = req.body.volunteerHours
  const volunteerSewing = req.body.volunteerSewing

  // knex('volunteers')
  //   .insert({
  //     first_name: first_name.toUpperCase(), // Ensure first name is uppercase
  //     last_name: last_name.toUpperCase(),
  //     volunteerEmail: volunteerEmail,
  //     volunteerPhone: volunteerPhone,
  //     volunteerStreetAddress: volunteerStreetAddress,
  //     volunteerCity: volunteerCity,
  //     volunteerState: volunteerState,
  //     volunteerZip: volunteerZip,
  //     volunteerReferral: volunteerReferral,
  //     volunteerHours: volunteerHours,
  //     volunteerSewing: volunteerSewing
  //   })

    .then(() => {
      res.redirect('/volunteerSignup'); // Redirect to the character list page after adding
  })
  .catch(error => {
    console.error('Error adding Volunteer:', error);
    res.status(500).send('Internal Server Error');
});
})

app.get('/sponsors/', (req, res) => {
    res.render('sponsors')
});

app.get('/donation/', (req, res) => {
  res.render('donation')
});

app.get('/About/contact', (req, res) => {
  res.render('About/contact')
});

app.get('/About/faq', (req, res) => {
  res.render('About/faq')
});

app.get('/About/ourTech', (req, res) => {
  res.render('About/ourTech')
});

app.get('/About/story', (req, res) => {
  res.render('About/story')
});

//This is for admin login yeah?

app.get('/adminLogin', (req, res) => {
    res.render('adminLogin')
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
          admin = true;
      } else {
          admin = false;
      }
      res.render('index', { admin });
  } catch (error) {
      res.status(500).send('Database query failed: ' + error.message);
  }
  res.redirect("/")
});

app.get('/logout', (req, res) => {
  admin = false;
  res.redirect('/');
});




// THIS IS FOR EVENTS.EJS -> FOR THE ADMIN TO EDIT EVENTS

app.get('/events/:id', (req, res) => {
let id = req.params.id;
// Query the Volunteer by ID first
knex('events') 
    .where('id', id)
    .first()
    .then(events => {
    if (!events) {
        return res.status(404).send('Event not found');
    }
    })
    .catch(error => {
    console.log('Error fetching Event for editing:', error);
    res.status(500).send('Internal Server Error');
    });
});


app.post('/events/:id', (req, res) => {
  const id = req.params.id;

  const contact_first_name = req.body.contact_first_name
  const contact_last_name = req.body.contact_last_name
  const contact_phone = req.body.contact_phone
  const contact_email = req.body.contact_email
  const contact_perferred = req.body.contact_perferred
  const event_type = req.body.event_type
  const event_date = req.body.event_date
  const event_backup_date = req.body.event_backup_date
  const event_backup_date_2 = req.body.event_backup_date_2
  const event_start_time = req.body.event_start_time
  const event_expected_duration = req.body.event_expected_duration
  const event_actual_duration = req.body.event_actual_duration
  const event_address = req.body.event_address
  const event_city = req.body.event_city
  const event_state = req.body.event_state
  const event_zip = req.body.event_zip
  const event_space_capacity = req.body.event_space_capacity
  const table_types = req.body.table_types
  const number_sewers = req.body.number_sewers
  const machines_volunteered = req.body.machines_volunteered
  const event_expected_adults = req.body.event_expected_adults
  const event_expected_children = req.body.event_expected_children
  const event_actual_adults = req.body.event_actual_adults
  const event_actual_children = req.body.event_actual_children
  const jen_story = req.body.jen_story

  const pockets_brought = req.body.pockets_brought
  const pockets_in_progress = req.body.pockets_in_progress
  const pockets_finished = req.body.pockets_finished

  const collars_brought = req.body.collars_brought
  const collars_in_progress = req.body.collars_in_progress
  const collars_finished = req.body.collars_finished

  const envenlopes_brought = req.body.envenlopes_brought
  const envenlopes_in_progress = req.body.envenlopes_in_progress
  const envenlopes_finished = req.body.envenlopes_finished

  const vests_brought = req.body.vests_brought
  const vests_in_progress = req.body.vests_in_progress
  const vests_finished = req.body.vests_finished

  const completed_product = req.body.completed_product



  // Update the Events in the database
    knex('pokemon') // MAKE SURE THIS IS THE NAME OF THE TABLE IN THE DATABASE
     .where('id', id)
     .update({
      contact_first_name: contact_first_name, 
      contact_last_name: contact_last_name, 
      contact_phone: contact_phone, 
      contact_email: contact_email, 
      contact_perferred: contact_perferred, 
      event_type: event_type, 
      event_date: event_date,
      event_backup_date: event_backup_date, 
      event_backup_date_2: event_backup_date_2, 
      event_start_time: event_start_time, 
      event_expected_duration: event_expected_duration, 
      event_actual_duration: event_actual_duration, 
      event_address: event_address,
      event_city: event_city, 
      event_state: event_state, 
      event_zip: event_zip, 
      event_space_capacity: event_space_capacity, 
      table_types: table_types, 
      number_sewers: number_sewers, 
      machines_volunteered: machines_volunteered, 
      event_expected_adults: event_expected_adults, 
      event_expected_children: event_expected_children, 
      event_actual_adults: event_actual_adults, 
      event_actual_children: event_actual_children, 
      jen_story: jen_story, 

      pockets_brought: pockets_brought, 
      pockets_in_progress: pockets_in_progress, 
      pockets_finished: pockets_finished, 

      collars_brought: collars_brought, 
      collars_in_progress: collars_in_progress, 
      collars_finished: collars_finished, 
      
      envenlopes_brought: envenlopes_brought,
      envenlopes_in_progress: envenlopes_in_progress,  
      envenlopes_finished: envenlopes_finished, 

      vests_brought: vests_brought, 
      vests_in_progress: vests_in_progress, 
      vests_finished: vests_finished, 
      
      completed_product: completed_product, 

     })
     .then(() => {
       res.redirect('/'); // Redirect to the list of events after saving -> FIX THIS ROUTE, IT WILL BE WRONG
     })
     .catch(error => {
       console.log('Error updating Event:', error);
       res.status(500).send('Internal Server Error');
     });
 });



//  this is the post route to delete an event

    <form action="/deleteEvent/<%= row.id %>" method="POST" style="display:inline;">
      <button type="submit" onclick="return confirm('Are you sure you want to delete this record?');">Delete</button>
    </form>



  // POST ROUTE FOR DELETING characters
app.post('/deleteEvent/:id', (req, res) => {
  const id = req.params.id;
  knex('events')
  .where('id', id)
  .del() // Deletes the record with the specified ID
  .then(() => {
    res.redirect('/'); // Redirect to the events list after deletion
  })
  // error handling
  .catch(error => {
    console.error('Error deleting this Event:', error);
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

  
  
  const preferred_contact = req.body.preferred_contact

  


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

      

      preferred_contact: preferred_contact, 

       

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