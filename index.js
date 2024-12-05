let express = require("express");
require('dotenv').config(); // Load environment variables
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { OpenAI } = require('openai'); // Correctly import OpenAI

// Create the express app
let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json()); // For parsing JSON requests

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
    maxAge: 60 * 60 * 1000 // 1 hour
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

// Root route renders the landing page
app.get('/', (req, res) => {
  res.render('index', { response: null });
});


app.post('/chat', async (req, res) => {
  const question = req.body.question.toLowerCase();

  let botResponse;

  // General matching for key topics for chat bot
  if (question.includes("turtle shelter") || question.includes("mission") || question.includes("project")) {
      botResponse = "The Turtle Shelter Project provides portable foam vests for individuals experiencing homelessness to help protect them from freezing temperatures. Learn more about our mission here: [Mission Statement](https://turtleshelterproject.org/mission)";
  } else if (question.includes("volunteer") || question.includes("help") || question.includes("make a difference")) {
      botResponse = "You can make a difference by volunteering! Visit our 'You Can Make a Difference' page to learn how you can help: [Volunteer Here](https://turtleshelterproject.org/you-can-make-a-difference)";
  } else if (question.includes("jen") || question.includes("story") || question.includes("founder")) {
      botResponse = "Jen's story is the inspiration behind the Turtle Shelter Project. Discover her journey and what led her to start this initiative here: [Jen's Story](https://turtleshelterproject.org/jens-story)";
  } else if (question.includes("donate") || question.includes("donation")) {
      botResponse = "Your donations help provide critical resources for those in need. Visit our donation page to contribute: [Donate Now](https://turtleshelterproject.org/donate)";
  } else if (question.includes("vest") || question.includes("vests")) {
        botResponse = "Learn more about our innovative tech, including protective vests, on our technology page: [Our Tech](https://turtleshelterproject.org/our-tech)";
  } else if (question.includes("contact") || question.includes("reach out") || question.includes("get in touch")) {
      botResponse = "You can get in touch with us by visiting our contact page: [Contact Us](https://turtleshelterproject.org/contact)";
  } else if (question.includes("locations") || question.includes("where you operate") || question.includes("cities")) {
      botResponse = "The Turtle Shelter Project operates in various locations to help individuals facing homelessness. For more specific location information, please visit our locations page: [Locations](https://turtleshelterproject.org/locations)";
  } else if (question.includes("impact") || question.includes("how many people helped") || question.includes("results")) {
      botResponse = "The Turtle Shelter Project has made a significant impact, providing warmth and protection to individuals in need. For detailed impact information, visit our impact page: [Our Impact](https://turtleshelterproject.org/impact)";
  } else if (question.includes("funding") || question.includes("sponsors") || question.includes("partners")) {
      botResponse = "We are grateful to our sponsors and partners who help make this project possible. You can learn more about them here: [Our Partners](https://turtleshelterproject.org/partners)";
  } else if (question.includes("how it works") || question.includes("process") || question.includes("how can I help")) {
      botResponse = "The Turtle Shelter Project operates by distributing portable foam vests to individuals in need. You can help by donating, volunteering, or spreading awareness. Learn more here: [How It Works](https://turtleshelterproject.org/how-it-works)";
  } else if (question.includes("volunteer opportunities") || question.includes("volunteering") || question.includes("get involved")) {
      botResponse = "We offer various volunteer opportunities to get involved. Check out the volunteer page for more details: [Volunteer Opportunities](https://turtleshelterproject.org/volunteer)";
  } else if (question.includes("history") || question.includes("beginning") || question.includes("how it started")) {
      botResponse = "The Turtle Shelter Project was founded with the mission to provide warmth and shelter to those facing homelessness. To learn about its history, visit: [Our History](https://turtleshelterproject.org/history)";
  } else if (question.includes("donation tax") || question.includes("tax deductible")) {
      botResponse = "Yes, your donations are tax-deductible. You can find more information about tax benefits here: [Tax Deductible Donations](https://turtleshelterproject.org/donate)";
  } else if (question.includes("news") || question.includes("latest updates") || question.includes("blog")) {
      botResponse = "Stay up-to-date with the latest news and updates from the Turtle Shelter Project by visiting our blog: [Blog](https://turtleshelterproject.org/blog)";
  } else if (question.includes("faq") || question.includes("frequently asked questions")) {
      botResponse = "For answers to common questions, visit our FAQ page: [FAQs](https://turtleshelterproject.org/faq)";
  } else {
      botResponse = "Sorry, I couldn't find information about that. Please visit our website for more details.";
  }

  res.json({ response: botResponse });
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
  const volunteer_zip	 = parseInt(req.body.volunteer_zip);
  const volunteer_referral = req.body.volunteer_referral;
  const volunteer_willing_hours = req.body.volunteer_willing_hours;
  const volunteer_sewing_level = req.body.volunteer_sewing_level;
  const volunteer_preferred_contact = req.body.volunteer_preferred_contact;
  const volunteer_lead = req.body.volunteer_lead === 'true';
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

// Send to the page to edit the admin
app.get('/editAdmin', (req, res) => {
  // Check if they are logged in
  if (!req.session.admin) {
  res.redirect('/adminLogin');
  }
  
  knex('volunteers')
  .select('*')
  .where('username', req.session.username)
  .first()
  .then((user) => {
    res.render('editAdmin', {volunteer: user});
  });
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
      // console.log("Unavailable Dates from DB:", unavailableDatesArray);
      res.render('eventSignup', { unavailableDates: unavailableDatesArray });

    })
    .catch((error) => {
      // Log the error and respond with a user-friendly message
      console.error('Error fetching unavailable dates:', error);
      res.status(500).send('Internal Server Error: Unable to retrieve unavailable dates.');
    });
});

