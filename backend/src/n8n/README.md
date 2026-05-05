# n8n Integration for MediFollow Appointments

This integration provides automated email notifications for appointment workflows in the MediFollow system.

## Features

- **Appointment Confirmation**: Sends email to patients when appointments are approved/confirmed
- **Appointment Reminders**: Sends reminder emails (and SMS if available) 24 hours before appointments
- **Cancellation Notifications**: Notifies relevant parties when appointments are cancelled
- **Follow-up Automation**: Triggers follow-up workflows for completed appointments

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install @nestjs/axios
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# Email Configuration (for n8n email node)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (optional, for Twilio integration)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. n8n Setup

1. **Install n8n** (if not already installed):
```bash
npm install n8n -g
# or use Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

2. **Start n8n**:
```bash
n8n start
```

3. **Access n8n**:
Open `http://localhost:5678` in your browser

4. **Import Workflows**:
- Go to n8n interface
- Click "Import from file"
- Import the workflow templates from `src/n8n/workflows/`:
  - `appointment-email-confirmation.json`
  - `appointment-reminder.json`
  - `appointment-cancellation.json`

5. **Configure Email Node**:
- In each workflow, configure the "Send Email" node with your SMTP settings
- Set the "From" email address (e.g., `appointments@medifollow.com`)

6. **Activate Workflows**:
- Toggle each workflow to "Active" status
- Note the webhook URLs for each workflow

### 4. Workflow Configuration

#### Appointment Confirmation Workflow
- **Trigger**: Webhook endpoint `/appointment-confirmed`
- **Action**: Sends confirmation email to patient
- **Includes**: Appointment details, doctor info, location, video call instructions

#### Appointment Reminder Workflow
- **Trigger**: Webhook endpoint `/appointment-reminder`
- **Action**: Sends reminder email 24h before appointment
- **Optional**: Sends SMS reminder if phone number available

#### Cancellation Workflow
- **Trigger**: Webhook endpoint `/appointment-cancelled`
- **Action**: Notifies doctor and admin about cancellation

### 5. Test the Integration

1. **Test n8n Connection**:
```bash
curl -X POST http://localhost:3000/n8n/test-connection
```

2. **Test Webhook**:
```bash
curl -X POST http://localhost:3000/n8n/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "appointment-email-confirmation", "data": {"test": true}}'
```

3. **Test Full Flow**:
- Create an appointment via the API
- Approve the appointment
- Check for email notification

## API Endpoints

### n8n Controller Endpoints

- `POST /n8n/test-connection` - Test n8n connectivity
- `POST /n8n/trigger-workflow` - Manually trigger a workflow
- `GET /n8n/status` - Get n8n integration status

### Appointment Triggers

The system automatically triggers n8n workflows on these events:

1. **Appointment Created** (`triggerAppointmentCreated`)
2. **Appointment Approved** (`triggerAppointmentApproved`)
3. **Appointment Cancelled** (`triggerAppointmentCancelled`)
4. **Appointment Completed** (`triggerAppointmentCompleted`)
5. **Appointment Reminder** (`triggerAppointmentReminder`)

## Email Templates

### Confirmation Email Template
```
Subject: Appointment Confirmed - {appointmentType}

Dear {patientName},

Your appointment has been confirmed!

Appointment Details:
- Date: {appointmentDate}
- Time: {appointmentTime}
- Type: {appointmentType}
- Doctor: {doctorName}
- Location: {location}
- Video Call: {isVideoCall}

Please arrive 15 minutes early and bring your ID and insurance card.

Thank you,
MediFollow Team
```

### Reminder Email Template
```
Subject: Appointment Reminder - {appointmentType} Tomorrow

Dear {patientName},

This is a friendly reminder about your upcoming appointment:

Appointment Details:
- Date: {appointmentDate}
- Time: {appointmentTime}
- Type: {appointmentType}
- Doctor: {doctorName}
- Location: {location}

Please remember to:
- Arrive 15 minutes early
- Bring your ID and insurance card
- Bring any relevant medical records

We look forward to seeing you!

MediFollow Team
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Install missing dependencies
```bash
npm install @nestjs/axios @types/node
```

2. **n8n Connection Failed**:
- Check n8n is running on correct port
- Verify API key in environment variables
- Check network connectivity

3. **Email Not Sending**:
- Verify SMTP configuration in n8n email node
- Check email credentials
- Verify firewall settings

4. **Workflow Not Triggering**:
- Check webhook URLs are correct
- Verify workflows are active in n8n
- Check n8n logs for errors

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

### Logs

Check logs for:
- Backend: `npm run start:dev` console output
- n8n: n8n interface → "Executions" tab

## Security Considerations

1. **API Key Security**: Store n8n API key securely in environment variables
2. **Email Security**: Use app-specific passwords for email accounts
3. **Webhook Security**: Consider adding authentication to webhook endpoints
4. **Data Privacy**: Ensure patient data is handled according to HIPAA/GDPR requirements

## Monitoring

Monitor the integration through:
- n8n execution logs
- Backend application logs
- Email delivery reports
- Error tracking systems

## Future Enhancements

- SMS integration with Twilio
- Calendar integration (Google Calendar, Outlook)
- Multi-language email templates
- Patient preference management
- Advanced scheduling rules
- Analytics and reporting dashboard
