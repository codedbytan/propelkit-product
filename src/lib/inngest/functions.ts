import { inngest } from "./client";

// Example background function - customize for your needs
export const exampleBackgroundJob = inngest.createFunction(
  { id: "example-background-job" },
  { event: "app/example.trigger" },
  async ({ event, step }) => {
    // Your background job logic here
    await step.run("process-task", async () => {
      console.log("Processing background task:", event.data);
      return { success: true };
    });
  }
);

// Add more functions here as needed
// Example: Send welcome email, process payments, generate reports, etc.