app.get('/unavailable-dates', (req, res) => {
  knex('events')
    .select('event_date')
    .then((results) => {
      const unavailableDatesArray = results
        .map((dateObj) => dateObj.event_date)
        .filter((date) => date !== null); // Filter out invalid dates

      // console.log("Unavailable Dates Sent via API:", unavailableDatesArray);
      res.json(unavailableDatesArray); // Send JSON response
    })
    .catch((error) => {
      console.error('Error fetching unavailable dates:', error);
      res.status(500).json({ error: 'Unable to fetch unavailable dates.' });
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


  // Sanitize optional fields
  const sanitizedBackupDate2 = event_backup_date_2 || null;
  const sanitizedMachinesVolunteered = machines_volunteered ? parseInt(machines_volunteered, 10) : 0;
  const sanitizedExpectedChildren = event_expected_children ? parseInt(event_expected_children, 10) : 0;
  const sanitizedNumberSewers = number_sewers ? parseInt(number_sewers, 10) : 0;

  const data = {
    event_date,
    event_backup_date,
    event_backup_date_2: sanitizedBackupDate2, // Optional: handle null
    event_type: event_type.toLowerCase(),
    event_start_time,
    event_expected_duration,
    event_address: event_address.toLowerCase(),
    event_city: event_city.toLowerCase(),
    event_state: event_state.toLowerCase(),
    event_zip,
    event_space_capacity,
    number_sewers: sanitizedNumberSewers, // Optional: default to 0,
    machines_volunteered: sanitizedMachinesVolunteered, // Optional: default to 0,
    event_expected_adults,
    event_expected_children: sanitizedExpectedChildren, // Optional: default to 0,
    table_types: table_types.toLowerCase(),
    jen_story: jen_story.toLowerCase(),
    contact_first_name: contact_first_name.toLowerCase(),
    contact_last_name: contact_last_name.toLowerCase(),
    contact_email: contact_email.toLowerCase(),
    contact_phone,
    contact_preferred_contact: contact_preferred_contact.toLowerCase(),
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

    // Check if they are logged in
    if (!req.session.admin) {
      res.redirect('/adminLogin');
    }

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






// THIS ALLOWS THE ADMIN TO View all EVENTS
app.get('/eventMaintenance', (req, res) => {

  // Check if they are logged in
  if (!req.session.admin) {
    res.redirect('/adminLogin');
  }

  const currentDate = new Date();  // This should create a valid Date object
  
  if (isNaN(currentDate)) {
    console.log('Error: Invalid current date');
    res.status(500).send('Server error: Invalid current date');
    return;
  }
  knex.select('*').from('events').orderBy('event_date', 'desc')
      .then(events => {
        const upcomingEvents = events.filter(event => new Date(event.event_date) > currentDate);
        const pastEvents = events.filter(event => new Date(event.event_date) <= currentDate);
      
      // Render the view and pass the data
      res.render('events', { upcomingEvents, pastEvents }); 
      })
  });




// THIS ALLOWS THE ADMIN TO EDIT EVENTS
app.get('/editEvents/:id', async (req, res) => {

    // Check if they are logged in
    if (!req.session.admin) {
      res.redirect('/adminLogin');
    }

  let id = req.params.id;
  // Query the Event by ID 
  let chosenEvent;
  try {
  chosenEvent = await knex('events') 
    .where('eventid', id)
    .first()
    if (!chosenEvent) {
        return res.status(404).send('Event not found');
    }
   } catch {(error => {
    console.log('Error fetching Event for editing:', error);
    res.status(500).send('Internal Server Error');
    });
  }

  let volunteers_attended;
  try {// Function to get event volunteers with a dynamic eventid
    volunteers_attended = await knex('eventvolunteers as ev')
          .innerJoin('volunteers as v', 'ev.volunteerid', 'v.volunteerid')
          .where('ev.eventid', id)
          .pluck('ev.volunteerid');
      } catch (error) {
        console.error('Error fetching event volunteers:', error);
        throw error;
      }

  let matchedVolunteers;
  try {
    matchedVolunteers = await knex('volunteers')
    .select('volunteerid', 'volunteer_first_name', 'volunteer_last_name')
    .where('volunteer_state', chosenEvent.event_state)
    .orderBy('volunteer_last_name');
  } catch (error) {
    console.log('Error fetching Volunteers:', error);
    res.status(500).send('Internal Server Error');
  }


  res.render('editEvents', { event : chosenEvent , volunteers : matchedVolunteers, eventvolunteers : volunteers_attended });
});

// THIS ALLOWS THE ADMIN TO EDIT UPCOMING EVENTS
app.get('/editUpcomingEvents/:id', (req, res) => {

    // Check if they are logged in
    if (!req.session.admin) {
      res.redirect('/adminLogin');
    }

  let id = req.params.id;
  // Query the Event by ID 
  knex('events') 
    .where('eventid', id)
    .first()
    .then(event => {
    if (!event) {
        return res.status(404).send('Event not found');
    }
    res.render('editUpcomingEvents', { event });
    })
    .catch(error => {
    console.log('Error fetching Event for editing:', error);
    res.status(500).send('Internal Server Error');
    });
});





app.post('/updateEvents/:id', async (req, res) => {
  const id = req.params.id;

  let volunteerIDs = req.body.volunteers_attended;


  const contact_first_name = req.body.contact_first_name
  const contact_last_name = req.body.contact_last_name
  const contact_phone = req.body.contact_phone
  const contact_email = req.body.contact_email
  const contact_preferred_contact = req.body.contact_preferred_contact
  const event_type = req.body.event_type
  
  // Extract the date fields from the request body
  const event_date = req.body.event_date
  const event_backup_date = req.body.event_backup_date
  let event_backup_date_2 = req.body.event_backup_date_2

  // Handle empty or invalid dates by setting them to null if they are empty strings
  // const event_backup_date_2 = req.body.event_backup_date_2.trim() === "" ? null : req.body.event_backup_date_2;

  if (!event_backup_date_2) {
    event_backup_date_2 = null;
  }
  

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
  const envelopes_brought = req.body.envelopes_brought
  const envelopes_in_progress = req.body.envelopes_in_progress
  const envelopes_finished = req.body.envelopes_finished
  const vests_brought = req.body.vests_brought
  const vests_in_progress = req.body.vests_in_progress
  const vests_finished = req.body.vests_finished
  const completed_products = req.body.completed_products

  // Update the Events in the database
  try { 
  await knex('events') 
     .where('eventid', id)
     .update({

      contact_first_name: contact_first_name, 
      contact_last_name: contact_last_name, 
      contact_phone: contact_phone, 
      contact_email: contact_email, 
      contact_preferred_contact: contact_preferred_contact, 
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
      envelopes_brought: envelopes_brought,
      envelopes_in_progress: envelopes_in_progress,  
      envelopes_finished: envelopes_finished, 
      vests_brought: vests_brought, 
      vests_in_progress: vests_in_progress, 
      vests_finished: vests_finished, 
      completed_products: completed_products, 

     })

      // This adds the volunteers to the eventvolunteers table
      let insertPromises = volunteerIDs.map(volID => {
      return knex('eventvolunteers')
        .insert({
          eventid: id,
          volunteerid: volID
      });
    });

      await Promise.all(insertPromises);

      res.redirect('/eventMaintenance'); // Redirect to the list of events after saving
    } catch {(error => {
       console.log('Error updating Event:', error);
       res.status(500).send('Internal Server Error');
     });
    }
});




// POST ROUTE TO PUSH UPDATED CHANGES FROM UPCOMING EVENTS
 app.post('/updateUpcomingEvents/:id', (req, res) => {
  const id = req.params.id;

  const contact_first_name = req.body.contact_first_name
  const contact_last_name = req.body.contact_last_name
  const contact_phone = req.body.contact_phone
  const contact_email = req.body.contact_email
  const contact_preferred_contact = req.body.contact_preferred_contact
  const event_type = req.body.event_type
  
  // Extract the date fields from the request body
  const event_date = req.body.event_date
  const event_backup_date = req.body.event_backup_date
  let event_backup_date_2 = req.body.event_backup_date_2

  // Handle empty or invalid dates by setting them to null if they are empty strings
  // const event_backup_date_2 = req.body.event_backup_date_2.trim() === "" ? null : req.body.event_backup_date_2;

  if (!event_backup_date_2) {
    event_backup_date_2 = null;
  }
  

  const event_start_time = req.body.event_start_time
  const event_expected_duration = req.body.event_expected_duration
  
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

  const jen_story = req.body.jen_story

 

  // Update the Events in the database
    knex('events') 
     .where('eventid', id)
     .update({

      contact_first_name: contact_first_name, 
      contact_last_name: contact_last_name, 
      contact_phone: contact_phone, 
      contact_email: contact_email, 
      contact_preferred_contact: contact_preferred_contact, 
      event_type: event_type, 
      event_date: event_date,
      event_backup_date: event_backup_date, 
      event_backup_date_2: event_backup_date_2, 
      event_start_time: event_start_time, 
      event_expected_duration: event_expected_duration, 
      
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
 
      jen_story: jen_story, 
    

     })
     .then(() => {
       res.redirect('/eventMaintenance'); // Redirect to the list of events after saving -> FIX THIS ROUTE, IT WILL BE WRONG
     })
     .catch(error => {
       console.log('Error updating Event:', error);
       res.status(500).send('Internal Server Error');
     });
 });




  // POST ROUTE FOR DELETING Past Events
app.post('/deleteEvents/:id', (req, res) => {
  const id = req.params.id;
  knex('events')
  .where('eventid', id)
  .del() // Deletes the record with the specified ID
  .then(() => {
    res.redirect('/eventMaintenance'); // Redirect to the events list after deletion
  })
  // error handling
  .catch(error => {
    console.error('Error deleting this Event:', error);
    res.status(500).send('Internal Server Error');
    });
  });


    // POST ROUTE FOR DELETING Upcoming Events
app.post('/deleteUpcomingEvents/:id', (req, res) => {
  const id = req.params.id;
  knex('events')
  .where('eventid', id)
  .del() // Deletes the record with the specified ID
  .then(() => {
    res.redirect('/eventMaintenance'); // Redirect to the events list after deletion
  })
  // error handling
  .catch(error => {
    console.error('Error deleting this Event:', error);
    res.status(500).send('Internal Server Error');
    });
  });


// THIS IS FOR volunteers.EJS -> for the admin to EDIT INFO FOR VOLUNTEERS
app.get('/volunteerMaintenance', (req, res) => {

    // Check if they are logged in
    if (!req.session.admin) {
      res.redirect('/adminLogin');
    }

  knex.select('*').from('volunteers').orderBy('volunteer_last_name')
  .then(volunteers => {
    res.render('volunteers', {volunteers});
  })
});

app.get('/editVolunteer/:id', (req, res) => {

    // Check if they are logged in
    if (!req.session.admin) {
      res.redirect('/adminLogin');
    }

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


app.post('/updateAdmin/:id', (req, res) => {
  const id = req.params.id; // this is how you pull out the parameter TO SEE WHAT admin YOU ARE DEALING WITH

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
      res.redirect('/adminIndex'); // Redirect to the index page after saving
    })
    .catch(error => {
      console.error('Error updating Volunteer:', error);
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



// Allows the server to listen
app.listen(port, () => console.log("Express App has started and server is listening on http://localhost:" + port));