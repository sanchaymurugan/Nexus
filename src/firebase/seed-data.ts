'use client';
import { Firestore, collection, writeBatch, serverTimestamp, doc } from "firebase/firestore";

const sampleConversations = [
  {
    headline: "Flight to NYC",
    messages: [
      { role: "user", content: "Hi Nexus, I need to book a round-trip flight to New York City for next Friday, returning on Sunday." },
      { role: "assistant", content: "Of course! I can help with that. To find the best options, could you please tell me your departure airport and if you have a preferred airline or departure time?" },
      { role: "user", content: "I'll be flying from SFO. I prefer to fly with Delta and would like to leave in the morning on Friday and return Sunday evening." },
      { role: "assistant", content: "Great. I found a Delta flight departing SFO at 8:30 AM next Friday and returning from JFK at 7:00 PM on Sunday. The total price is $350. Would you like me to book it?" },
      { role: "user", content: "Yes, that sounds perfect. Please book it for me." },
      { role: "assistant", content: "Your flight to NYC has been booked successfully! You'll receive a confirmation email shortly. Is there anything else I can help you with?" },
      { role: "user", content: "No, that's all. Thank you, Nexus!" },
    ],
  },
  {
    headline: "Monthly Expenses",
    messages: [
      { role: "user", content: "Hey Nexus, can you give me a summary of my spending for last month?" },
      { role: "assistant", content: "Certainly. Last month, your total spending was $2,345. Your largest categories were 'Rent' at $1,200, 'Groceries' at $450, and 'Transportation' at $200." },
      { role: "user", content: "How does that compare to the month before?" },
      { role: "assistant", content: "Your spending is up by about 10% compared to the previous month, mainly due to an increase in the 'Dining Out' category." },
      { role: "user", content: "Okay, I need to watch that. Can you set a budget reminder if my 'Dining Out' spending goes over $150 this month?" },
      { role: "assistant", content: "Budget reminder set. I'll notify you if your 'Dining Out' expenses exceed $150 this month. Anything else?" },
       { role: "user", content: "That's it, thank you Nexus!" },
    ],
  },
  {
    headline: "Appointment Booking",
    messages: [
      { role: "user", content: "Hi Nexus, I need to schedule a dentist appointment for a cleaning." },
      { role: "assistant", content: "I can help with that. Your usual dentist is Dr. Smith. Does next Tuesday at 2:00 PM work for you?" },
      { role: "user", content: "I'm busy then. Is there anything available on Wednesday morning?" },
      { role: "assistant", content: "Yes, there is an opening at 10:00 AM on Wednesday. Shall I book it for you?" },
      { role: "user", content: "Perfect, please book it." },
      { role: "assistant", content: "You're all set! Your appointment with Dr. Smith is scheduled for this Wednesday at 10:00 AM. I've sent a calendar invitation to your email." },
      { role: "user", content: "Great. Thanks so much, Nexus!" },
    ],
  },
];

export async function seedSampleData(firestore: Firestore, userId: string) {
  const batch = writeBatch(firestore);

  for (const convo of sampleConversations) {
    // Create a new document reference for the session *first*.
    const sessionRef = doc(collection(firestore, `users/${userId}/sessions`));
    
    // Set the session data in the batch.
    batch.set(sessionRef, {
        userId: userId,
        headline: convo.headline,
        updatedAt: serverTimestamp(),
        isSample: true,
    });
    
    // Add all messages for that session to the batch.
    for (const msg of convo.messages) {
       const messageRef = doc(collection(firestore, `users/${userId}/sessions/${sessionRef.id}/messages`));
       batch.set(messageRef, {
           ...msg,
           createdAt: serverTimestamp()
       });
    }
  }
  
  // Commit the batch once for all operations.
  await batch.commit();
}
