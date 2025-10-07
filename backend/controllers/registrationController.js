
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";
import transporter from "../config/nodemailer.js";

// Helper function to send email using transporter
const sendEmail = async (emailOptions) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@campusevents.com',
            to: emailOptions.to,
            subject: emailOptions.subject,
            html: emailOptions.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { notes, phoneNumber, collegeId, department, year } = req.body;

        // Check if event exists and is published
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (!event.published) {
            return res.status(400).json({ success: false, message: "Event is not published" });
        }

        // Check registration deadline
        if (event.regDeadline && new Date() > new Date(event.regDeadline)) {
            return res.status(400).json({ success: false, message: "Registration deadline has passed" });
        }

        // Check if user is already registered
        const existingRegistration = await Registration.findOne({
            event: eventId,
            user: req.user.id
        });

        if (existingRegistration) {
            return res.status(400).json({ success: false, message: "Already registered for this event" });
        }

        // Check capacity
        const currentRegistrations = await Registration.countDocuments({
            event: eventId,
            status: { $in: ['pending', 'approved'] }
        });

        if (currentRegistrations >= event.capacity) {
            return res.status(400).json({ success: false, message: "Event is full" });
        }

        // Create registration
        const registration = new Registration({
            event: eventId,
            user: req.user.id,
            notes,
            phoneNumber,
            collegeId,
            department,
            year
        });

        await registration.save();
        
         // Update event registration count - ADD THIS
         await updateEventRegistrationCount(eventId);


        // Populate the registration with event and user details
        await registration.populate('event', 'title startDate venue');
        await registration.populate('user', 'name email');

        // Send confirmation email with error handling
        try {
            await sendEmail({
                to: req.user.email,
                subject: `Registration Confirmation - ${event.title}`,
                html: `
                    <h2>Registration Confirmed!</h2>
                    <p>Dear ${req.user.name},</p>
                    <p>You have successfully registered for <strong>${event.title}</strong>.</p>
                    <p><strong>Event Details:</strong></p>
                    <ul>
                        <li>Date: ${new Date(event.startDate).toLocaleDateString()}</li>
                        <li>Venue: ${event.venue}</li>
                        <li>Status: Pending Approval</li>
                    </ul>
                    <p>You will receive another email once your registration is approved.</p>
                `
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        res.status(201).json({ 
            success: true, 
            message: "Registration submitted successfully", 
            registration 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const registrations = await Registration.find({ event: eventId })
            .populate('user', 'name email college')
            .sort({ createdAt: -1 });

        res.json({ success: true, registrations });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status, adminNotes } = req.body;

        const registration = await Registration.findById(registrationId)
            .populate('event', 'title startDate venue')
            .populate('user', 'name email');

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        const oldStatus = registration.status;
        registration.status = status;
        if (adminNotes) registration.adminNotes = adminNotes;
        
        await registration.save();

        // Update event registration count if status changed to/from active status - ADD THIS
        if (oldStatus !== status) {
            await updateEventRegistrationCount(registration.event._id);
        }

        // Send status update email with error handling
        let emailSubject, emailBody;
        
        if (status === 'approved') {
            emailSubject = `Registration Approved - ${registration.event.title}`;
            emailBody = `
                <h2>Registration Approved!</h2>
                <p>Dear ${registration.user.name},</p>
                <p>Your registration for <strong>${registration.event.title}</strong> has been approved.</p>
                <p><strong>Event Details:</strong></p>
                <ul>
                    <li>Date: ${new Date(registration.event.startDate).toLocaleDateString()}</li>
                    <li>Venue: ${registration.event.venue}</li>
                    <li>Status: Approved</li>
                </ul>
                <p>We look forward to seeing you at the event!</p>
            `;
        } else if (status === 'rejected') {
            emailSubject = `Registration Update - ${registration.event.title}`;
            emailBody = `
                <h2>Registration Status Update</h2>
                <p>Dear ${registration.user.name},</p>
                <p>Your registration for <strong>${registration.event.title}</strong> has been ${status}.</p>
                ${adminNotes ? `<p><strong>Notes from organizer:</strong> ${adminNotes}</p>` : ''}
            `;
        }

        if (emailSubject) {
            try {
                await sendEmail({
                    to: registration.user.email,
                    subject: emailSubject,
                    html: emailBody
                });
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
            }
        }

        res.json({ success: true, message: `Registration ${status} successfully`, registration });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id })
            .populate('event', 'title startDate endDate venue image category published')
            .sort({ createdAt: -1 });

        res.json({ success: true, registrations });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const cancelRegistration = async (req, res) => {
  try {
      const { registrationId } = req.params;

      const registration = await Registration.findById(registrationId)
          .populate('event', 'title startDate')
          .populate('user', 'name email');

      if (!registration) {
          return res.status(404).json({ success: false, message: "Registration not found" });
      }


      const eventId = registration.event;

      // Verify the registration belongs to the current user
      if (registration.user._id.toString() !== req.user.id) {
          return res.status(403).json({ success: false, message: "Not authorized" });
      }

      // DELETE the registration completely from database
      await Registration.findByIdAndDelete(registrationId);

       // Update event registration count - ADD THIS
       await updateEventRegistrationCount(eventId);

      res.json({ success: true, message: "Registration cancelled successfully" });

  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};

export const getRegistrationStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const registration = await Registration.findOne({ 
            event: eventId, 
            user: req.user.id 
        }).populate('event', 'title startDate venue');

        if (registration) {
            return res.json({ 
                success: true, 
                isRegistered: true, 
                registration 
            });
        } else {
            return res.json({ 
                success: true, 
                isRegistered: false 
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Add this to your registrationController.js
export const getPendingRegistrations = async (req, res) => {
  try {
      console.log("🔍 Fetching pending registrations...");
      
      const registrations = await Registration.find({ status: 'pending' })
          .populate('event', 'title startDate startTime venue')
          .populate('user', 'name email')
          .sort({ createdAt: -1 });

      console.log(`📋 Found ${registrations.length} pending registrations`);
      
      // Log each registration for debugging
      registrations.forEach(reg => {
          console.log(`📝 Registration: ${reg._id}, Event: ${reg.event?.title}, User: ${reg.user?.name}`);
      });

      res.json({ 
          success: true, 
          registrations 
      });

  } catch (err) {
      console.error("❌ Error fetching pending registrations:", err);
      res.status(500).json({ 
          success: false, 
          message: err.message 
      });
  }
};

// Helper function to update event registration count
const updateEventRegistrationCount = async (eventId) => {
    try {
        console.log(`🔄 Updating registration count for event: ${eventId}`);
        
        const activeRegistrationsCount = await Registration.countDocuments({
            event: eventId,
            status: { $in: ['pending', 'approved'] }
        });
        
        console.log(`📊 New count for event ${eventId}: ${activeRegistrationsCount}`);
        
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { registeredCount: activeRegistrationsCount },
            { new: true }
        );
        
        if (!updatedEvent) {
            console.error(`❌ Event ${eventId} not found when updating count`);
            return;
        }
        
        console.log(`✅ Successfully updated count for event: ${eventId} to ${activeRegistrationsCount}`);
        return activeRegistrationsCount;
    } catch (error) {
        console.error('❌ Error updating event registration count:', error);
    }
};