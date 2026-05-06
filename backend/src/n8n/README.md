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

### 5. Team merge checklist (every developer after `git pull`)

n8n credentials and “activate/publish” **do not live in Git**. Each machine must:

1. **Import or refresh workflows** from `backend/src/n8n/workflows/` (`appointment-email-confirmation.json`, `appointment-reminder.json`).
2. **SMTP inside n8n**: Open **Send Confirmation Email** / **Send Reminder Email** → attach **SMTP** (or Gmail) credentials. This is separate from the NestJS `SMTP_*` vars in `.env` (those power the app’s own mailer).
   - Use an app password for Gmail, allow SMTP, and set **From** to an address your provider accepts (often the same as the SMTP user unless you configured aliases).
3. **Activate the workflow** so production webhooks work:
   - Self-hosted: turn **Inactive → Active** on the workflow.
   - n8n Cloud / projects UI: **Publish** when prompted so the production webhook URL is registered (otherwise only **Listen for test event** / `webhook-test/...` runs).
4. **Backend `.env`**: set `N8N_BASE_URL` (see root `backend/.env.example`). Optional `N8N_API_KEY` only if your n8n instance requires it on webhook requests.
5. **Webhook paths** must stay aligned with `backend/src/n8n/n8n.service.ts` (e.g. `appointment-email-confirmation` → `/webhook/appointment-confirmed`).

Email templates in the JSON use **`{{ $json.field }}`** on the Send Email node so they still work if you duplicate nodes (avoid relying on fragile `$node['Prepare Email Data']` names). **Log Success** still references the Prepare node by name—keep that node named **Prepare Email Data** or adjust the expression after renames.

### 6. Test the Integration

1. **Status**:
```bash
curl -s http://localhost:3000/api/n8n/status
```

2. **Trigger confirmation workflow through the API** (same payload shape as production):
```bash
curl -s -X POST http://localhost:3000/api/n8n/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"appointment-email-confirmation","data":{"eventName":"appointment.approved","appointment":{"_id":"demo-1","patientId":{"email":"you@example.com","firstName":"Jane","lastName":"Doe"},"doctorName":"Dr. Smith","date":"2026-05-15","time":"09:00","type":"checkup","location":"Main Clinic","isVideoCall":false},"timestamp":"2026-05-06T12:00:00.000Z"}}'
```

3. **End-to-end**: confirm an appointment in the app (or use the curl above) and check **Executions** in n8n.

See repo **`DEMONSTRATION_COMMANDS.txt`** for more curl examples (direct `webhook` vs `webhook-test`).

## API Endpoints

### n8n Controller Endpoints

(Global prefix `api`, e.g. `GET /api/n8n/status`.)

- `POST /api/n8n/test-connection` - Test n8n connectivity
- `POST /api/n8n/trigger-workflow` - Manually trigger a workflow
- `GET /api/n8n/status` - Get n8n integration status

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
- Configure **SMTP credentials on the Email node in n8n** (most common fix after Webhook + Code succeed).
- Match **From** address to what your SMTP provider allows.
- Backend `SMTP_*` vars do **not** configure n8n’s mail nodes.

4. **Workflow Not Triggering**:
- Use **`/webhook/...`** only when the workflow is **Active** / **Published**; use **`/webhook-test/...`** only while listening in the editor.
- Check `N8N_BASE_URL` in backend `.env` matches where n8n runs.
- Verify webhook paths (see `n8n.service.ts` mapping).

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
