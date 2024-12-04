let express = require("express");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

// Create the express app
let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // TODO Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));


// Connects to the locally hosted database
const knex = require("knex") ({
  client : "pg",
  connection : {
      host : process.env.RDS_HOSTNAME || "awseb-e-ivmpumma37-stack-awsebrdsdatabase-upatlbu0rklt.cp6ss68iifrg.us-east-1.rds.amazonaws.com",
      user : process.env.RDS_USERNAME || "intexUser",
      password : process.env.RDS_PASSWORD || "Thisisforintex1!",
      database : process.env.RDS_DB_NAME || "ebdb",
      port : process.env.RDS_PORT ||  5432,
      ssl : process.env.DB_SSL ? {rejectUnauthorized : false} : {rejectUnauthorized : false}
  }
});

app.get('/', (req, res) => {
  knex.select('*').from('events')
  .then(events => {
    res.render('index', {events});
  })
  });

app.get('/eventSignup/', (req, res) => {
    res.render('eventSignup')
});

app.get('/donationCompletion/', (req, res) => {
  res.render('donationCompletion')
});

//This is the GET route to access the Volunteer Sign Up Page. Upon loading, we insert an array of state abberviations
// to eliminate as much human error as we know how. These values will populate the state dropdown on the page
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

// This POST route runs when a user submits the form located on the Volunteer Sign Up page. It passes in all of the data
// they entered, most of which is required. Here we insert that data into our Database as a new record. We default the
// admin field as false, and leave the username and password as null until management reaches out to this new employee
app.post('/volunteerSignup/', (req, res) => {

  const volunteer_first_name = req.body.volunteer_first_name;
  const volunteer_last_name = req.body.volunteer_last_name;
  const volunteer_email = req.body.volunteer_email;
  const volunteer_phone = req.body.volunteer_phone;
  const volunteer_address = req.body.volunteer_address;
  const volunteer_city = req.body.volunteer_city;
  const volunteer_state = req.body.volunteer_state;
  const volunteer_zip	 = req.body.volunteer_zip;
  const volunteer_referral = req.body.volunteer_referral;
  const volunteer_willing_hours = req.body.volunteer_willing_hours;
  const volunteer_sewing_level = req.body.volunteer_sewing_level;
  const volunteer_preferred_contact = req.body.volunteer_preferred_contact;
  const volunteer_lead = req.body.volunteer_lead;
  const admin = 'false';

  knex('volunteers')
    .insert({
      volunteer_first_name: volunteer_first_name.toLowerCase(),
      volunteer_last_name: volunteer_last_name.toLowerCase(),
      volunteer_email: volunteer_email,
      volunteer_phone: volunteer_phone,
      volunteer_address: volunteer_address.toLowerCase(),
      volunteer_city: volunteer_city.toLowerCase(),
      volunteer_state: volunteer_state,
      volunteer_zip: volunteer_zip,
      volunteer_referral: volunteer_referral,
      volunteer_willing_hours: volunteer_willing_hours,
      volunteer_sewing_level: volunteer_sewing_level,
      volunteer_preferred_contact: volunteer_preferred_contact,
      volunteer_lead: volunteer_lead,
      admin: admin
    })

    // We redirect the user back to the landing page, but notify them that their submission is being processed
    .then(() => {
      res.redirect('/volunteerSignup');
  })
  .catch(error => {
    console.error('Error adding Volunteer:', error);
    res.status(500).send('Internal Server Error');
});
});

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
    res.render('adminLogin', {error: null})
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
      // Query the user table to find the record
      const user = await knex('volunteers')
          .select('*')
          .where({ username }) // Find user by username
          .first(); // Returns the first matching record

      if (user && user.password === password) { // Replace with hashed password comparison in production
          req.session.admin = true;
          req.session.username = username;
          res.render('adminIndex', { admin : req.session.admin });

      } else {
        req.session.admin = false;
          res.render('adminLogin', { error: 'Invalid credentials' }); // Render login page with error
      }
  } catch (error) {
      res.status(500).send('Database query failed: ' + error.message);
  }
});

