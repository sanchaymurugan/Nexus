
'use client';
import { Firestore, collection, addDoc, serverTimestamp, writeBatch } from "firebase/firestore";

const sampleConversations = [
  {
    headline: "Flight to NYC",
    messages: [
      { role: "user", content: "Hi, I need to book a flight to New York City for next Friday." },
      { role: "assistant", content: "Of course! I can help with that. Do you have a preferred airline or departure time?" },
      { role: "user", content: "I prefer to fly with Delta and would like to leave in the morning." },
      { role: "assistant", content: "Great. I found a Delta flight departing at 8:30 AM from your nearest airport. The price is $250. Would you like me to book it?" },
      { role: "user", content: "Yes, that sounds perfect. Please book it for me." },
      { role: "assistant", content: "Your flight to NYC has been booked successfully! You'll receive a confirmation email shortly. Is there anything else I can help you with?" },
    ],
  },
  {
    headline: "Monthly Expenses",
    messages: [
      { role: "user", content: "Can you give me a summary of my spending for last month?" },
      { role: "assistant", content: "Certainly. Last month, your total spending was $2,345. Your largest categories were 'Rent' at $1,200, 'Groceries' at $450, and 'Transportation' at $200." },
      { role: "user", content: "How does that compare to the month before?" },
      { role: "assistant", content: "Your spending is up by about 10% compared to the previous month, mainly due to an increase in the 'Dining Out' category." },
      { role: "user", content: "Okay, I need to watch that. Thanks for the breakdown." },
    ],
  },
  {
    headline: "Appointment Booking",
    messages: [
      { role: "user", content: "I need to schedule a dentist appointment for a cleaning." },
      { role: "assistant", content: "I can help with that. Your usual dentist is Dr. Smith. Does next Tuesday at 2:00 PM work for you?" },
      { role: "user", content: "I'm busy then. Is there anything available on Wednesday morning?" },
      { role: "assistant", content: "Yes, there is an opening at 10:00 AM on Wednesday. Shall I book it for you?" },
      { role: "user", content: "Perfect, please book it." },
      { role: "assistant", content: "You're all set! Your appointment with Dr. Smith is scheduled for this Wednesday at 10:00 AM. I've sent a calendar invitation to your email." },
    ],
  },
];

export async function seedSampleData(firestore: Firestore, userId: string) {
  const batch = writeBatch(firestore);

  for (const convo of sampleConversations) {
    const sessionRef = collection(firestore, `users/${userId}/sessions`);
    const newSessionDoc = await addDoc(sessionRef, {
        userId: userId,
        headline: convo.headline,
        updatedAt: serverTimestamp(),
        isSample: true,
    });
    
    const messagesCol = collection(firestore, `users/${userId}/sessions/${newSessionDoc.id}/messages`);
    for (const msg of convo.messages) {
       const newMsgRef = await addDoc(messagesCol, {
           ...msg,
           createdAt: serverTimestamp()
       });
    }
  }
}
