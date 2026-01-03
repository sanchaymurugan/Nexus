'use client';
import { Firestore, collection, writeBatch, serverTimestamp, doc } from "firebase/firestore";

const sampleConversations = [
  {
    headline: "Flight to NYC",
    messages: [
      { role: "user", content: "Hi Nexus, I need to book a round-trip flight to New York City." },
      { role: "assistant", content: "Of course! To find the best options, could you please tell me your departure city, destination, and your desired travel dates?" },
      { role: "user", content: "I'll be flying from San Francisco (SFO) to NYC, leaving next Friday and returning that Sunday." },
      { role: "assistant", content: "Got it. And do you have a preferred airline or a specific time of day you'd like to depart and return?" },
      { role: "user", content: "I prefer to fly with Delta and would like to leave in the morning on Friday and return Sunday evening." },
      { role: "assistant", content: "Perfect. I found a Delta flight departing SFO at 8:30 AM next Friday and returning from JFK at 7:00 PM on Sunday. The total price is $350. Would you like me to go ahead and book it?" },
      { role: "user", content: "Yes, that sounds great. Please book it for me." },
      { role: "assistant", content: "Your flight to NYC has been booked successfully! Your confirmation number is DLF456. You'll receive a confirmation email shortly with all the details. Is there anything else?" },
      { role: "user", content: "No, that's all. Thank you for your service, Nexus!" },
    ],
  },
  {
    headline: "Monthly Expenses",
    messages: [
      { role: "user", content: "Hey Nexus, can you give me a summary of my spending for last month?" },
      { role: "assistant", content: "Certainly. I can do that. Which bank account should I analyze?" },
      { role: "user", content: "Please check my main checking account." },
      { role: "assistant", content: "Last month, your total spending from your main checking account was $2,345. Your largest categories were 'Rent' at $1,200, 'Groceries' at $450, and 'Transportation' at $200." },
      { role: "user", content: "How does that compare to the month before?" },
      { role: "assistant", content: "Your spending is up by about 10% compared to the previous month, mainly due to an increase in the 'Dining Out' category." },
      { role: "user", content: "Okay, I need to watch that. Can you set a budget reminder if my 'Dining Out' spending goes over $150 this month?" },
      { role: "assistant", content: "Budget reminder set. I'll notify you if your 'Dining Out' expenses exceed $150 this month. Can I help with anything else?" },
      { role: "user", content: "That's it for now. Thank you for your service, Nexus!" },
    ],
  },
  {
    headline: "Appointment Booking",
    messages: [
      { role: "user", content: "Hi Nexus, I need to schedule a dentist appointment." },
      { role: "assistant", content: "I can help with that. Are you looking for a routine cleaning, or is there a specific issue you need addressed?" },
      { role: "user", content: "Just a routine cleaning." },
      { role: "assistant", content: "Great. Your usual provider is Dr. Smith. Does next Tuesday at 2:00 PM work for you?" },
      { role: "user", content: "I'm busy then. Is there anything available on Wednesday morning?" },
      { role: "assistant", content: "Yes, there is an opening at 10:00 AM on Wednesday. Shall I book it for you?" },
      { role: "user", content: "Perfect, please book it." },
      { role: "assistant", content: "You're all set! Your cleaning appointment with Dr. Smith is scheduled for this Wednesday at 10:00 AM. I've sent a calendar invitation to your email." },
      { role: "user", content: "Excellent. Thank you for your service, Nexus!" },
    ],
  },
  {
    headline: "Bank Payment",
    messages: [
        { role: "user", content: "Hi Nexus, I need to pay my credit card bill." },
        { role: "assistant", content: "Sure thing. Which credit card would you like to pay?" },
        { role: "user", content: "My Visa card ending in 4321." },
        { role: "assistant", content: "The current balance is $258.50. How much would you like to pay?" },
        { role: "user", content: "Pay the full balance." },
        { role: "assistant", content: "And which account should I use for the payment?" },
        { role: "user", content: "Use my primary checking account." },
        { role: "assistant", content: "To confirm: you want to pay $258.50 to your Visa card (4321) from your primary checking account. Is that correct?" },
        { role: "user", content: "Yes, that is correct." },
        { role: "assistant", content: "Payment submitted. Your confirmation number is 789XYZ. The payment will reflect on your account within 1-2 business days." },
        { role: "user", content: "Awesome, thank you for your service, Nexus!" }
    ]
  }
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