app.get('/adminIndex', (req, res) => {
  if (req.session.admin) {
    res.render('adminIndex', { admin: req.session.admin });
  } else {
    res.redirect('/adminLogin');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/');
  });
});

// This is for the eventSignup.ejs
app.get('/eventSignup', (req, res) => {
  knex('events')
    .select('event_date')
    .then((results) => {
      // Extract event_date values and ensure they are valid dates
      const unavailableDatesArray = results
        .map((dateObj) => dateObj.event_date)
        .filter((date) => date !== null); // Remove null or invalid dates if any

      // Pass the unavailable dates array to the EJS template
      res.render('eventSignup', { unavailableDates: unavailableDatesArray });
    })
    .catch((error) => {
      // Log the error and respond with a user-friendly message
      console.error('Error fetching unavailable dates:', error);
      res.status(500).send('Internal Server Error: Unable to retrieve unavailable dates.');
    });
});


app.post('/submit-event-request', (req, res) => {
  // Extract form data from the request body
  const {
    event_date,
    back_up_date: event_backup_date,
    back_up_date_2: event_backup_date_2,
    event_type,
    event_start_time,
    desired_event_duration: event_expected_duration,
    event_address,
    event_city,
    event_state,
    event_zip,
    event_space_capacity,
    number_sewers,
    machines_volunteered,
    event_expected_adults,
    event_expected_children,
    table_types,
    jen_story,
    requestee_first_name: contact_first_name,
    requestee_last_name: contact_last_name,
    requestee_email: contact_email,
    requestee_phone: contact_phone,
    preferred_contact_method: contact_preferred_contact,
  } = req.body;

  const data = {
    event_date,
    event_backup_date,
    event_backup_date_2,
    event_type,
    event_start_time,
    event_expected_duration,
    event_address,
    event_city,
    event_state,
    event_zip,
    event_space_capacity,
    number_sewers,
    machines_volunteered,
    event_expected_adults,
    event_expected_children,
    table_types,
    jen_story,
    contact_first_name: contact_first_name.toLowerCase(),
    contact_last_name: contact_last_name.toLowerCase(),
    contact_email,
    contact_phone,
    contact_preferred_contact,
  };

  // Use Knex.js to insert data into the 'event_requests' table
  knex('events')
    .insert(data)
    .then(() => {
      // Redirect to a confirmation page or send a success response
      res.redirect('/'); // Redirect to a success page
    })
    .catch((error) => {
      // Log and handle errors
      console.error('Error adding Event Request:', error);
      res.status(500).send('Internal Server Error');
    });
});



// THIS ALLOWS THE ADMIN TO VIEW ALL THE UPCOMING AND PAST EVENTS 
app.get('/viewEvents', async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const upcomingEvents = await knex('events').where('event_date', '>=', currentDate);
    const pastEvents = await knex('events').where('event_date', '<', currentDate);

    res.render('events', {
      upcomingEvents: upcomingEvents,
      pastEvents: pastEvents
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching events');
  }
});



// THIS ALLOWS THE ADMIN TO EDIT EVENTS
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
    knex('events') 
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
       res.redirect('/adminIndex'); // Redirect to the list of events after saving -> FIX THIS ROUTE, IT WILL BE WRONG
     })
     .catch(error => {
       console.log('Error updating Event:', error);
       res.status(500).send('Internal Server Error');
     });
 });



  // POST ROUTE FOR DELETING characters
app.post('/deleteEvent/:id', (req, res) => {
  const id = req.params.id;
  knex('events')
  .where('id', id)
  .del() // Deletes the record with the specified ID
  .then(() => {
    res.redirect('/adminIndex'); // Redirect to the events list after deletion
  })
  // error handling
  .catch(error => {
    console.error('Error deleting this Event:', error);
    res.status(500).send('Internal Server Error');
    });
  });


