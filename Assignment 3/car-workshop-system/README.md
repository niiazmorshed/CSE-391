# Car Workshop Appointment System

A complete web application for managing car workshop appointments with client booking system and admin panel.

## Features

### User Panel
- **Client Information Form**: Name, Address, Phone, Car License, Engine Number
- **Appointment Scheduling**: Date selection with mechanic preference
- **Mechanic Selection**: View available mechanics with real-time slot availability
- **Form Validation**: Client-side and server-side validation
- **Appointment Confirmation**: Success notifications with appointment details

### Admin Panel
- **Appointment Management**: View all appointments in organized table
- **Edit Appointments**: Change dates and reassign mechanics
- **Filter & Search**: Filter by date and mechanic
- **Statistics Dashboard**: Real-time appointment stats
- **Status Management**: Update appointment status (Confirmed, Pending, Completed, Cancelled)

### System Features
- **Mechanic Capacity Control**: Maximum 4 appointments per mechanic per day
- **Duplicate Prevention**: Prevents multiple bookings for same client/car on same date
- **Real-time Updates**: Live availability updates
- **Responsive Design**: Mobile-friendly interface
- **MongoDB Integration**: Robust data storage and retrieval

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MongoDB
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Installation

### Prerequisites
1. PHP 7.4 or higher
2. MongoDB (Local installation or MongoDB Atlas)
3. Composer (PHP package manager)
4. Web server (Apache/Nginx) or local development server

### Setup Instructions

1. **Clone or download the project files**
   ```bash
   mkdir car-workshop
   cd car-workshop
   # Copy all provided files to this directory
   ```

2. **Install MongoDB PHP Driver**
   ```bash
   composer require mongodb/mongodb
   ```

3. **Configure MongoDB Connection**
   
   Edit `config.php` and update MongoDB connection settings:
   
   **For MongoDB Atlas (Cloud):**
   ```php
   $mongoUri = "mongodb+srv://username:password@cluster.mongodb.net/workshop?retryWrites=true&w=majority";
   ```
   
   **For Local MongoDB:**
   ```php
   $mongoUri = "mongodb://localhost:27017";
   ```

4. **Set up Web Server**
   
   **Using PHP Built-in Server (Development):**
   ```bash
   php -S localhost:8000
   ```
   
   **Using Apache/Nginx:**
   - Place files in web server document root
   - Ensure PHP is configured to handle .php files

5. **Update API Base URL**
   
   In both `script.js` and `admin.js`, update the API base URL:
   ```javascript
   const API_BASE_URL = 'http://your-domain.com/workshop-api';
   // or for local development:
   const API_BASE_URL = 'http://localhost:8000';
   ```

## File Structure

```
car-workshop/
├── index.html          # Client booking page
├── admin.html          # Admin panel
├── styles.css          # Stylesheet for both pages
├── script.js           # Client page JavaScript
├── admin.js            # Admin panel JavaScript
├── config.php          # Database configuration
├── get_mechanics.php   # API: Get mechanics with availability
├── book_appointment.php # API: Create new appointment
├── get_appointments.php # API: Get all appointments
├── update_appointment.php # API: Update appointment
├── delete_appointment.php # API: Delete appointment
├── composer.json       # PHP dependencies
├── vendor/            # Composer packages (created after install)
└── README.md          # This file
```

## API Endpoints

### GET /get_mechanics.php
- **Purpose**: Retrieve all mechanics with availability
- **Parameters**: `date` (optional) - Check availability for specific date
- **Response**: List of mechanics with available slots

### POST /book_appointment.php
- **Purpose**: Create new appointment
- **Required Fields**: clientName, clientPhone, clientAddress, carLicense, carEngine, appointmentDate, mechanicId
- **Validation**: Checks for duplicates, mechanic availability, date validation

### GET /get_appointments.php
- **Purpose**: Retrieve all appointments
- **Response**: List of appointments sorted by creation date

### POST /update_appointment.php
- **Purpose**: Update existing appointment
- **Required Fields**: appointmentId, appointmentDate, mechanicId
- **Optional Fields**: status

### POST /delete_appointment.php
- **Purpose**: Delete appointment
- **Required Fields**: appointmentId

## Database Schema

### Collections

**mechanics**
```json
{
  "_id": ObjectId,
  "name": "John Smith",
  "specialization": "Engine Repair",
  "experience": 8,
  "available_slots": 4
}
```

**appointments**
```json
{
  "_id": ObjectId,
  "clientName": "John Doe",
  "clientPhone": "(555) 123-4567",
  "clientAddress": "123 Main St, City",
  "carLicense": "ABC123",
  "carEngine": "ENG456789",
  "appointmentDate": "2024-01-15T00:00:00.000Z",
  "mechanicId": "507f1f77bcf86cd799439011",
  "status": "confirmed",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

## Business Logic

1. **Maximum Capacity**: Each mechanic can handle 4 appointments per day
2. **No Duplicate Bookings**: Same phone or car license can't book twice on same date
3. **Date Validation**: Appointments can't be scheduled for past dates
4. **Mechanic Validation**: Selected mechanic must exist and be available
5. **Status Management**: Appointments can be confirmed, pending, completed, or cancelled

## Validation Rules

### Client Side
- Name: Letters and spaces only, minimum 2 characters
- Phone: Minimum 10 digits, formatted display
- Address: Minimum 10 characters
- License: Alphanumeric, converted to uppercase
- Engine: Alphanumeric only, minimum 5 characters
- Date: Must be today or future date
- Mechanic: Must be selected from available options

### Server Side
- All client validations plus:
- MongoDB ObjectId validation
- Duplicate appointment checking
- Mechanic capacity verification
- Date range validation

## Customization

### Adding More Mechanics
Modify the `initializeMechanics()` function in `get_mechanics.php`:

```php
$mechanics = [
    ['name' => 'New Mechanic', 'specialization' => 'Specialty', 'experience' => 5],
    // Add more mechanics
];
```

### Changing Appointment Capacity
Update the capacity check in relevant PHP files (currently set to 4):

```php
if ($mechanicAppointmentCount >= 4) { // Change 4 to desired capacity
```

### Styling Customization
Modify `styles.css` to change:
- Color scheme (CSS variables at top of file)
- Layout and spacing
- Typography
- Responsive breakpoints

## Security Features

1. **Input Sanitization**: All inputs are sanitized and validated
2. **SQL Injection Prevention**: Using MongoDB ODM prevents injection
3. **XSS Protection**: HTML entities escaped on output
4. **CORS Headers**: Configured for cross-origin requests
5. **Error Handling**: Secure error messages without sensitive data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service is running
   - Verify connection string in config.php
   - Ensure network access for MongoDB Atlas

2. **Composer Dependencies Missing**
   ```bash
   composer install
   ```

3. **CORS Issues**
   - Verify API_BASE_URL in JavaScript files
   - Check server CORS configuration
   - Ensure preflight requests are handled

4. **Permission Errors**
   - Check file permissions for PHP files
   - Ensure web server can read/write files

### Debug Mode
Enable debug mode by updating config.php:
```php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper validation
4. Test thoroughly
5. Submit pull request

## License

This project is open source and available under the MIT License.

## Support

For support or questions:
1. Check this README for common issues
2. Review the code comments for implementation details
3. Test API endpoints using tools like Postman
4. Verify MongoDB connection and data structure