// THIS IS FOR volunteers.EJS -> for the admin to EDIT INFO FOR VOLUNTEERS
app.get('/volunteerMaintenance', (req, res) => {
  knex.select('*').from('volunteers').orderBy('volunteer_last_name')
  .then(volunteers => {
    res.render('volunteers', {volunteers});
  })
});

app.get('/editVolunteer/:id', (req, res) => {

  let id = req.params.id; // to extract a parameter out of the route ^^^ , id is the parameter ID; if it was num, do req.params.num
  // using it to find the record in the database
  
  // Query the Volunteer by ID first
  knex('volunteers')
      // don't need a select, it is basically select *
    .where('volunteerid', id) // go to the table where the PARAMETER(which is id) = id in the pokemon table
    .first() // the query will come back as an array, but we say I just want the first record which then it becomes an object with NO ARRAY (BECAUSE ID IS THE PRIMARY KEY!!, which is why I get only 1 record (and play i have a .first()))
    .then(volunteer => { // store this first record/value that is returned from this query as the variable pokemon
      if (!volunteer) {
        return res.status(404).send('Volunteer not found');
      }
      else {
        res.render("editVolunteer", {volunteer});// if the record is found, render the editVolunteer.ejs file and pass the volunteer
      }

    })
    .catch(error => {
      console.log('Error fetching Volunteer for editing:', error);
      res.status(500).send('Internal Server Error');
    });
  });


app.post('/updateVolunteer/:id', (req, res) => {
  const id = req.params.id; // this is how you pull out the parameter TO SEE WHAT volunteer YOU ARE DEALING WITH

  const first_name = req.body.volunteer_first_name
  const last_name = req.body.volunteer_last_name
  const volunteer_email = req.body.volunteer_email
  const volunteer_phone = req.body.volunteer_phone
  const volunteer_street_address = req.body.volunteer_address
  const volunteer_city = req.body.volunteer_city
  const volunteer_state = req.body.volunteer_state
  const volunteer_zip = req.body.volunteer_zip
  const volunteer_preferred_contact = req.body.volunteer_preferred_contact
  const volunteer_willing_hours = parseInt(req.body.volunteer_willing_hours)
  const sewing_level = req.body.sewing_level
  const volunteer_referral = req.body.volunteer_referral
  const volunteer_admin = req.body.admin === 'true'
  const volunteer_lead = req.body.volunteer_lead === 'true'
  const username = req.body.username
  const password = req.body.password

  // Update the Volunteer in the database
  knex('volunteers')
    .where('volunteerid', id)
    // LEFT: column names IN THE TABLE ALREADY
    // RIGHT: values you want to store in the database that were entered into the FORM! CAN USE VARIABLES BC YOU MADE CONST ONES ABOVE
    // description could have been req.body.description, but since we made these variables up top, we can just use the variables here
    .update({
      volunteer_first_name: first_name, 
      volunteer_last_name: last_name, 
      volunteer_email: volunteer_email,
      volunteer_phone: volunteer_phone,
      volunteer_address: volunteer_street_address, 
      volunteer_city: volunteer_city, 
      volunteer_state: volunteer_state, 
      volunteer_zip: volunteer_zip,
      volunteer_referral: volunteer_referral, 
      volunteer_willing_hours: volunteer_willing_hours,
      volunteer_sewing_level: sewing_level,
      volunteer_preferred_contact: volunteer_preferred_contact,
      admin: volunteer_admin,
      volunteer_lead: volunteer_lead,
      username: username,
      password: password
    })

    .then(() => {
      res.redirect('/volunteerMaintenance'); // Redirect to the list of volunteers after saving
    })
    .catch(error => {
      console.error('Error updating Volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
    });


  // LETS YOU DELETE A VOLUNTEER 
  app.post('/deleteVolunteer/:id', (req, res) => {
    const id = req.params.id;
    knex('volunteers') // put the name of the database here
      .where('volunteerid', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/volunteerMaintenance'); // Redirect to the volunteers list after deletion
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